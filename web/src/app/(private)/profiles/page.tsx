'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvitations, useAcceptInvitation, useRejectInvitation } from '@/hooks/use-invitations';
import { useProfileMembers } from '@/hooks/use-profile-members';
import { useInviteMember } from '@/hooks/use-invite-member';
import {
  Check,
  Mail,
  User,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  ArrowLeftRight,
  Pencil,
} from 'lucide-react';
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
import { ProfileSwitcher } from '@/components/profile/profile-switcher';
import { Can } from '@/components/Can';
import { Action } from '@/casl/ability';
import { useUpdatePermission } from '@/hooks/use-update-permission';
import { Permission } from '@/types/auth';

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
          <TabsTrigger value="switch" className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Danh sách thành viên</h2>
            <Can action={Action.Invite} subject="ProfileMember">
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Mời thành viên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mời thành viên mới</DialogTitle>
                    <DialogDescription>
                      Nhập email và chọn quyền hạn cho thành viên mới
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn quyền hạn" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="WRITE">Write</SelectItem>
                              <SelectItem value="READ">Read</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.permission && (
                        <p className="text-destructive text-sm">{errors.permission.message}</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isInviting}>
                        {isInviting ? 'Đang gửi...' : 'Gửi lời mời'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </Can>
          </div>
          {!members || members.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">Chưa có thành viên nào</p>
              </CardContent>
            </Card>
          ) : (
            <MemberTable members={members as ProfileUser[]} />
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

        <TabsContent value="switch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chuyển đổi profile</CardTitle>
              <CardDescription>
                Chọn profile bạn muốn chuyển đổi. Sau khi chuyển đổi, trang sẽ được tải lại.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSwitcher />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MemberTable({ members }: { members: ProfileUser[] }) {
  const [selectedUser, setSelectedUser] = useState<ProfileUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutateAsync: updatePermission, isPending: isUpdating } = useUpdatePermission();
  const { toast } = useToast();

  const getPermissionIcon = (permission: Permission) => {
    switch (permission) {
      case Permission.ADMIN:
        return <ShieldCheck className="text-primary h-4 w-4" />;
      case Permission.WRITE:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case Permission.READ:
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (permission: Permission) => {
    switch (permission) {
      case Permission.ADMIN:
        return 'Quản trị viên';
      case Permission.WRITE:
        return 'Chỉnh sửa';
      case Permission.READ:
        return 'Xem';
      default:
        return permission;
    }
  };

  const handleUpdatePermission = async (permission: Permission) => {
    if (!selectedUser) return;

    try {
      await updatePermission({ userId: selectedUser.account.id, permission });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật quyền hạn',
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(error, 'Không thể cập nhật quyền hạn'),
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Quyền hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <Can action={Action.Update} subject="ProfileMember">
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </Can>
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
                  <Can action={Action.Update} subject="ProfileMember">
                    <TableCell>
                      {user.permission !== Permission.ADMIN && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </Can>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {members.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-base">{user.account.email}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPermissionIcon(user.permission)}
                    <span className="text-muted-foreground text-sm">
                      {getPermissionLabel(user.permission)}
                    </span>
                  </div>
                  <Can action={Action.Update} subject="ProfileMember">
                    {user.permission !== Permission.ADMIN && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </Can>
                </div>
                <Badge
                  className="w-fit"
                  variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {user.status === 'ACTIVE' ? 'Đã chấp nhận' : 'Đang chờ xác nhận'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Permission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật quyền hạn</DialogTitle>
            <DialogDescription>
              Chọn quyền hạn mới cho thành viên {selectedUser?.account.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleUpdatePermission(Permission.WRITE)}
                disabled={isUpdating || selectedUser?.permission === Permission.WRITE}
              >
                <Shield className="h-4 w-4 text-blue-500" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleUpdatePermission(Permission.READ)}
                disabled={isUpdating || selectedUser?.permission === Permission.READ}
              >
                <ShieldAlert className="h-4 w-4 text-yellow-500" />
                Xem
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
