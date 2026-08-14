import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { debitEntryFee, creditPrize, refund, incrementGamesPlayed } from '../services/walletService.js';
import { getGamePlugin } from '../games/registry.js';

const router = Router();

router.get('/rooms', requireAuth, async (req, res, next) => {
  try {
    const { gameSlug } = req.query;
    const where = { isActive: true };
    if (gameSlug) where.game = { slug: gameSlug };
    const rooms = await prisma.headToHeadRoom.findMany({ where, include: { game: true } });
    res.json(rooms);
  } catch (err) { next(err); }
});

// Jwenn match aktif jwè a genyen (pou l ka repran l si li rechaje paj la)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const match = await prisma.headToHeadMatch.findFirst({
      where: {
        OR: [{ player1Id: req.user.id }, { player2Id: req.user.id }],
        status: { in: ['waiting', 'in_progress'] },
      },
      include: { room: { include: { game: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(match);
  } catch (err) { next(err); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const match = await prisma.headToHeadMatch.findUnique({ where: { id: req.params.id }, include: { room: true } });
    if (!match) throw new HttpError(404, 'not_found');
    if (match.player1Id !== req.user.id && match.player2Id !== req.user.id) throw new HttpError(403, 'forbidden');
    res.json(match);
  } catch (err) { next(err); }
});

// Antre nan yon chanm: jwenn yon match k ap tann, sinon kreye younn.
router.post('/rooms/:roomId/join', requireAuth, async (req, res, next) => {
  try {
    const room = await prisma.headToHeadRoom.findUnique({ where: { id: req.params.roomId }, include: { game: true } });
    if (!room || !room.isActive) throw new HttpError(400, 'room_not_active');

    const already = await prisma.headToHeadMatch.findFirst({
      where: { OR: [{ player1Id: req.user.id }, { player2Id: req.user.id }], status: { in: ['waiting', 'in_progress'] } },
    });
    if (already) throw new HttpError(409, 'already_in_a_match');

    await debitEntryFee(req.user.id, Number(room.entryCost), { referenceType: 'match_entry', referenceId: room.id });

    const plugin = getGamePlugin(room.game.slug);
    const waiting = await prisma.headToHeadMatch.findFirst({
      where: { roomId: room.id, status: 'waiting', player2Id: null, NOT: { player1Id: req.user.id } },
      orderBy: { createdAt: 'asc' },
    });

    let match;
    if (waiting) {
      match = await prisma.headToHeadMatch.update({
        where: { id: waiting.id },
        data: { player2Id: req.user.id, status: 'in_progress' },
      });
    } else {
      match = await prisma.headToHeadMatch.create({
        data: {
          gameId: room.gameId,
          roomId: room.id,
          player1Id: req.user.id,
          status: 'waiting',
          state: plugin.headToHead.initialState(),
          entryCost: room.entryCost,
          prize: room.prize,
        },
      });
    }
    res.json(match);
  } catch (err) { next(err); }
});

async function settleIfFinished(match, result) {
  if (!result.finished) return;
  if (result.winnerSlot) {
    const winnerId = result.winnerSlot === 'p1' ? match.player1Id : match.player2Id;
    await creditPrize(winnerId, Number(match.prize), { referenceType: 'match_win', referenceId: match.id });
  } else {
    // match nul → ranbouse toude
    await refund(match.player1Id, Number(match.entryCost), { referenceType: 'match_draw', referenceId: match.id });
    if (match.player2Id) {
      await refund(match.player2Id, Number(match.entryCost), { referenceType: 'match_draw', referenceId: match.id });
    }
  }
  await incrementGamesPlayed(match.player1Id);
  if (match.player2Id) await incrementGamesPlayed(match.player2Id);
}

router.post('/:id/move', requireAuth, async (req, res, next) => {
  try {
    const { moveType, payload } = req.body;
    const match = await prisma.headToHeadMatch.findUnique({ where: { id: req.params.id }, include: { room: { include: { game: true } } } });
    if (!match) throw new HttpError(404, 'not_found');
    if (match.player1Id !== req.user.id && match.player2Id !== req.user.id) throw new HttpError(403, 'forbidden');
    if (match.status === 'finished') throw new HttpError(400, 'match_already_finished');

    const plugin = getGamePlugin(match.room.game.slug);
    let result;
    try {
      result = plugin.headToHead.applyMove(match, req.user.id, moveType, payload);
    } catch (e) {
      throw new HttpError(400, e.message || 'invalid_move');
    }

    const updated = await prisma.headToHeadMatch.update({
      where: { id: match.id },
      data: {
        state: result.state,
        player1Score: result.player1Score,
        player2Score: result.player2Score,
        winnerId: result.winnerSlot ? (result.winnerSlot === 'p1' ? match.player1Id : match.player2Id) : null,
        status: result.finished ? 'finished' : 'in_progress',
        settledAt: result.finished ? new Date() : null,
      },
    });

    await settleIfFinished(updated, result);
    res.json(updated);
  } catch (err) { next(err); }
});

router.post('/:id/claim-timeout', requireAuth, async (req, res, next) => {
  try {
    const match = await prisma.headToHeadMatch.findUnique({ where: { id: req.params.id }, include: { room: { include: { game: true } } } });
    if (!match) throw new HttpError(404, 'not_found');
    if (match.player1Id !== req.user.id && match.player2Id !== req.user.id) throw new HttpError(403, 'forbidden');
    if (match.status === 'finished') throw new HttpError(400, 'match_already_finished');

    const plugin = getGamePlugin(match.room.game.slug);
    let result;
    try {
      result = plugin.headToHead.applyMove(match, req.user.id, 'claim_timeout', null);
    } catch (e) {
      throw new HttpError(400, e.message || 'cannot_claim_yet');
    }
    const updated = await prisma.headToHeadMatch.update({
      where: { id: match.id },
      data: {
        state: result.state,
        player1Score: result.player1Score,
        player2Score: result.player2Score,
        winnerId: result.winnerSlot === 'p1' ? match.player1Id : match.player2Id,
        status: 'finished',
        settledAt: new Date(),
      },
    });
    await settleIfFinished(updated, result);
    res.json(updated);
  } catch (err) { next(err); }
});

// Anile yon match ki poko jwenn dezyèm jwè a (ranbouse antre a)
router.post('/:id/cancel-waiting', requireAuth, async (req, res, next) => {
  try {
    const match = await prisma.headToHeadMatch.findUnique({ where: { id: req.params.id } });
    if (!match || match.player1Id !== req.user.id || match.status !== 'waiting') throw new HttpError(400, 'cannot_cancel');
    await refund(match.player1Id, Number(match.entryCost), { referenceType: 'match_cancel', referenceId: match.id });
    await prisma.headToHeadMatch.update({ where: { id: match.id }, data: { status: 'abandoned' } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
