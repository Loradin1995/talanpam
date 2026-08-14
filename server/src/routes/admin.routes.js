import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { applyWalletTransaction, refund, creditPrize } from '../services/walletService.js';
import { logAudit } from '../services/auditService.js';

const router = Router();
router.use(requireAuth, requireAdmin); // TOUT wout anba a mande wòl admin — verifye SÈVÈ-side.

// ---- Depo (kredite yon jwè apre yo resevwa lajan an) ----
router.get('/deposits/search/:accountId', async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { accountId: req.params.accountId },
      include: { user: { include: { kyc: true } } },
    });
    if (!wallet) throw new HttpError(404, 'account_not_found');
    res.json(wallet);
  } catch (err) { next(err); }
});

router.post('/deposits/credit', async (req, res, next) => {
  try {
    const { userId, amount } = req.body;
    const amt = Number(amount);
    if (!userId || !amt || amt <= 0) throw new HttpError(400, 'invalid_input');
    const result = await applyWalletTransaction(userId, amt, 'deposit', {
      note: `Recharge admin`,
      createdByAdminId: req.user.id,
      actorUserId: req.user.id,
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/deposits/recent', async (req, res, next) => {
  try {
    const txs = await prisma.transaction.findMany({ where: { type: 'deposit' }, orderBy: { createdAt: 'desc' }, take: 30 });
    res.json(txs);
  } catch (err) { next(err); }
});

// ---- Retrè ----
router.get('/withdrawals', async (req, res, next) => {
  try {
    const txs = await prisma.transaction.findMany({
      where: { type: 'withdrawal' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { include: { wallet: true } } },
    });
    res.json(txs);
  } catch (err) { next(err); }
});

router.post('/withdrawals/:id/approve', async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') throw new HttpError(400, 'invalid_transaction');
    await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'completed' } });
    await logAudit({ actorUserId: req.user.id, action: 'withdrawal.approve', targetType: 'Transaction', targetId: tx.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/withdrawals/:id/reject', async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') throw new HttpError(400, 'invalid_transaction');
    // Montan an te deja debite lè demand lan fèt — ranbouse l.
    await refund(tx.userId, Math.abs(Number(tx.amount)), {
      referenceType: 'withdrawal_reject', referenceId: tx.id, note: 'Ranbousman — retrè refize', actorUserId: req.user.id,
    });
    await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'cancelled' } });
    await logAudit({ actorUserId: req.user.id, action: 'withdrawal.reject', targetType: 'Transaction', targetId: tx.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---- KYC ----
router.get('/kyc', async (req, res, next) => {
  try {
    const list = await prisma.kycProfile.findMany({ orderBy: { updatedAt: 'desc' }, take: 100, include: { user: true } });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/kyc/:id/review', async (req, res, next) => {
  try {
    const { status, adminNote } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) throw new HttpError(400, 'invalid_status');
    const kyc = await prisma.kycProfile.update({
      where: { id: req.params.id },
      data: { status, adminNote, reviewedBy: req.user.id, reviewedAt: new Date() },
    });
    await logAudit({ actorUserId: req.user.id, action: `kyc.${status}`, targetType: 'KycProfile', targetId: kyc.id });
    res.json(kyc);
  } catch (err) { next(err); }
});

// ---- Itilizatè (ban/deban) ----
router.post('/users/:id/ban', async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: true } });
    await logAudit({ actorUserId: req.user.id, action: 'user.ban', targetType: 'User', targetId: user.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
router.post('/users/:id/unban', async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: false } });
    await logAudit({ actorUserId: req.user.id, action: 'user.unban', targetType: 'User', targetId: user.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---- Paramèt aplikasyon ----
router.get('/settings', async (req, res, next) => {
  try {
    res.json(await prisma.appSetting.findMany());
  } catch (err) { next(err); }
});
router.put('/settings/:key', async (req, res, next) => {
  try {
    const { value, label, category } = req.body;
    const setting = await prisma.appSetting.upsert({
      where: { key: req.params.key },
      update: { value, label, category },
      create: { key: req.params.key, value, label, category },
    });
    res.json(setting);
  } catch (err) { next(err); }
});

// ---- Jesyon tounwa (admin) ----
router.get('/tournaments', async (req, res, next) => {
  try {
    const list = await prisma.tournament.findMany({ include: { game: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/tournaments', async (req, res, next) => {
  try {
    const { gameSlug, title, description, entryFee, costPerAttempt, jackpotSharePct, initialJackpot, attemptsPerFee, maxAttempts, topWinners, prizeDistribution, status, startDate, endDate, bannerImage } = req.body;
    const game = await prisma.game.findUnique({ where: { slug: gameSlug || 'penalty' } });
    if (!game) throw new HttpError(400, 'unknown_game');
    const tournament = await prisma.tournament.create({
      data: {
        gameId: game.id, title, description,
        entryFee: Number(entryFee), costPerAttempt: Number(costPerAttempt),
        jackpotSharePct: Number(jackpotSharePct || 0), initialJackpot: Number(initialJackpot || 0),
        jackpotAmount: Number(initialJackpot || 0),
        attemptsPerFee: Number(attemptsPerFee || 1), maxAttempts: Number(maxAttempts || 5),
        topWinners: Number(topWinners || 1), prizeDistribution: prizeDistribution || [100],
        status: status || 'upcoming',
        startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null,
        bannerImage: bannerImage || null,
      },
    });
    await logAudit({ actorUserId: req.user.id, action: 'tournament.create', targetType: 'Tournament', targetId: tournament.id });
    res.json(tournament);
  } catch (err) { next(err); }
});

router.put('/tournaments/:id', async (req, res, next) => {
  try {
    const { title, description, entryFee, costPerAttempt, jackpotSharePct, attemptsPerFee, maxAttempts, topWinners, prizeDistribution, status, startDate, endDate, bannerImage } = req.body;
    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: {
        title, description,
        entryFee: entryFee !== undefined ? Number(entryFee) : undefined,
        costPerAttempt: costPerAttempt !== undefined ? Number(costPerAttempt) : undefined,
        jackpotSharePct: jackpotSharePct !== undefined ? Number(jackpotSharePct) : undefined,
        attemptsPerFee: attemptsPerFee !== undefined ? Number(attemptsPerFee) : undefined,
        maxAttempts: maxAttempts !== undefined ? Number(maxAttempts) : undefined,
        topWinners: topWinners !== undefined ? Number(topWinners) : undefined,
        prizeDistribution: prizeDistribution || undefined,
        status, bannerImage,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    await logAudit({ actorUserId: req.user.id, action: 'tournament.update', targetType: 'Tournament', targetId: tournament.id });
    res.json(tournament);
  } catch (err) { next(err); }
});

// ---- Jesyon sal fasafas (admin) ----
router.get('/rooms', async (req, res, next) => {
  try {
    const list = await prisma.headToHeadRoom.findMany({ include: { game: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(list);
  } catch (err) { next(err); }
});

router.post('/rooms', async (req, res, next) => {
  try {
    const { gameSlug, name, description, entryCost, prize, color, isActive } = req.body;
    const game = await prisma.game.findUnique({ where: { slug: gameSlug || 'penalty' } });
    if (!game) throw new HttpError(400, 'unknown_game');
    const room = await prisma.headToHeadRoom.create({
      data: { gameId: game.id, name, description, entryCost: Number(entryCost), prize: Number(prize), color, isActive: isActive !== false },
    });
    await logAudit({ actorUserId: req.user.id, action: 'room.create', targetType: 'HeadToHeadRoom', targetId: room.id });
    res.json(room);
  } catch (err) { next(err); }
});

router.put('/rooms/:id', async (req, res, next) => {
  try {
    const { name, description, entryCost, prize, color, isActive } = req.body;
    const room = await prisma.headToHeadRoom.update({
      where: { id: req.params.id },
      data: {
        name, description, color,
        entryCost: entryCost !== undefined ? Number(entryCost) : undefined,
        prize: prize !== undefined ? Number(prize) : undefined,
        isActive,
      },
    });
    await logAudit({ actorUserId: req.user.id, action: 'room.update', targetType: 'HeadToHeadRoom', targetId: room.id });
    res.json(room);
  } catch (err) { next(err); }
});

// ---- Match fasafas an dirèk (admin) ----
router.get('/matches/live', async (req, res, next) => {
  try {
    const matches = await prisma.headToHeadMatch.findMany({
      where: { status: { in: ['waiting', 'in_progress'] } },
      include: {
        room: true,
        player1: { include: { kyc: true } },
        player2: { include: { kyc: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    res.json(matches);
  } catch (err) { next(err); }
});

// Anile yon match an kou — ranbouse toude jwè yo (aksyon admin ijans).
router.post('/matches/:id/cancel', async (req, res, next) => {
  try {
    const match = await prisma.headToHeadMatch.findUnique({ where: { id: req.params.id } });
    if (!match || match.status === 'finished') throw new HttpError(400, 'cannot_cancel');
    await refund(match.player1Id, Number(match.entryCost), { referenceType: 'match_admin_cancel', referenceId: match.id, actorUserId: req.user.id, note: 'Anilasyon admin' });
    if (match.player2Id) {
      await refund(match.player2Id, Number(match.entryCost), { referenceType: 'match_admin_cancel', referenceId: match.id, actorUserId: req.user.id, note: 'Anilasyon admin' });
    }
    const updated = await prisma.headToHeadMatch.update({ where: { id: match.id }, data: { status: 'abandoned', settledAt: new Date() } });
    await logAudit({ actorUserId: req.user.id, action: 'match.admin_cancel', targetType: 'HeadToHeadMatch', targetId: match.id });
    res.json(updated);
  } catch (err) { next(err); }
});

// Fòse yon viktwa (aksyon admin ijans — pa egzanp advèsè ki disparèt).
router.post('/matches/:id/force-win', async (req, res, next) => {
  try {
    const { winnerId } = req.body;
    const match = await prisma.headToHeadMatch.findUnique({ where: { id: req.params.id } });
    if (!match || match.status === 'finished') throw new HttpError(400, 'cannot_force');
    if (![match.player1Id, match.player2Id].includes(winnerId)) throw new HttpError(400, 'invalid_winner');
    await creditPrize(winnerId, Number(match.prize), { referenceType: 'match_admin_force_win', referenceId: match.id, actorUserId: req.user.id, note: 'Viktwa fòse pa admin' });
    const updated = await prisma.headToHeadMatch.update({
      where: { id: match.id },
      data: { status: 'finished', winnerId, settledAt: new Date() },
    });
    await logAudit({ actorUserId: req.user.id, action: 'match.admin_force_win', targetType: 'HeadToHeadMatch', targetId: match.id, meta: { winnerId } });
    res.json(updated);
  } catch (err) { next(err); }
});

// ---- Rapò / estatistik platfòm ----
router.get('/reports', async (req, res, next) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);

    const [wallets, transactions, tournaments, matches, kycList, userCount, bannedCount] = await Promise.all([
      prisma.wallet.findMany({ take: 1000, include: { user: { include: { kyc: true } } } }),
      prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 2000 }),
      prisma.tournament.findMany({ take: 200 }),
      prisma.headToHeadMatch.findMany({ take: 1000 }),
      prisma.kycProfile.findMany({ take: 1000 }),
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    const recentTx = transactions.filter(t => t.createdAt >= cutoff);
    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const avgBalance = wallets.length ? totalBalance / wallets.length : 0;

    const deposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed');
    const recentDeposits = recentTx.filter(t => t.type === 'deposit' && t.status === 'completed');
    const totalDeposited = deposits.reduce((s, t) => s + Number(t.amount), 0);
    const periodDeposited = recentDeposits.reduce((s, t) => s + Number(t.amount), 0);

    const withdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed');
    const recentWithdrawals = recentTx.filter(t => t.type === 'withdrawal' && t.status === 'completed');
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
    const totalWithdrawn = withdrawals.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const periodWithdrawn = recentWithdrawals.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const pendingAmount = pendingWithdrawals.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const finishedMatches = matches.filter(m => m.status === 'finished');
    const pendingMatches = matches.filter(m => m.status === 'waiting' || m.status === 'in_progress');
    const totalChallengePot = finishedMatches.reduce((s, m) => s + Number(m.entryCost) * (m.player2Id ? 2 : 1), 0);
    const totalChallengePrizes = finishedMatches.reduce((s, m) => s + Number(m.prize || 0) * (m.winnerId ? 1 : 0), 0);
    const challengeProfit = totalChallengePot - totalChallengePrizes;

    const activeTournaments = tournaments.filter(t => t.status === 'active');
    const totalJackpots = activeTournaments.reduce((s, t) => s + Number(t.jackpotAmount), 0);
    const tournamentRevenue = transactions.filter(t => t.type === 'entry_fee' && (t.referenceType === 'tournament_entry' || t.referenceType === 'tournament_attempt')).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const kycPending = kycList.filter(k => k.status === 'pending' || k.status === 'submitted').length;
    const kycApproved = kycList.filter(k => k.status === 'approved').length;

    const topPlayers = [...wallets]
      .sort((a, b) => Number(b.totalWon) - Number(a.totalWon))
      .slice(0, 10)
      .map(w => ({
        accountId: w.accountId, balance: Number(w.balance), totalWon: Number(w.totalWon), gamesPlayed: w.gamesPlayed,
        username: w.user?.kyc?.username || w.user?.email?.split('@')[0] || '—',
      }));

    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      dailyMap[key] = { dep: 0, wit: 0, matches: 0 };
    }
    recentTx.filter(t => t.type === 'deposit' && t.status === 'completed').forEach(t => {
      const key = t.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key]) dailyMap[key].dep += Number(t.amount);
    });
    recentTx.filter(t => t.type === 'withdrawal' && t.status === 'completed').forEach(t => {
      const key = t.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key]) dailyMap[key].wit += Math.abs(Number(t.amount));
    });
    matches.filter(m => m.createdAt >= new Date(Date.now() - 7 * 86400000)).forEach(m => {
      const key = m.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (dailyMap[key]) dailyMap[key].matches += 1;
    });

    res.json({
      userCount, bannedCount,
      totalBalance, avgBalance,
      totalDeposited, periodDeposited,
      totalWithdrawn, periodWithdrawn, pendingAmount, pendingCount: pendingWithdrawals.length,
      challengeProfit, totalChallengePot, totalChallengePrizes,
      finishedMatches: finishedMatches.length, pendingMatches: pendingMatches.length,
      activeTournaments: activeTournaments.length, totalJackpots, tournamentRevenue,
      kycPending, kycApproved,
      topPlayers, dailyMap,
    });
  } catch (err) { next(err); }
});

// ---- Jounal odit ----
router.get('/audit-log', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json(logs);
  } catch (err) { next(err); }
});

export default router;
