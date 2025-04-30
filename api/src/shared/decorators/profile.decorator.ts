import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { profile } from '@prisma/client';
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
export const Profile = createParamDecorator(
  (data: keyof profile | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // Check if user exists in request
    if (!request?.user?.profile) {
      return null;
    }

    // Return specific property if data is provided
    if (data) {
      return request.user.profile[data];
    }

    // Return the whole user object
    return request.user.profile;
  },
);
