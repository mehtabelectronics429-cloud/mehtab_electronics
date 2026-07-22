import type { Metadata } from "next";
import QueryProvider from "@/components/admin/providers/QueryProvider";
import AuthProvider from "@/components/admin/providers/AuthProvider";
import AdminShell from "@/components/admin/shell/AdminShell";

export const metadata: Metadata = {
  title: "Admin · Mehtab Electronics",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root min-h-screen cursor-auto antialiased">
      <AuthProvider>
        <QueryProvider>
          <AdminShell>{children}</AdminShell>
        </QueryProvider>
      </AuthProvider>
    </div>
  );
}
