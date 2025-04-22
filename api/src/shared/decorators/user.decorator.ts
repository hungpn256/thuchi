import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract user information from request object
 *
 * @example
 * // Extract entire user object
 * @User() user
 *
 * @example
 * // Extract specific user property
 * @User('id') userId: number
 * @User('email') email: string
 */
export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  // Check if user exists in request
  if (!request.user) {
    return null;
  }

  // Return specific property if data is provided
  if (data) {
    return request.user[data];
  }

  // Return the whole user object
  return request.user;
});
