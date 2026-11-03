import { PrismaClient } from '@prisma/client'

// bump this whenever prisma generate runs with a new schema (e.g. new models)
// so a running dev server re-instantiates the client instead of reusing the
// stale globalThis-cached instance from before the schema change
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaGenVersion: string | undefined
}

const GEN_VERSION = 'gen-2026-10-30-dailyquiz'

export const db =
  globalForPrisma.prisma && globalForPrisma.prismaGenVersion === GEN_VERSION
    ? globalForPrisma.prisma
    : new PrismaClient({
        log: ['error'],
      })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
  globalForPrisma.prismaGenVersion = GEN_VERSION
}
