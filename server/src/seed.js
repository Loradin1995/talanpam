// Seed inisyal: kreye kont admin + jwèt "Penalti" + yon tounwa ak kèk chanm defi egzanp.
// Kouri avèk: npm run seed
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';
import { generateUniqueAccountId } from './lib/accountId.js';

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mondialito.example';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMeNow123!';

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const accountId = await generateUniqueAccountId();
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'admin',
        emailVerifiedAt: new Date(),
        ageConfirmed18: true,
        tosAcceptedAt: new Date(),
        wallet: { create: { accountId } },
        kyc: { create: { status: 'approved', firstName: 'Admin', lastName: 'Mondialito' } },
      },
    });
    console.log(`Kont admin kreye: ${adminEmail} / ${adminPassword} (chanje modpas la imedyatman)`);
  } else {
    console.log('Kont admin deja egziste.');
  }

  let game = await prisma.game.findUnique({ where: { slug: 'penalty' } });
  if (!game) {
    game = await prisma.game.create({
      data: {
        slug: 'penalty',
        name: 'Penalti',
        description: 'Jwèt gadyen/tirè — 5 tir kont 5 defans.',
        modes: ['TOURNAMENT', 'HEAD_TO_HEAD'],
      },
    });
    console.log('Jwèt "Penalti" kreye.');
  }

  const existingTournament = await prisma.tournament.findFirst({ where: { gameId: game.id } });
  if (!existingTournament) {
    await prisma.tournament.create({
      data: {
        gameId: game.id,
        title: 'Gran Tounwa Mondialito',
        description: 'Jackpot kumilatif — tantativ san limit (jiska 5 pa jwè).',
        entryFee: 100,
        costPerAttempt: 20,
        jackpotSharePct: 30,
        initialJackpot: 5000,
        jackpotAmount: 5000,
        maxAttempts: 5,
        status: 'active',
      },
    });
    console.log('Tounwa egzanp kreye.');
  }

  const existingRooms = await prisma.headToHeadRoom.count({ where: { gameId: game.id } });
  if (existingRooms === 0) {
    await prisma.headToHeadRoom.createMany({
      data: [
        { gameId: game.id, name: 'Mini', entryCost: 50, prize: 90, color: '#58D68D' },
        { gameId: game.id, name: 'Standard', entryCost: 200, prize: 360, color: '#5DADE2' },
        { gameId: game.id, name: 'VIP', entryCost: 1000, prize: 1800, color: '#FFD700' },
      ],
    });
    console.log('Chanm defi egzanp kreye.');
  }

  console.log('Seed fini.');
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
