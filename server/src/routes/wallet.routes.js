import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { getWalletSummary, applyWalletTransaction } from '../services/walletService.js';

const router = Router();
const MIN_WITHDRAW = 100;

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const summary = await getWalletSummary(req.user.id);
    res.json(summary);
  } catch (err) { next(err); }
});

router.get('/me/transactions', requireAuth, async (req, res, next) => {
  try {
    const { type } = req.query;
    const txs = await prisma.transaction.findMany({
      where: { userId: req.user.id, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(txs);
  } catch (err) { next(err); }
});

// Jwè a mande yon retrè — sèvè a debite imedyatman (rezève) e kreye yon Transaction 'pending'.
// Sèl gen yo ('total_won') ka retire, jan règ biznis la mande.
router.post('/withdraw', requireAuth, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount < MIN_WITHDRAW) throw new HttpError(400, 'amount_below_minimum');

    const pending = await prisma.transaction.findFirst({
      where: { userId: req.user.id, type: 'withdrawal', status: 'pending' },
    });
    if (pending) throw new HttpError(409, 'withdrawal_already_pending');

    const summary = await getWalletSummary(req.user.id);
    if (amount > Number(summary.balance)) throw new HttpError(400, 'insufficient_balance');
    if (amount > summary.withdrawable) throw new HttpError(400, 'amount_exceeds_withdrawable');

    const result = await applyWalletTransaction(req.user.id, -amount, 'withdrawal', {
      status: 'pending',
      note: `Demann retrè — ID ${summary.accountId}`,
    });
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
