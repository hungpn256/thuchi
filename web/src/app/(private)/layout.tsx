"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, ROUTES, STORAGE_KEYS } from "@/constants/app.constant";
import axiosClient from "@/lib/axios-client";
import { useUserProfile } from "@/hooks/use-user";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
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
