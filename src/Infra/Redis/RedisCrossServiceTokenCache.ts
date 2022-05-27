import { inject, injectable } from 'inversify'
import * as IORedis from 'ioredis'
import TYPES from '../../Bootstrap/Types'

import { CrossServiceTokenCacheInterface } from '../../Service/Cache/CrossServiceTokenCacheInterface'

@injectable()
export class RedisCrossServiceTokenCache implements CrossServiceTokenCacheInterface {
  private readonly PREFIX = 'cst'

  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
  ) {
  }

  async set(dto: {
    authorizationHeaderValue: string,
    encodedCrossServiceToken: string,
    expiresInSeconds: number,
    userUuid: string
  }): Promise<void> {
    const pipeline = this.redisClient.pipeline()
    pipeline.setex(`${this.PREFIX}:${dto.userUuid}:${dto.authorizationHeaderValue}`, dto.expiresInSeconds, dto.encodedCrossServiceToken)
    pipeline.setex(`${this.PREFIX}:${dto.authorizationHeaderValue}`, dto.expiresInSeconds, dto.encodedCrossServiceToken)
    await pipeline.exec()
  }

  async get(authorizationHeaderValue: string): Promise<string | null> {
    return this.redisClient.get(`${this.PREFIX}:${authorizationHeaderValue}`)
  }

  async invalidate(userUuid: string): Promise<void> {
    let cursor = '0'
    let authorizationHeaderKeys: Array<string> = []
    do {
      const scanResult = await this.redisClient.scan(cursor, 'MATCH', `${this.PREFIX}:${userUuid}:*`)

      cursor = scanResult[0]
      authorizationHeaderKeys = authorizationHeaderKeys.concat(scanResult[1])
    } while (cursor !== '0')

    if (!authorizationHeaderKeys.length) {
      return
    }

    const pipeline = this.redisClient.pipeline()
    for (const authorizationHeaderKey of authorizationHeaderKeys) {
      pipeline.del(authorizationHeaderKey)
      const authorizationHeaderValue = authorizationHeaderKey.replace(`${this.PREFIX}:${userUuid}:`, '')
      pipeline.del(`${this.PREFIX}:${authorizationHeaderValue}`)
    }
    await pipeline.exec()
  }
}
