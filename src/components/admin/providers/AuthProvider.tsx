"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Keep session refetch quiet so login / dashboard don't hammer /api/auth/session
 * (important on Vercel + Mongo-backed JWT sync).
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
