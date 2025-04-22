'use client';

import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import backgroundLogin from '@/assets/images/background-login.png';
import Link from 'next/link';
import { ROUTES } from '@/constants/app.constant';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function LoginPage() {
  const { checkPendingAuth } = useAuth();

  // Kiểm tra OAuth redirect khi component mount
  useEffect(() => {
    checkPendingAuth();
  }, [checkPendingAuth]);

  return (
    <div className="from-background via-background/95 to-primary/5 dark:to-primary-900/5 relative flex min-h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-gray-950 dark:via-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="bg-grid-primary/[0.03] dark:bg-grid-primary/[0.02] absolute inset-0" />
        <div className="from-primary/[0.03] to-primary/[0.03] animate-gradient absolute inset-0 bg-gradient-to-br via-transparent" />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute -top-1/4 -left-1/4 aspect-square w-1/2">
        <div className="from-primary-200/20 via-primary-300/20 animate-float dark:from-primary-900/30 dark:via-primary-800/30 absolute inset-0 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-3xl" />
      </div>
      <div className="absolute -right-1/4 -bottom-1/4 aspect-square w-1/2">
        <div className="from-primary-300/20 via-primary-200/20 animate-float-delay dark:from-primary-800/30 dark:via-primary-900/30 absolute inset-0 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-3xl" />
      </div>

      {/* Left side - Illustration */}
      <div className="animate-fade-right relative hidden w-1/2 items-center justify-center p-12 lg:flex">
        <div className="relative w-full max-w-2xl">
          {/* Neumorphic Card with Enhanced Gradient */}
          <div className="dark:shadow-neumorphic-dark aspect-square rounded-3xl border border-white/20 bg-gradient-to-br from-white/90 via-white/80 to-white/70 p-8 shadow-[0_8px_32px_rgb(0,0,0,0.12)] backdrop-blur-xl dark:border-white/5 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70">
            <div className="group relative h-full w-full transition-transform duration-500 hover:scale-[1.01]">
              <div className="from-primary-500/10 absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src={backgroundLogin}
                alt="Finance Management Illustration"
                fill
                className="animate-float object-contain p-8"
                priority
              />
            </div>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className="from-primary-500/20 to-primary-400/5 animate-float-delay absolute -top-4 -right-4 h-24 w-24 rounded-xl bg-gradient-to-br blur-sm" />
          <div className="from-primary-400/20 to-primary-500/5 animate-float absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-br blur-sm" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="relative flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="animate-fade-up w-full max-w-md space-y-8">
          {/* Logo and Title with Enhanced Gradient */}
          <div className="relative space-y-4 text-center">
            <div className="relative">
              <div className="from-primary-500/20 via-primary-300/20 to-primary-500/20 absolute -inset-1 bg-gradient-to-r opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              <h1 className="from-primary-600 via-primary-500 to-primary-400 bg-gradient-to-br bg-clip-text text-4xl font-bold text-transparent drop-shadow-sm">
                Thu Chi App
              </h1>
            </div>
            <p className="text-muted-foreground text-base">
              Quản lý tài chính thông minh, cuộc sống thảnh thơi
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Additional Info with Enhanced Styling */}
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">Bạn chưa có tài khoản?</p>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 inline-block bg-gradient-to-r bg-clip-text text-sm font-medium transition-all duration-300"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
