"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Label } from "@/components/admin/ui/primitives";
import { useAuth, googleAuthEnabled } from "@/lib/admin/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password is too short"),
});
type Form = z.infer<typeof schema>;

function LoginInner() {
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirected = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user && !redirected.current) {
      redirected.current = true;
      window.location.assign(from.startsWith("/admin") ? from : "/admin");
    }
  }, [user, from]);

  useEffect(() => {
    const err = params.get("error");
    if (!err) return;
    if (err === "CredentialsSignin") toast.error("Invalid email or password.");
    else if (err === "Configuration") {
      toast.error(
        "Auth is misconfigured. Set NEXTAUTH_URL and NEXTAUTH_SECRET on the host.",
      );
    } else toast.error("Sign-in failed. Try again.");
  }, [params]);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res.ok) {
        toast.success("Welcome back");
        redirected.current = true;
        window.location.assign(from.startsWith("/admin") ? from : "/admin");
        return;
      }
      toast.error(res.error || "Login failed");
    } catch {
      toast.error(
        "Could not reach the auth server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setGoogleLoading(false);
      toast.error("Google sign-in failed.");
    }
  };

  if (authLoading || user) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-[#06070d]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#06070d] px-4 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(60%_50%_at_50%_0%,rgba(46,107,255,0.2),transparent),radial-gradient(50%_40%_at_80%_100%,rgba(34,224,255,0.12),transparent)]"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[24rem] rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyan shadow-[0_10px_30px_-12px_rgba(46,107,255,0.8)]">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <div>
            <div className="font-display text-sm tracking-wider">MEHTAB</div>
            <div className="text-xs text-white/40">Admin Console</div>
          </div>
        </div>

        <h1 className="mt-7 font-display text-xl font-bold tracking-tight">
          Sign in
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-white/45">
          Access the operations dashboard.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
          noValidate
        >
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@mehtabelectronics.com"
              className="mt-0"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? (
              "Signing in…"
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign in
              </>
            )}
          </Button>
        </form>

        {googleAuthEnabled() && (
          <>
            <div className="my-4 flex items-center gap-3 text-[0.65rem] uppercase tracking-wider text-white/30">
              <span className="h-px flex-1 bg-white/10" /> or{" "}
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={googleLoading}
              className="w-full"
              onClick={onGoogle}
            >
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[100svh] place-items-center bg-[#06070d]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
