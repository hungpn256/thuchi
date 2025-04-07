"use client";

import { useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GoogleCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("Không nhận được mã xác thực từ Google");
        }

        // Exchange code for tokens
        const { data } = await axios.get(
          `${API_URL}/auth/login/google/callback`,
          {
            params: { code },
          }
        );

        // Send data to parent window
        if (window.opener) {
          window.opener.postMessage(data, window.location.origin);
          window.close();
        }
      } catch (error) {
        // Send error to parent window
        if (window.opener) {
          window.opener.postMessage({ error: error }, window.location.origin);
          window.close();
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
