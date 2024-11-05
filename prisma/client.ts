import { PrismaClient } from '@prisma/client'

// Check if there's already an instance of PrismaClient
// This is useful when using tools like Next.js or hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
