import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import { AnalyticsStoreInterface } from '@standardnotes/analytics'

import TYPES from '../Bootstrap/Types'

@injectable()
export class AnalyticsMiddleware extends BaseMiddleware {
  constructor (
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  async handler (request: Request, _response: Response, next: NextFunction): Promise<void> {
    try {
      const snjsVersion = request.headers['x-snjs-version'] ?? 'unknown'
      await this.analyticsStore.incrementSNJSVersionUsage(snjsVersion as string)

      const applicationVersion = request.headers['x-application-version'] ?? 'unknown'
      await this.analyticsStore.incrementApplicationVersionUsage(applicationVersion as string)
    } catch (error) {
      this.logger.error(`Could not store analytics data: ${error.message}`)
    }

    return next()
  }
}
