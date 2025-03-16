import { HttpStatusCode } from 'axios';

import { ErrorType } from '../types/errors';

export class ServerError extends Error {
  readonly name = 'ServerError';
  readonly displayMessage: string;
  readonly status: HttpStatusCode;
  readonly endpoint?: string;
  readonly type: ErrorType;

  /**
   * @param message       Error message
   * @param status        HTTP status code
   * @param endpoint      Endpoint, resource name, or server location
   */
  constructor({
    message,
    status = HttpStatusCode.InternalServerError,
    endpoint
  }: {
    message: string;
    status?: HttpStatusCode;
    endpoint?: string;
  }) {
    super(message);
    this.status = status;
    this.endpoint = endpoint;
    this.displayMessage = message;
    this.type = ErrorType.SERVER;
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  public getStatusCode(): number {
    return this.status;
  }
}
