import { HttpException, HttpStatus } from '@nestjs/common';

export interface IErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class BaseException extends HttpException {
  constructor(error: IErrorResponse, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
