import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, error);
    }
  },
  log: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message);
    }
  }
};

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch (err) {
    logger.error('Database connection error:', err);
    return false;
  }
}

export async function initializeDatabase() {
  let retries = 3;
  while (retries > 0) {
    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
      logger.log('Database connected successfully');
      return true;
    }
    logger.log(`Database connection failed, retrying... (${retries} attempts left)`);
    retries--;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Failed to connect to database after multiple attempts');
} 