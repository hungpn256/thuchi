import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/invitation.dto';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { profile_user_status } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvitation(profileId: string, dto: CreateInvitationDto) {
    // Check if the profile exists and user is admin
    const profile = await this.prisma.profile.findUnique({
      where: { id: Number(profileId) },
      include: { profileUsers: true },
    });

    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!profile || !account) {
      throw new NotFoundException('Profile or account not found');
    }

    if (profile.profileUsers.some((user) => user.accountId === account.id)) {
      throw new BadRequestException('Account already in profile');
    }

    // Create the invitation
    return this.prisma.profile_user.create({
      data: {
        accountId: account.id,
        status: profile_user_status.PENDING,
        profileId: profile.id,
        permission: dto.permission,
      },
    });
  }

  async acceptInvitation(profileUserId: number, accountId: number) {
    const profileUser = await this.prisma.profile_user.findUnique({
      where: { id: profileUserId, accountId },
    });

    if (!profileUser) {
      throw new NotFoundException('Profile user not found');
    }

    if (profileUser.status !== profile_user_status.PENDING) {
      throw new UnauthorizedException('Profile user is no longer pending');
    }

    // Update invitation status
    await this.prisma.profile_user.update({
      where: { id: profileUserId },
      data: { status: profile_user_status.ACTIVE },
    });

    return { message: 'Invitation accepted successfully' };
  }

  async rejectInvitation(profileUserId: number, accountId: number) {
    const profileUser = await this.prisma.profile_user.findUnique({
      where: { id: profileUserId, accountId },
    });

    if (!profileUser) {
      throw new NotFoundException('Profile user not found');
    }

    if (profileUser.status !== profile_user_status.PENDING) {
      throw new UnauthorizedException('Profile user is no longer pending');
    }

    await this.prisma.profile_user.delete({
      where: { id: Number(profileUserId) },
    });

    return { message: 'Invitation rejected successfully' };
  }

  async getInvitations(accountId: number) {
    return this.prisma.profile_user.findMany({
      where: {
        accountId,
        status: profile_user_status.PENDING,
      },
      include: {
        profile: true,
      },
    });
  }

  async getProfileUsers(profileId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        profileUsers: {
          include: {
            account: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile.profileUsers;
  }
}
