import { prisma } from '../lib/prisma.js';
import { sendMail } from './mailer.js';

const OTP_TTL_MIN = 10;

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueOtp(userId, purpose, email) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
  await prisma.otpCode.create({ data: { userId, code, purpose, expiresAt } });
  await sendMail({
    to: email,
    subject: 'Kòd verifikasyon Mondialito',
    text: `Kòd ou a se: ${code}\nLi valab pou ${OTP_TTL_MIN} minit.`,
  });
}

export async function verifyOtp(userId, purpose, code) {
  const otp = await prisma.otpCode.findFirst({
    where: { userId, purpose, code, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) return false;
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return true;
}
