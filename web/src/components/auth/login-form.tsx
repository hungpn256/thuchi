"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { LoginCredentials } from "@/types/auth";
import { Chrome, LockKeyhole, Mail } from "lucide-react";
import { ThemeToggle } from "../theme/theme-toggle";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/lib/validations/auth";

type FormData = LoginCredentials;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login, loginWithGoogle, error } = useAuth();

  const onSubmit = async (data: FormData) => {
    await login(data);
  };

  return (
    <Card className="relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border-white/20 border bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70 backdrop-blur-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="pt-6 pb-8 px-8 relative">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary-500/80 dark:text-primary-400/80 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="pl-10 bg-white/50 dark:bg-gray-900/50 border-primary-100 dark:border-primary-800/50 focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 focus-visible:ring-offset-0 transition-all hover:border-primary-200 dark:hover:border-primary-700 placeholder:text-muted-foreground/70"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              {errors.email && (
                <div className="text-sm text-red-500 ml-1 animate-fade-down">
                  {errors.email.message}
                </div>
              )}
            </div>
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary-500/80 dark:text-primary-400/80 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  className="pl-10 bg-white/50 dark:bg-gray-900/50 border-primary-100 dark:border-primary-800/50 focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 focus-visible:ring-offset-0 transition-all hover:border-primary-200 dark:hover:border-primary-700 placeholder:text-muted-foreground/70"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              {errors.password && (
                <div className="text-sm text-red-500 ml-1 animate-fade-down">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center animate-fade-down bg-gradient-to-r from-red-50/80 to-red-50/40 dark:from-red-500/20 dark:to-red-500/5 rounded-lg p-3 border border-red-100 dark:border-red-500/10">
              {error.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-primary-50 font-medium shadow-lg shadow-primary-500/25 dark:shadow-none transition-all duration-300 group/button"
            disabled={isSubmitting}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.07] to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity" />
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gradient-to-r from-primary-200/20 via-primary-200/30 to-primary-200/20 dark:from-primary-800/20 dark:via-primary-800/30 dark:to-primary-800/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-800/70 px-2 text-muted-foreground">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full relative overflow-hidden border-primary-100 dark:border-primary-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/50 shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-neumorphic-dark-sm transition-all duration-300 group/google"
            onClick={() => loginWithGoogle()}
            disabled={isSubmitting}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/[0.08] to-transparent opacity-0 group-hover/google:opacity-100 transition-opacity" />
            <Chrome className="mr-2 h-5 w-5 text-primary-500/80 dark:text-primary-400/80 group-hover/google:text-primary-500 dark:group-hover/google:text-primary-400 transition-colors" />
            Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
