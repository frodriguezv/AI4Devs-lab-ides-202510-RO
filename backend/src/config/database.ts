import { PrismaClient } from '@prisma/client';

// Prisma Client instance with connection pooling
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✓ Database connection established');
  } catch (error: any) {
    console.error('✗ Database connection failed:', error.message);
    console.error('Please ensure:');
    console.error('  1. PostgreSQL is running (check Docker or local PostgreSQL)');
    console.error('  2. DATABASE_URL is correctly set in .env file');
    console.error('  3. Database exists and migrations are applied');
    // Don't exit - let the app start and show errors on first request
  }
}

// Test connection on module load (in development)
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

