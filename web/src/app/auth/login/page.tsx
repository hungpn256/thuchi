import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Image from "next/image";
import backgroundLogin from "@/assets/images/background-login.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex relative bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute -left-40 -top-40">
          <div className="w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float" />
        </div>
        <div className="absolute -right-40 -bottom-40">
          <div className="w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float delay-1000" />
        </div>
      </div>

      {/* Left side - Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-8 relative">
        <div className="relative w-full max-w-lg h-full">
          <Image
            src={backgroundLogin}
            alt="Finance Management Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative animate-fade-up delay-200">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2 animate-fade-down">
              Thu Chi App
            </h1>
            <p className="text-muted-foreground animate-fade-down delay-100">
              Quản lý tài chính thông minh, cuộc sống thảnh thơi
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
