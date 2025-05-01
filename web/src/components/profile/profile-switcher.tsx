import { useSwitchProfile } from '@/hooks/use-switch-profile';
import { useUserProfile } from '@/hooks/use-user';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/utils/error';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ProfileUser, Permission } from '@/types/auth';

export function ProfileSwitcher() {
  const { data: currentUser, isLoading: isLoadingProfile } = useUserProfile();
  const { mutateAsync: switchProfile, isPending: isSwitching } = useSwitchProfile();
  const { toast } = useToast();

  const handleSwitchProfile = async (profileId: number) => {
    try {
      await switchProfile({ profileId });
      toast({
        title: 'Thành công',
        description: 'Đã chuyển đổi profile thành công',
      });
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: getErrorMessage(err, 'Không thể chuyển đổi profile'),
        variant: 'destructive',
      });
    }
  };

  const getPermissionIcon = (permission: Permission) => {
    switch (permission) {
      case Permission.ADMIN:
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
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
        return 'Thành viên';
      case Permission.READ:
        return 'Chỉ xem';
      default:
        return permission;
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!currentUser?.account.profileUsers || currentUser.account.profileUsers.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-muted-foreground">Bạn chưa tham gia profile nào</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {currentUser.account.profileUsers.map((profileUser: ProfileUser) => (
        <Card
          key={profileUser.id}
          className={profileUser.profileId === currentUser.profile.id ? 'border-primary' : ''}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{profileUser.profile?.name}</CardTitle>
            <div className="flex items-center gap-2">
              {getPermissionIcon(profileUser.permission)}
              <span className="text-muted-foreground text-xs">
                {getPermissionLabel(profileUser.permission)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <CardDescription>
                {/* Không có thông tin isDefault trong type hiện tại */}
              </CardDescription>
              {profileUser.profileId !== currentUser.profile.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSwitchProfile(profileUser.profileId)}
                  disabled={isSwitching}
                >
                  {isSwitching ? 'Đang chuyển...' : 'Chuyển đổi'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
