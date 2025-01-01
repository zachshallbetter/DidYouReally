import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Ensure proper connection handling in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  // Log any connection issues
  prisma.$on('error', (e) => {
    console.log('Prisma Error:', e.message);
  });
  
  prisma.$on('warn', (e) => {
    console.log('Prisma Warning:', e.message);
  });
} 