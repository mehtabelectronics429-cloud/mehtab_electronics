import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectMongo, getRedactedMongoUri } from "@/lib/db/mongodb";
import { Profile } from "@/lib/db/models/Profile";
import { Employee } from "@/lib/db/models/Employee";
import { notDeleted } from "@/lib/db/soft-delete";
import type { Role } from "@/lib/admin/types";

const PROFILE_SYNC_MS = 10 * 60 * 1000; // refresh role/email from DB at most every 10m

/** Ensure NextAuth has a public URL on Vercel when NEXTAUTH_URL is unset. */
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

async function linkEmployee(profileId: string, email: string, role: Role) {
  if (role !== "employee") return null;
  const emp = await Employee.findOne({ email, ...notDeleted });
  if (!emp) return null;
  await Profile.findByIdAndUpdate(profileId, { employeeId: emp._id });
  return String(emp._id);
}

function applyProfileToToken(
  token: Record<string, unknown>,
  profile: {
    email: string;
    name: string;
    role: Role;
    title?: string;
    employeeId?: { toString(): string } | null;
  },
) {
  token.email = profile.email;
  token.name = profile.name;
  token.role = profile.role;
  token.title = profile.title || "";
  token.employeeId = profile.employeeId ? String(profile.employeeId) : null;
  token.profileSyncedAt = Date.now();
}

export const authOptions: NextAuthOptions = {
  // Required on Vercel / behind proxies when NEXTAUTH_URL host may differ.
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectMongo();
        const email = credentials.email.trim().toLowerCase();
        const profile = await Profile.findOne({ email, ...notDeleted });
        if (!profile) {
          // Additional debug: try a case-insensitive search to detect stored-case mismatches.
          try {
            const esc = (s: string) =>
              s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
            const ci = await Profile.findOne({
              email: new RegExp(`^${esc(email)}$`, "i"),
              ...notDeleted,
            });
          } catch (err) {
            console.error("Error during case-insensitive lookup:", err);
          }
        }
        if (!profile?.passwordHash) return null;
        const ok = await bcrypt.compare(
          credentials.password,
          profile.passwordHash,
        );
        if (!ok) return null;

        let employeeId = profile.employeeId ? String(profile.employeeId) : null;
        if (!employeeId && profile.role === "employee") {
          employeeId = await linkEmployee(
            String(profile._id),
            profile.email,
            profile.role,
          );
        }

        return {
          id: String(profile._id),
          email: profile.email,
          name: profile.name,
          image: profile.avatar || undefined,
          role: profile.role,
          title: profile.title,
          employeeId,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      await connectMongo();
      const email = (user.email || "").toLowerCase();
      if (!email) return false;

      const googleId = account.providerAccountId;
      let doc = await Profile.findOne({
        $or: [{ email }, { googleId }],
        ...notDeleted,
      });

      if (!doc) {
        const role: Role =
          email === "admin@mehtabelectronics.com" ? "admin" : "employee";
        doc = await Profile.create({
          email,
          name: user.name || profile?.name || email.split("@")[0],
          role,
          title: role === "admin" ? "Administrator" : "Staff",
          avatar: user.image || "",
          googleId,
          passwordHash: null,
        });
      } else {
        doc.googleId = googleId;
        if (user.name) doc.name = user.name;
        if (user.image) doc.avatar = user.image;
        await doc.save();
      }

      user.id = String(doc._id);
      (user as { role?: Role }).role = doc.role;
      (user as { title?: string }).title = doc.title;
      let employeeId = doc.employeeId ? String(doc.employeeId) : null;
      if (!employeeId && doc.role === "employee") {
        employeeId = await linkEmployee(String(doc._id), doc.email, doc.role);
      }
      (user as { employeeId?: string | null }).employeeId = employeeId;
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as { role?: Role }).role || "employee";
        token.title = (user as { title?: string }).title || "";
        token.employeeId =
          (user as { employeeId?: string | null }).employeeId ?? null;
        token.profileSyncedAt = Date.now();
        return token;
      }

      // Avoid Mongo on every session poll (breaks Vercel/serverless login UX).
      // Refresh only periodically, or when NextAuth asks for an update.
      const syncedAt =
        typeof token.profileSyncedAt === "number" ? token.profileSyncedAt : 0;
      const shouldSync =
        trigger === "update" || Date.now() - syncedAt > PROFILE_SYNC_MS;
      if (token.id && shouldSync) {
        try {
          await connectMongo();
          const profile = await Profile.findOne({
            _id: String(token.id),
            ...notDeleted,
          });
          if (profile) {
            applyProfileToToken(token as Record<string, unknown>, profile);
          }
        } catch {
          // keep existing token if DB briefly unavailable
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        session.user.role = (token.role as Role) || "employee";
        session.user.title = (token.title as string) || "";
        session.user.employeeId = (token.employeeId as string | null) ?? null;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "mehtab-dev-secret-change-me",
};
