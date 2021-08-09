import { Request, Response } from 'express'
import { BaseHttpController, controller, httpGet } from 'inversify-express-utils'
import { inject } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v2')
export class PaymentsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface
  ) {
    super()
  }

  @httpGet('/subscriptions')
  async subscriptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/features', request.body)
  }
}
