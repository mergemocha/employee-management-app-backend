import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { requiresSuperuser } from '../../middlewares'

import check from './routes/check'
import available from './routes/available'
import userGet from './routes/user.get'
import userPatch from './routes/user.patch'

export default async (fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  fastify.get('/available', requiresSuperuser(fastify), available)
  fastify.get('/check', requiresSuperuser(fastify), check)
  fastify.get('/:user', { ...requiresSuperuser(fastify), handler: userGet })
  fastify.patch('/:user', { ...requiresSuperuser(fastify), handler: userPatch })
}
