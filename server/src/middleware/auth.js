import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

// Verifye JWT epi chaje itilizatè a. Rejte si kont bloke.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    // Aksepte tou yon token nan paramèt kèt (?token=) pou lyen ki louvri nan yon nouvo
    // onglet (egzanp: dokiman KYC) kote yo pa ka mete yon header Authorization.
    const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || null);
    if (!token) return res.status(401).json({ error: 'auth_required' });

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'auth_required' });
    if (user.isBanned) return res.status(403).json({ error: 'account_banned' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// Dwe rele APRE requireAuth. Sèl 'admin' ka pase.
// Sa a se pwoteksyon SÈVÈ a — pa depann sèlman de UI kliyan an.
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin_required' });
  }
  next();
}
