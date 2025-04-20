import { RegisterForm } from "@/components/auth/register-form";
import Image from "next/image";
import backgroundLogin from "@/assets/images/background-login.png";
import Link from "next/link";
import { ROUTES } from "@/constants/app.constant";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background/95 to-primary/5 dark:from-gray-950 dark:via-gray-900 dark:to-primary-900/5 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-primary/[0.03] dark:bg-grid-primary/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.03] animate-gradient" />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute -left-1/4 -top-1/4 w-1/2 aspect-square">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200/20 via-primary-300/20 to-transparent rounded-full blur-3xl animate-float opacity-60 dark:from-primary-900/30 dark:via-primary-800/30" />
      </div>
      <div className="absolute -right-1/4 -bottom-1/4 w-1/2 aspect-square">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-300/20 via-primary-200/20 to-transparent rounded-full blur-3xl animate-float-delay opacity-60 dark:from-primary-800/30 dark:via-primary-900/30" />
      </div>

      {/* Left side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-up">
          {/* Logo and Title with Enhanced Gradient */}
          <div className="text-center space-y-4 relative">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-primary-300/20 to-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <h1 className="text-4xl font-bold bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent drop-shadow-sm">
                Thu Chi App
              </h1>
            </div>
            <p className="text-base text-muted-foreground">
              Quản lý tài chính thông minh, cuộc sống thảnh thơi
            </p>
          </div>

          {/* Registration Form */}
          <RegisterForm />

          {/* Additional Info with Enhanced Styling */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Bạn đã có tài khoản?
            </p>
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="inline-block text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text hover:from-primary-500 hover:to-primary-400 transition-all duration-300"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative animate-fade-left">
        <div className="relative w-full max-w-2xl">
          {/* Neumorphic Card with Enhanced Gradient */}
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border border-white/20 dark:border-white/5">
            <div className="relative w-full h-full group transition-transform duration-500 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <Image
                src={backgroundLogin}
                alt="Finance Management Illustration"
                fill
                className="object-contain p-8 animate-float"
                priority
              />
            </div>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-400/5 animate-float-delay blur-sm" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-gradient-to-br from-primary-400/20 to-primary-500/5 animate-float blur-sm" />
        </div>
      </div>
    </div>
  );
}
