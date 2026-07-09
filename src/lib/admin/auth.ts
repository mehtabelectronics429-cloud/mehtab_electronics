"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "./types";

const DEMO: Record<string, { password: string; user: User }> = {
  "admin@mehtab.pk": {
    password: "admin123",
    user: { id: "u_admin", name: "Imran Mehtab", email: "admin@mehtab.pk", role: "admin", title: "Administrator" },
  },
  "staff@mehtab.pk": {
    password: "staff123",
    user: { id: "u_staff", name: "Ahmed Sheikh", email: "staff@mehtab.pk", role: "employee", title: "Installation Technician" },
  },
};

const COOKIE = "me_admin_role";
function setCookie(role: Role | null) {
  if (typeof document === "undefined") return;
  if (role) document.cookie = `${COOKIE}=${role}; path=/; max-age=86400; samesite=lax`;
  else document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  syncCookie: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (email, password) => {
        const rec = DEMO[email.trim().toLowerCase()];
        if (!rec || rec.password !== password) return { ok: false, error: "Invalid email or password." };
        setCookie(rec.user.role);
        set({ user: rec.user });
        return { ok: true };
      },
      logout: () => { setCookie(null); set({ user: null }); },
      syncCookie: () => { const u = get().user; setCookie(u?.role ?? null); },
    }),
    { name: "me_admin_auth" }
  )
);

export const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@mehtab.pk", password: "admin123" },
  { label: "Employee", email: "staff@mehtab.pk", password: "staff123" },
];
