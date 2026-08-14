import { prisma } from '../lib/prisma.js';

export async function logAudit({ actorUserId, action, targetType, targetId, meta }) {
  try {
    await prisma.auditLog.create({
      data: { actorUserId: actorUserId || null, action, targetType, targetId, meta: meta || {} },
    });
  } catch (err) {
    // Odit pa dwe janm bloke yon operasyon biznis — men nou log erè a.
    console.error('audit_log_failed', err);
  }
}
