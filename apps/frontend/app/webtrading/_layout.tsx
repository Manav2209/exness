"use client";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/signin");
    else fetchUser();
  }, [token]);

  return <>{children}</>;
}
