import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Database connection error:', err);
    return false;
  }
}

export async function initializeDatabase() {
  let retries = 3;
  while (retries > 0) {
    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
      // eslint-disable-next-line no-console
      console.log('Database connected successfully');
      return true;
    }
    // eslint-disable-next-line no-console
    console.log(`Database connection failed, retrying... (${retries} attempts left)`);
    retries--;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Failed to connect to database after multiple attempts');
} 