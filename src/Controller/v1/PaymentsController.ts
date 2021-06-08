import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1')
export class PaymentsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpGet('/downloads')
  async downloads(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads', request.body)
  }

  @httpGet('/downloads/platforms')
  async platformDownloads(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads/platforms', request.body)
  }
}
