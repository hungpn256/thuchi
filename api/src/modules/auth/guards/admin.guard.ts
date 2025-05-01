import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { profile_permission } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const profileUser = await this.prisma.profile_user.findUnique({
      where: {
        profileId_accountId: {
          profileId: user.profile.id,
          accountId: user.account.id,
        },
      },
    });

    return profileUser?.permission === profile_permission.ADMIN || false;
  }
}
