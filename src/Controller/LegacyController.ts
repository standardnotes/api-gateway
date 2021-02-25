import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, all, BaseHttpController } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'
import { HttpServiceInterface } from '../Service/HttpClientInterface'

@controller('')
export class LegacyController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  @all('*')
  async legacyProxyToSyncingServerRuby(request: Request, response: Response): Promise<void> {
    this.logger.debug('Calling legacy syncing server on: %s', request.path)

    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }
}
