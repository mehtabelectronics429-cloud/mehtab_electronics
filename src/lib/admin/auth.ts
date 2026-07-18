"use client";

import { useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { User } from "./types";

export const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    email: "admin@mehtabelectronics.com",
    password: "admin123",
  },
  {
    label: "Employee",
    email: "staff@mehtabelectronics.com",
    password: "staff123",
  },
];

export function googleAuthEnabled() {
  return process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true";
}

export function useAuth() {
  const { data, status } = useSession();

  const user: User | null = data?.user
    ? {
        id: data.user.id,
        name: data.user.name || "",
        email: data.user.email || "",
        role: data.user.role,
        title: data.user.title,
        avatar: data.user.image || undefined,
        employeeId: data.user.employeeId ?? null,
      }
    : null;

  const login = useCallback(async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error)
      return { ok: false as const, error: "Invalid email or password." };
    if (res?.ok) return { ok: true as const };
    return { ok: false as const, error: "Login failed" };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await signIn("google", { callbackUrl: "/admin" });
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/admin/login" });
  }, []);

  return {
    user,
    loading: status === "loading",
    authenticated: status === "authenticated",
    login,
    loginWithGoogle,
    logout,
  };
}
