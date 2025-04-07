import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ValidationException extends BaseException {
  constructor(details?: Record<string, any>) {
    super(
      {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string) {
    super(
      {
        code: 'NOT_FOUND',
        message,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized access') {
    super(
      {
        code: 'UNAUTHORIZED',
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends BaseException {
  constructor(message = 'Access forbidden') {
    super(
      {
        code: 'FORBIDDEN',
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ConflictException extends BaseException {
  constructor(resource: string) {
    super(
      {
        code: 'CONFLICT',
        message: `${resource} already exists`,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string, details?: Record<string, any>) {
    super(
      {
        code: 'BAD_REQUEST',
        message,
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
