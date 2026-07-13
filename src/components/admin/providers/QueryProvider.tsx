"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "rgba(16,18,27,0.9)", color: "#e7ecf3", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: "14px", fontSize: "0.85rem" },
        }}
      />
    </QueryClientProvider>
  );
}
