"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { LoginCredentials } from "@/types/auth";
import { Chrome, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const { login, loginWithGoogle, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <Card className="w-full shadow-lg border-primary-100 dark:border-primary-900 animate-fade-up delay-300">
      <CardContent className="pt-6 pb-8 px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                type="email"
                placeholder="Email của bạn"
                className="pl-10 bg-background/50 border-primary-100 dark:border-primary-800 focus:border-primary-500 transition-colors"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <Input
                type="password"
                placeholder="Mật khẩu"
                className="pl-10 bg-background/50 border-primary-100 dark:border-primary-800 focus:border-primary-500 transition-colors"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive text-center animate-fade-down">
              {error.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-600 text-primary-foreground shadow-lg shadow-primary-500/20 dark:shadow-none transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primary-100 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors duration-300"
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-5 w-5 text-primary-500" />
            Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
