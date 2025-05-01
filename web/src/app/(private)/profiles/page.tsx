'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvitations, useAcceptInvitation, useRejectInvitation } from '@/hooks/use-invitations';
import { useProfileMembers } from '@/hooks/use-profile-members';
import { useInviteMember } from '@/hooks/use-invite-member';
import { Check, Mail, User, X, Shield, ShieldCheck, ShieldAlert, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/use-user';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getErrorMessage } from '@/utils/error';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProfileUser {
  id: number;
  account: {
    id: number;
    email: string;
  };
  status: ProfileStatus;
  permission: Permission;
}

type ProfileStatus = 'ACTIVE' | 'PENDING';
type Permission = 'ADMIN' | 'WRITE' | 'READ';

interface Invitation {
  id: number;
  profile: {
    id: number;
    name: string;
  };
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

const inviteMemberSchema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  permission: yup.string().oneOf(['ADMIN', 'WRITE', 'READ']).required('Vui lòng chọn quyền hạn'),
});

type InviteMemberForm = yup.InferType<typeof inviteMemberSchema>;

export default function ProfilePage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { data: invitations, isLoading: isLoadingInvitations } = useInvitations();
  const { mutateAsync: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutateAsync: rejectInvitation, isPending: isRejecting } = useRejectInvitation();
  const { data: userProfile } = useUserProfile();
  const profileId = userProfile?.profile.id;
  const { mutateAsync: inviteMember, isPending: isInviting } = useInviteMember(profileId ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<InviteMemberForm>({
    resolver: yupResolver(inviteMemberSchema),
  });

  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useProfileMembers(profileId, {
    enabled: !!profileId,
  });

  useEffect(() => {
    if (profileId) {
      refetchMembers();
    }
  }, [profileId, refetchMembers]);

  const { toast } = useToast();

  const handleAccept = async (invitationId: number) => {
    try {
      await acceptInvitation(invitationId);
      toast({
        title: 'Thành công',
        description: 'Đã chấp nhận lời mời',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể chấp nhận lời mời',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (invitationId: number) => {
    try {
      await rejectInvitation(invitationId);
      toast({
        title: 'Thành công',
        description: 'Đã từ chối lời mời',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối lời mời',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (formData: InviteMemberForm) => {
    if (!profileId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      await inviteMember({ email: formData.email, permission: formData.permission });
      toast({
        title: 'Thành công',
        description: 'Đã gửi lời mời thành công',
      });
      refetchMembers();
      setIsInviteDialogOpen(false);
      reset();
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(err, 'Không thể gửi lời mời'),
        variant: 'destructive',
      });
    }
  };

  if (isLoadingInvitations || isLoadingMembers) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý profile</h1>
        <p className="text-muted-foreground">Quản lý thành viên và lời mời tham gia profile</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Thành viên
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Lời mời
            {invitations && invitations.length > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs">
                {invitations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Mời thành viên
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mời thành viên mới</DialogTitle>
                  <DialogDescription>
                    Nhập email để mời thành viên tham gia profile của bạn
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permission">Quyền hạn</Label>
                    <Controller
                      name="permission"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quyền hạn" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                            <SelectItem value="WRITE">Chỉnh sửa</SelectItem>
                            <SelectItem value="READ">Xem</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.permission && (
                      <p className="text-destructive text-sm">{errors.permission.message}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? 'Đang gửi...' : 'Gửi lời mời'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {!members || members.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">Chưa có thành viên nào</p>
              </CardContent>
            </Card>
          ) : (
            <MemberTable members={members} />
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <div className="grid gap-4">
            {invitations?.length === 0 ? (
              <Card>
                <CardContent className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground">Không có lời mời nào</p>
                </CardContent>
              </Card>
            ) : (
              invitations?.map((invitation: Invitation) => (
                <Card key={invitation.id}>
                  <CardHeader>
                    <CardTitle>{invitation.profile.name}</CardTitle>
                    <CardDescription>Lời mời từ {invitation.profile.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleReject(invitation.id)}
                        disabled={isRejecting}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(invitation.id)}
                        disabled={isAccepting}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Chấp nhận
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MemberTable({ members }: { members: ProfileUser[] }) {
  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'ADMIN':
        return <ShieldCheck className="text-primary h-4 w-4" />;
      case 'WRITE':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'READ':
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'WRITE':
        return 'Chỉnh sửa';
      case 'READ':
        return 'Xem';
      default:
        return permission;
    }
  };

  return (
    <div className="rounded-md border">
      <Table className="w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Quyền hạn</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.account.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getPermissionIcon(user.permission)}
                  <span>{getPermissionLabel(user.permission)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {user.status === 'ACTIVE' ? 'Đã chấp nhận' : 'Đang chờ xác nhận'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
