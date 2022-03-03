import crypto from 'crypto'
import { Prisma, PrismaClient } from '@prisma/client'
import { hashPassword } from '../security/passwords'

function fmtPrismaGeneric (event: Prisma.LogEvent): string {
  return `[prisma => ${event.target}] ${event.message}`
}

export function init (): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' }
    ]
  })

  // Route Prisma logging through Pino
  prisma.$on('error', e => logger.error(fmtPrismaGeneric(e)))
  prisma.$on('info', e => logger.info(fmtPrismaGeneric(e)))
  prisma.$on('warn', e => logger.warn(fmtPrismaGeneric(e)))
  prisma.$on('query', e => {
    logger.debug(`[prisma => ${e.target}] Query: ${e.query} (params: ${e.params}, duration: ${e.duration}ms)`)
  })

  return prisma
}

export async function checkAndCreateSuperuser (prisma: PrismaClient): Promise<void> {
  const superuser = await prisma.user.findFirst({ where: { isSuperuser: true } })

  if (!superuser) {
    const username = 'superuser'
    const password = crypto.randomBytes(32).toString('hex')

    logger.info(`Creating superuser account with the following credentials: username=${username}, password=${password}`)
    logger.info('--- WRITE THESE CREDENTIALS DOWN. IF YOU LOSE THEM, YOU WILL HAVE TO START OVER. ---')

    await prisma.user.create({
      data: {
        username: 'superuser',
        password: await hashPassword(password),
        isSuperuser: true
      }
    })
  }
}