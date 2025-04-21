'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { RegisterCredentials } from '@/types/auth';
import { Chrome, LockKeyhole, Mail, User } from 'lucide-react';
import { ThemeToggle } from '../theme/theme-toggle';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@/lib/validations/auth';
import Link from 'next/link';
import { ROUTES } from '@/constants/app.constant';

type FormData = RegisterCredentials;

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const { register: registerUser, loginWithGoogle, error } = useAuth();

  const onSubmit = async (data: FormData) => {
    await registerUser(data);
  };

  return (
    <Card className="dark:shadow-neumorphic-dark group relative overflow-hidden border border-white/20 bg-gradient-to-br from-white/90 via-white/80 to-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70">
      <div className="from-primary-500/[0.08] absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardContent className="relative px-8 pt-6 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">Đã có tài khoản?</span>
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="group relative">
                <div className="text-primary-500/80 dark:text-primary-400/80 group-hover:text-primary-500 dark:group-hover:text-primary-400 pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Họ và tên"
                  className="border-primary-100 dark:border-primary-800/50 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 hover:border-primary-200 dark:hover:border-primary-700 placeholder:text-muted-foreground/70 bg-white/50 pl-10 transition-all focus-visible:ring-1 focus-visible:ring-offset-0 dark:bg-gray-900/50"
                  {...register('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                <div className="from-primary-500/10 to-primary-500/10 pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {errors.name && (
                <div className="animate-fade-down ml-1 text-sm text-red-500">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div>
              <div className="group relative">
                <div className="text-primary-500/80 dark:text-primary-400/80 group-hover:text-primary-500 dark:group-hover:text-primary-400 pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="border-primary-100 dark:border-primary-800/50 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 hover:border-primary-200 dark:hover:border-primary-700 placeholder:text-muted-foreground/70 bg-white/50 pl-10 transition-all focus-visible:ring-1 focus-visible:ring-offset-0 dark:bg-gray-900/50"
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                <div className="from-primary-500/10 to-primary-500/10 pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {errors.email && (
                <div className="animate-fade-down ml-1 text-sm text-red-500">
                  {errors.email.message}
                </div>
              )}
            </div>
            <div>
              <div className="group relative">
                <div className="text-primary-500/80 dark:text-primary-400/80 group-hover:text-primary-500 dark:group-hover:text-primary-400 pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  className="border-primary-100 dark:border-primary-800/50 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 hover:border-primary-200 dark:hover:border-primary-700 placeholder:text-muted-foreground/70 bg-white/50 pl-10 transition-all focus-visible:ring-1 focus-visible:ring-offset-0 dark:bg-gray-900/50"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <div className="from-primary-500/10 to-primary-500/10 pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {errors.password && (
                <div className="animate-fade-down ml-1 text-sm text-red-500">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="animate-fade-down rounded-lg border border-red-100 bg-gradient-to-r from-red-50/80 to-red-50/40 p-3 text-center text-sm text-red-500 dark:border-red-500/10 dark:from-red-500/20 dark:to-red-500/5">
              {error.message}
            </div>
          )}

          <Button
            type="submit"
            className="from-primary-600 to-primary-500 hover:from-primary-600/95 hover:to-primary-500/95 dark:from-primary-600/90 dark:to-primary-500/90 dark:hover:from-primary-600/80 dark:hover:to-primary-500/80 text-primary-50 shadow-primary-500/25 group/button relative w-full overflow-hidden bg-gradient-to-r font-medium shadow-lg transition-all duration-300 dark:shadow-none"
            disabled={isSubmitting}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover/button:opacity-100" />
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="from-primary-200/20 via-primary-200/30 to-primary-200/20 dark:from-primary-800/20 dark:via-primary-800/30 dark:to-primary-800/20 w-full bg-gradient-to-r" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="text-muted-foreground bg-gradient-to-br from-white/90 via-white/80 to-white/70 px-2 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70">
                Hoặc đăng ký với
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="border-primary-100 dark:border-primary-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/30 dark:shadow-neumorphic-dark-sm group/google relative w-full overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.06)] transition-all duration-300"
            onClick={() => loginWithGoogle()}
            disabled={isSubmitting}
          >
            <div className="from-primary-500/[0.05] absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity group-hover/google:opacity-100" />
            <Chrome className="text-primary-500/80 dark:text-primary-400/80 group-hover/google:text-primary-500 dark:group-hover/google:text-primary-400 mr-2 h-5 w-5 transition-colors" />
            Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
