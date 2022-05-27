import { inject } from 'inversify'
import * as IORedis from 'ioredis'
import TYPES from '../../Bootstrap/Types'

import { CrossServiceTokenCacheInterface } from '../../Service/Cache/CrossServiceTokenCacheInterface'

export class RedisCrossServiceTokenCache implements CrossServiceTokenCacheInterface {
  private readonly PREFIX = 'cst'

  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
  ) {
  }

  async set(authorizationHeaderValue: string, encodedCrossServiceToken: string, expiresInSeconds: number): Promise<void> {
    await this.redisClient.setex(`${this.PREFIX}:${authorizationHeaderValue}`, expiresInSeconds, encodedCrossServiceToken)
  }

  async get(authorizationHeaderValue: string): Promise<string | null> {
    return this.redisClient.get(`${this.PREFIX}:${authorizationHeaderValue}`)
  }

  async invalidate(authorizationHeaderValue: string): Promise<void> {
    await this.redisClient.del(`${this.PREFIX}:${authorizationHeaderValue}`)
  }
}
