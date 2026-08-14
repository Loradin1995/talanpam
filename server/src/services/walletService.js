import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logAudit } from './auditService.js';

/**
 * SÈL PWEN DANTRE pou nenpòt bagay ki chanje balans yon jwè.
 *
 * Sa a se fondasyon ki korije pwoblèm kritik nan vèsyon Base44 a: okenn wout
 * kliyan pa gen dwa ekri `balance`/`totalWon`/`totalWagered` dirèkteman. Tout
 * chanjman balans dwe pase pa fonksyon sa a, ki:
 *   1. Ekzekite nan yon transaksyon SQL atomik (balance + Transaction ansanm)
 *   2. Anpeche balans desann anba 0 pou yon debi
 *   3. Kreye yon antre `Transaction` ki gen `balanceAfter` konsistan
 *   4. Ekri yon `AuditLog` pou tras
 *
 * @param {string} userId
 * @param {number} amount  + pou kredi, - pou debi
 * @param {'deposit'|'withdrawal'|'entry_fee'|'prize'|'refund'|'insurance'|'adjustment'} type
 * @param {object} opts { status, referenceType, referenceId, note, createdByAdminId, allowNegativeCheck }
 */
export async function applyWalletTransaction(userId, amount, type, opts = {}) {
  const {
    status = 'completed',
    referenceType = null,
    referenceId = null,
    note = null,
    createdByAdminId = null,
    actorUserId = null,
  } = opts;

  if (!Number.isFinite(amount) || amount === 0) {
    throw new HttpError(400, 'invalid_amount');
  }

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new HttpError(404, 'wallet_not_found');

    const current = Number(wallet.balance);
    const next = Math.round((current + amount) * 100) / 100;

    if (next < 0) {
      throw new HttpError(400, 'insufficient_balance');
    }

    const dataUpdate = { balance: next };
    if (type === 'prize' || (type === 'refund' && amount > 0)) {
      // Wè seksyon "retrè" — sèlman gwo genyen yo (prize) konte kòm "retirable".
    }
    if (type === 'prize') {
      dataUpdate.totalWon = Number(wallet.totalWon) + amount;
    }
    if (type === 'entry_fee') {
      dataUpdate.totalWagered = Number(wallet.totalWagered) + Math.abs(amount);
    }

    const updatedWallet = await tx.wallet.update({ where: { userId }, data: dataUpdate });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        type,
        amount,
        balanceAfter: next,
        status,
        referenceType,
        referenceId,
        note,
        createdByAdminId,
      },
    });

    return { wallet: updatedWallet, transaction };
  });

  await logAudit({
    actorUserId: actorUserId || createdByAdminId || userId,
    action: `wallet.${type}`,
    targetType: 'Wallet',
    targetId: userId,
    meta: { amount, status, referenceType, referenceId, note },
  });

  return result;
}

// Kredite kagnòt/pri e mete l nan "total_won" (sèl sous ki ka retire)
export async function creditPrize(userId, amount, { referenceType, referenceId, note, actorUserId } = {}) {
  return applyWalletTransaction(userId, Math.abs(amount), 'prize', { referenceType, referenceId, note, actorUserId });
}

// Debite pou antre nan tounwa/defi/tantativ
export async function debitEntryFee(userId, amount, { referenceType, referenceId, note, actorUserId } = {}) {
  return applyWalletTransaction(userId, -Math.abs(amount), 'entry_fee', { referenceType, referenceId, note, actorUserId });
}

// Ranbouse (match nul, match anile, retrè refize)
export async function refund(userId, amount, { referenceType, referenceId, note, actorUserId } = {}) {
  return applyWalletTransaction(userId, Math.abs(amount), 'refund', { referenceType, referenceId, note, actorUserId });
}

// Enkremante konte pati jwe — apèl separeman de balans lan, chak fwa yon
// tantativ tounwa oswa yon match fasafas fini.
export async function incrementGamesPlayed(userId) {
  await prisma.wallet.update({ where: { userId }, data: { gamesPlayed: { increment: 1 } } });
}

export async function getWalletSummary(userId) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new HttpError(404, 'wallet_not_found');
  const withdrawnAgg = await prisma.transaction.aggregate({
    where: { userId, type: 'withdrawal', status: { in: ['pending', 'completed'] } },
    _sum: { amount: true },
  });
  const alreadyWithdrawn = Math.abs(Number(withdrawnAgg._sum.amount || 0));
  const withdrawable = Math.max(0, Number(wallet.totalWon) - alreadyWithdrawn);
  return { ...wallet, withdrawable };
}
