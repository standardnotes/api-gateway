import { inject, injectable } from 'inversify'
import * as IORedis from 'ioredis'
import TYPES from '../../Bootstrap/Types'

import { AnalyticsStoreInterface } from '../../Service/AnalyticsStoreInterface'

@injectable()
export class RedisAnalyticsStore implements AnalyticsStoreInterface {
  constructor(
    @inject(TYPES.Redis) private redisClient: IORedis.Redis,
  ) {
  }

  async incrementApplicationVersionUsage(applicationVersion: string): Promise<void> {
    await this.redisClient.incr(`count:action:application-request:${applicationVersion}:timespan:${this.getDailyKey()}`)
    await this.redisClient.incr(`count:action:application-request:${applicationVersion}:timespan:${this.getMonthlyKey()}`)
  }

  async incrementSNJSVersionUsage(snjsVersion: string): Promise<void> {
    await this.redisClient.incr(`count:action:snjs-request:${snjsVersion}:timespan:${this.getDailyKey()}`)
    await this.redisClient.incr(`count:action:snjs-request:${snjsVersion}:timespan:${this.getMonthlyKey()}`)
  }

  private getMonthlyKey() {
    return `${this.getYear()}-${this.getMonth()}`
  }

  private getDailyKey() {
    return `${this.getYear()}-${this.getMonth()}-${this.getDayOfTheMonth()}`
  }

  private getYear(): string {
    return new Date().getFullYear().toString()
  }

  private getMonth(): string {
    return (new Date().getMonth() + 1).toString()
  }

  private getDayOfTheMonth(): string {
    return new Date().getDate().toString()
  }
}
