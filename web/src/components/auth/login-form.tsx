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
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border-white/20 border bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <CardContent className="pt-6 pb-8 px-8">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary-500 dark:text-primary-400">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="pl-10 bg-white/50 dark:bg-gray-900/50 border-primary-100 dark:border-primary-800 focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 focus-visible:ring-offset-0 transition-all hover:border-primary-200 dark:hover:border-primary-700"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              {errors.email && (
                <div className="text-sm text-red-500 ml-1">
                  {errors.email.message}
                </div>
              )}
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary-500 dark:text-primary-400">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  className="pl-10 bg-white/50 dark:bg-gray-900/50 border-primary-100 dark:border-primary-800 focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500 focus-visible:ring-offset-0 transition-all hover:border-primary-200 dark:hover:border-primary-700"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
              </div>
              {errors.password && (
                <div className="text-sm text-red-500 ml-1">
                  {errors.password.message}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center animate-fade-down bg-red-50 dark:bg-red-500/10 rounded-lg p-3">
              {error.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-primary-50 font-medium shadow-lg shadow-primary-500/25 dark:shadow-none transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primary-100 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/50 shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-neumorphic-dark-sm transition-all duration-300"
            onClick={() => loginWithGoogle()}
            disabled={isSubmitting}
          >
            <Chrome className="mr-2 h-5 w-5 text-primary-500 dark:text-primary-400" />
            Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
