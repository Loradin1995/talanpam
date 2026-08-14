import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const UPLOAD_DIR = process.env.KYC_UPLOAD_DIR || '/data/kyc-uploads';
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// NÒT SEKIRITE: dosye sa a dwe estoke SÈLMAN sou disk prive sèvè a (pa nan yon bucket
// piblik). Aksè fichye a fèt sèlman atravè wout /kyc/document/:id ki verifye
// idantite jwè a oswa wòl admin anvan l sèvi fichye a (wè pi ba).
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const kyc = await prisma.kycProfile.findUnique({ where: { userId: req.user.id } });
    res.json(kyc);
  } catch (err) { next(err); }
});

router.post('/me', requireAuth, upload.single('idDocument'), async (req, res, next) => {
  try {
    const { firstName, lastName, username } = req.body;
    if (!firstName || !lastName) throw new HttpError(400, 'missing_fields');

    const data = {
      firstName,
      lastName,
      status: 'submitted',
    };
    if (username) data.username = username;
    if (req.file) data.idDocumentUrl = `/kyc/document/${req.file.filename}`;

    const kyc = await prisma.kycProfile.update({ where: { userId: req.user.id }, data });
    res.json(kyc);
  } catch (err) { next(err); }
});

// Sèvi dokiman an sèlman bay pwopriyetè a oswa yon admin — JAMAIS piblik.
router.get('/document/:filename', requireAuth, async (req, res, next) => {
  try {
    const { filename } = req.params;
    const owner = await prisma.kycProfile.findFirst({ where: { idDocumentUrl: `/kyc/document/${filename}` } });
    if (!owner) throw new HttpError(404, 'not_found');
    if (owner.userId !== req.user.id && req.user.role !== 'admin') throw new HttpError(403, 'forbidden');
    res.sendFile(path.join(UPLOAD_DIR, filename));
  } catch (err) { next(err); }
});

export default router;
