import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { debitEntryFee, creditPrize, incrementGamesPlayed } from '../services/walletService.js';
import { getGamePlugin } from '../games/registry.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { gameSlug } = req.query;
    const where = { status: 'active' };
    if (gameSlug) where.game = { slug: gameSlug };
    const tournaments = await prisma.tournament.findMany({ where, include: { game: true }, orderBy: { createdAt: 'desc' } });
    res.json(tournaments);
  } catch (err) { next(err); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id }, include: { game: true } });
    if (!tournament) throw new HttpError(404, 'not_found');
    const myEntry = await prisma.tournamentEntry.findUnique({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId: req.user.id } },
    });
    const leaderboard = await prisma.tournamentEntry.findMany({
      where: { tournamentId: tournament.id },
      orderBy: { bestScore: 'desc' },
      take: 20,
      include: { user: { include: { kyc: true } } },
    });
    res.json({ tournament, myEntry, leaderboard });
  } catch (err) { next(err); }
});

router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id } });
    if (!tournament || tournament.status !== 'active') throw new HttpError(400, 'tournament_not_active');

    const existing = await prisma.tournamentEntry.findUnique({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId: req.user.id } },
    });
    if (existing) throw new HttpError(409, 'already_joined');

    await debitEntryFee(req.user.id, Number(tournament.entryFee), {
      referenceType: 'tournament_entry', referenceId: tournament.id,
    });
    const entry = await prisma.tournamentEntry.create({
      data: { tournamentId: tournament.id, userId: req.user.id, entryPaid: true },
    });
    res.json(entry);
  } catch (err) { next(err); }
});

// Kòmanse yon tantativ: peye kou tantativ la, monte kagnòt la, enkremante konte.
router.post('/:id/start-attempt', requireAuth, async (req, res, next) => {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id } });
    if (!tournament || tournament.status !== 'active') throw new HttpError(400, 'tournament_not_active');
    const entry = await prisma.tournamentEntry.findUnique({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId: req.user.id } },
    });
    if (!entry || !entry.entryPaid) throw new HttpError(400, 'not_joined');
    if (entry.attemptsUsed >= tournament.maxAttempts) throw new HttpError(400, 'max_attempts_reached');

    const cost = Number(tournament.costPerAttempt);
    await debitEntryFee(req.user.id, cost, { referenceType: 'tournament_attempt', referenceId: tournament.id });

    const jackpotContrib = cost * (Number(tournament.jackpotSharePct) / 100);
    await prisma.tournament.update({ where: { id: tournament.id }, data: { jackpotAmount: { increment: jackpotContrib } } });
    const updatedEntry = await prisma.tournamentEntry.update({
      where: { id: entry.id },
      data: { attemptsUsed: { increment: 1 }, totalSpent: { increment: cost } },
    });
    res.json({ entry: updatedEntry });
  } catch (err) { next(err); }
});

// Soumèt rezilta yon tantativ — sèvè a fè yon kontwòl rezonabilite sou skò a.
// (Wè nòt nan games/penalty/index.js sou limit aktyèl anti-triche a.)
router.post('/:id/submit-score', requireAuth, async (req, res, next) => {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id }, include: { game: true } });
    if (!tournament) throw new HttpError(404, 'not_found');
    const entry = await prisma.tournamentEntry.findUnique({
      where: { tournamentId_userId: { tournamentId: tournament.id, userId: req.user.id } },
    });
    if (!entry) throw new HttpError(400, 'not_joined');

    const plugin = getGamePlugin(tournament.game.slug);
    const score = plugin.tournament.validateTournamentScore(Number(req.body.score));

    await prisma.tournamentAttempt.create({ data: { entryId: entry.id, score, rawResult: req.body.rawResult || {} } });

    // Skò monotonik: nou konsève sèlman pi bon eseye a — pi senp e pi jis pase
    // meknism "asirans skò" peyan ki te egziste anvan (li ka bay enpresyon
    // predatè nan yon kontèks jwèt lajan; nou rekòmande pa reenstale l san
    // revizyon konsyan de kondisyon jwèt responsab yo).
    let updatedEntry = entry;
    if (score > entry.bestScore) {
      updatedEntry = await prisma.tournamentEntry.update({ where: { id: entry.id }, data: { bestScore: score } });
    }
    await incrementGamesPlayed(req.user.id);
    res.json({ entry: updatedEntry, score });
  } catch (err) { next(err); }
});

export default router;
