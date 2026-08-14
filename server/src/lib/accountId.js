import { prisma } from './prisma.js';

function randomAccountId() {
  let id = String(1 + Math.floor(Math.random() * 9));
  for (let i = 0; i < 9; i++) id += Math.floor(Math.random() * 10);
  return id;
}

export async function generateUniqueAccountId() {
  for (let i = 0; i < 20; i++) {
    const id = randomAccountId();
    const existing = await prisma.wallet.findUnique({ where: { accountId: id } });
    if (!existing) return id;
  }
  throw new Error('could_not_generate_unique_account_id');
}
