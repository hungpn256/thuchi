import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ForbiddenException } from '@/shared/exceptions/app.exception';

@Injectable()
export class AdminOrWriteGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const profileUser = await this.prisma.profile_user.findUnique({
      where: {
        profileId_accountId: {
          profileId: user.profile.id,
          accountId: user.account.id,
        },
      },
    });

    if (!profileUser) {
      throw new UnauthorizedException('Bạn không có quyền thực hiện thao tác này');
    }

    const hasPermission = ['ADMIN', 'WRITE'].includes(profileUser.permission);
    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    return true;
  }
}
