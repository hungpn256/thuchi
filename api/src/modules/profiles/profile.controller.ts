import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateInvitationDto, InvitationResponseDto } from './dto/invitation.dto';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Account } from '@/shared/decorators';
import { account } from '@prisma/client';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post(':profileId/invitations')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new invitation (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: InvitationResponseDto,
  })
  async createInvitation(@Param('profileId') profileId: string, @Body() dto: CreateInvitationDto) {
    return this.profileService.createInvitation(profileId, dto);
  }

  @Post('/invitations/:profileId/accept')
  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
  })
  async acceptInvitation(@Param('profileId') profileId: string, @Account() account: account) {
    return this.profileService.acceptInvitation(Number(profileId), account.id);
  }

  @Post('/invitations/:profileId/reject')
  @ApiOperation({ summary: 'Reject an invitation' })
  @ApiResponse({
    status: 200,
    description: 'Invitation rejected successfully',
  })
  async rejectInvitation(@Param('profileId') profileId: string, @Account() account: account) {
    return this.profileService.rejectInvitation(Number(profileId), account.id);
  }

  @Get('/invitations')
  @ApiOperation({ summary: 'Get all invitations for a profile' })
  @ApiResponse({
    status: 200,
    description: 'List of invitations',
    type: [InvitationResponseDto],
  })
  async getInvitations(@Account() account: account) {
    return this.profileService.getInvitations(account.id);
  }

  @Get(':profileId/members')
  @ApiOperation({ summary: 'Get all users in a profile' })
  @ApiResponse({
    status: 200,
    description: 'List of profile users',
  })
  async getProfileUsers(@Param('profileId') profileId: string) {
    return this.profileService.getProfileUsers(Number(profileId));
  }
}
