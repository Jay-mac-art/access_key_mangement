import axios, { AxiosResponse, Method } from 'axios';
import { ErrorMessage } from '../constants/error.message';
import {RefStrings } from '../constants/reference.string'
import { ApplicationLogger } from '../logging/ApplicationLogger';

export class Utils {
  public static async externalRequest(
    provider: string,
    type: string,
    url: string,
    body: any = null,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const logger = new ApplicationLogger();
    try {

      const method: string | undefined =
        RefStrings.meta.requestType[
          type.toLowerCase() as keyof typeof RefStrings.meta.requestType
        ];
      if (!method) {
        throw new Error(ErrorMessage.systemError.invalidRequest.message);
      }

      const config = {
        method: method as Method,
        url: url,
        headers: headers,
        data: body,
      };

      const response: AxiosResponse = await axios(config);

    logger.log(`Providers : ${provider } , Response : ${response}`);

      return response.data;
    } catch (error: any) {

      logger.error(`errors : ${error}`);
    
      if (error?.response?.data) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data ||
          error.message;
        throw ErrorMessage.systemError.externalErrorWithData(message);
      } else {
        throw ErrorMessage.systemError.externalError;
      }
    }
  }
}
