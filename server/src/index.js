import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import kycRoutes from './routes/kyc.routes.js';
import adminRoutes from './routes/admin.routes.js';
import gamesRoutes from './routes/games.routes.js';
import tournamentsRoutes from './routes/tournaments.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { serializeJson } from './middleware/serializeJson.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(serializeJson);

// Limit rezonab sou wout otantifikasyon pou dekouraje bourad/brute-force.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use('/auth', authLimiter, authRoutes);

app.use('/wallet', walletRoutes);
app.use('/kyc', kycRoutes);
app.use('/admin', adminRoutes);
app.use('/games', gamesRoutes);
app.use('/tournaments', tournamentsRoutes);
app.use('/matches', matchesRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mondialito API ap kouri sou pò ${port}`));
