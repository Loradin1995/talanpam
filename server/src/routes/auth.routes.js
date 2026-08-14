import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, generateRefreshTokenValue, hashToken, refreshTtlMs } from '../lib/jwt.js';
import { generateUniqueAccountId } from '../lib/accountId.js';
import { issueOtp, verifyOtp } from '../services/otpService.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = Router();

const MIN_AGE_YEARS = Number(process.env.MIN_AGE_YEARS || 18);

function ageFromBirthDate(birthDate) {
  const d = new Date(birthDate);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

async function issueSession(res, user) {
  const accessToken = signAccessToken(user);
  const refreshValue = generateRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshValue),
      expiresAt: new Date(Date.now() + refreshTtlMs()),
    },
  });
  return { accessToken, refreshToken: refreshValue };
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  birthDate: z.string(), // ISO date — obligatwa pou verifye laj AVAN kreyasyon kont
  ageConfirmed18: z.literal(true, { errorMap: () => ({ message: 'Ou dwe konfime ou gen 18 an oswa plis.' }) }),
  tosAccepted: z.literal(true, { errorMap: () => ({ message: 'Ou dwe aksepte Kondisyon Itilizasyon yo.' }) }),
});

// POST /auth/register — kreye kont, verifye laj sèvè-side, voye OTP
router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const age = ageFromBirthDate(body.birthDate);
    if (age < MIN_AGE_YEARS) {
      throw new HttpError(403, `age_below_minimum`);
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new HttpError(409, 'email_already_registered');

    const passwordHash = await bcrypt.hash(body.password, 12);
    const accountId = await generateUniqueAccountId();

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        ageConfirmed18: true,
        tosAcceptedAt: new Date(),
        wallet: { create: { accountId } },
        kyc: { create: { birthDate: new Date(body.birthDate) } },
      },
    });

    await issueOtp(user.id, 'register', user.email);
    res.json({ ok: true, message: 'otp_sent' });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new HttpError(400, err.errors[0]?.message || 'invalid_input'));
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(404, 'user_not_found');

    const ok = await verifyOtp(user.id, 'register', otpCode);
    if (!ok) throw new HttpError(400, 'invalid_or_expired_code');

    await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    const { accessToken, refreshToken } = await issueSession(res, user);
    res.json({ accessToken, refreshToken });
  } catch (err) { next(err); }
});

router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ ok: true }); // pa revele si imèl egziste
    await issueOtp(user.id, 'register', user.email);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, 'invalid_credentials');
    if (user.isBanned) throw new HttpError(403, 'account_banned');

    const valid = await bcrypt.compare(password || '', user.passwordHash);
    if (!valid) throw new HttpError(401, 'invalid_credentials');
    if (!user.emailVerifiedAt) throw new HttpError(403, 'email_not_verified');

    const { accessToken, refreshToken } = await issueSession(res, user);
    res.json({ accessToken, refreshToken });
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new HttpError(400, 'missing_refresh_token');
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new HttpError(401, 'invalid_refresh_token');
    }
    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || user.isBanned) throw new HttpError(401, 'invalid_refresh_token');

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const session = await issueSession(res, user);
    res.json(session);
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) await issueOtp(user.id, 'reset_password', user.email);
    res.json({ ok: true }); // menm repons pou pa revele si imèl egziste
  } catch (err) { next(err); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) throw new HttpError(400, 'password_too_short');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(404, 'user_not_found');
    const ok = await verifyOtp(user.id, 'reset_password', otpCode);
    if (!ok) throw new HttpError(400, 'invalid_or_expired_code');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await logAudit({ actorUserId: user.id, action: 'auth.password_reset', targetType: 'User', targetId: user.id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, async (req, res) => {
  const { passwordHash, ...safe } = req.user;
  res.json(safe);
});

export default router;
