import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('🚀 JWT Guard - Request Path:', request.path);
    console.log('🚀 JWT Guard - Authorization Header:', request.headers.authorization);
    console.log('🚀 JWT Guard - Extracted Token:', token);

    return super.canActivate(context);
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🚀 JWT Guard - Error:', err);
    console.log('🚀 JWT Guard - User:', user);
    console.log('🚀 JWT Guard - Info:', info);

    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token or no token provided');
    }
    return user;
  }
}
