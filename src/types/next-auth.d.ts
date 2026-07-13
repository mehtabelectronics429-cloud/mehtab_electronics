import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/admin/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      title?: string;
      employeeId?: string | null;
    };
  }

  interface User {
    role?: Role;
    title?: string;
    employeeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    title?: string;
    employeeId?: string | null;
  }
}
