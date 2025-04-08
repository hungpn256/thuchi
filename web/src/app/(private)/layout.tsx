"use client";

import { ROUTES, STORAGE_KEYS } from "@/constants/app.constant";
import { useUserProfile } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const router = useRouter();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      : null;

  const { isLoading, error } = useUserProfile();

  if (error || !token) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
