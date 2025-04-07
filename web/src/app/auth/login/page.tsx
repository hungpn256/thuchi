import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import backgroundLogin from "@/assets/images/background-login.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex relative bg-gradient-to-br from-primary-50/50 via-white to-primary-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-primary/5" />

      {/* Gradient Orbs */}
      <div className="absolute -left-20 -top-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-200/20 to-primary-300/20 blur-3xl animate-float" />
      <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-300/20 to-primary-200/20 blur-3xl animate-float delay-1000" />

      {/* Left side - Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative animate-fade-up">
        <div className="relative w-full max-w-2xl">
          {/* Neumorphic Card */}
          <div className="aspect-square rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border border-white/20">
            <div className="relative w-full h-full">
              <Image
                src={backgroundLogin}
                alt="Finance Management Illustration"
                fill
                className="object-contain p-8 animate-float"
                priority
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-primary-500/10 animate-float delay-500" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary-500/10 animate-float delay-700" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-up delay-200">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Thu Chi App
            </h1>
            <p className="text-base text-muted-foreground">
              Quản lý tài chính thông minh, cuộc sống thảnh thơi
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Bạn chưa có tài khoản?</p>
            <a
              href="#"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Đăng ký ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
