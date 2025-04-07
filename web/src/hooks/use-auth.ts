"use client";

import axiosClient from "@/lib/axios-client";
import { AuthResponse, LoginCredentials, UseAuthReturn } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: login, isPending: isLoginLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const { data } = await axiosClient.post<AuthResponse>(
          `/auth/login`,
          credentials
        );

        // Store the token in localStorage
        localStorage.setItem("accessToken", data.accessToken);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      }
    },
  });

  const { mutateAsync: loginWithGoogle, isPending: isGoogleLoading } =
    useMutation({
      mutationFn: async () => {
        try {
          // Get Google login URL
          const {
            data: { url },
          } = await axiosClient.get(`/auth/login/google`);

          // Open popup for Google login
          const popup = window.open(
            url,
            "Google Login",
            "width=500,height=600,left=400,top=100"
          );

          if (!popup) {
            throw new Error(
              "Popup bị chặn. Vui lòng cho phép popup cho trang web này."
            );
          }

          // Listen for messages from the popup
          const response = await new Promise<AuthResponse>(
            (resolve, reject) => {
              const handleMessage = (event: MessageEvent) => {
                // Verify origin
                if (event.origin !== window.location.origin) return;

                // Handle error
                if (event.data.error) {
                  reject(new Error(event.data.error));
                  return;
                }

                // Handle success
                if (event.data.accessToken) {
                  resolve(event.data);
                  return;
                }
              };

              window.addEventListener("message", handleMessage);

              // Check if popup is closed before authentication
              const checkClosed = setInterval(() => {
                if (popup.closed) {
                  clearInterval(checkClosed);
                  window.removeEventListener("message", handleMessage);
                  reject(new Error("Đăng nhập bị hủy"));
                }
              }, 1000);
            }
          );

          // Store token and redirect
          localStorage.setItem("accessToken", response.accessToken);
          router.push("/dashboard");
        } catch (err) {
          const error = err as Error;
          setError(error);
          throw error;
        }
      },
    });

  return {
    login,
    loginWithGoogle,
    isLoading: isLoginLoading || isGoogleLoading,
    error,
  };
};
