import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Lis jwèt aktif — sa a se sa frontend la itilize pou bati lobi a dinamikman
// olye de kòd an dwa (hardcoded) yon sèl jwèt. Piblik (san auth) pou vizitè
// ka gade katalòg jwèt yo anvan yo enskri, tankou sou lòt platfòm kazino.
router.get('/', async (req, res, next) => {
  try {
    const games = await prisma.game.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    res.json(games);
  } catch (err) { next(err); }
});

export default router;
