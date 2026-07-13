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
import { useAuth, DEMO_ACCOUNTS, googleAuthEnabled } from "@/lib/admin/auth";

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
    setValue,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user && !redirected.current) {
      redirected.current = true;
      window.location.assign(from.startsWith("/admin") ? from : "/admin");
    }
  }, [user, from]);

  useEffect(() => {
    if (params.get("error")) toast.error("Sign-in failed. Try again.");
  }, [params]);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    const res = await login(data.email, data.password);
    if (res.ok) {
      toast.success("Welcome back");
      redirected.current = true;
      // Full navigation so middleware + session cookie are in sync.
      window.location.assign(from.startsWith("/admin") ? from : "/admin");
      return;
    }
    setLoading(false);
    toast.error(res.error || "Login failed");
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    await loginWithGoogle();
  };

  if (authLoading || user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#06070d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen cursor-auto place-items-center bg-[#06070d] px-4 text-white">
      <div className="pointer-events-none fixed inset-0 opacity-60 [background:radial-gradient(60%_50%_at_50%_0%,rgba(46,107,255,0.18),transparent),radial-gradient(50%_40%_at_80%_100%,rgba(34,224,255,0.12),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyan">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <div>
            <div className="font-display text-sm tracking-wider">MEHTAB</div>
            <div className="text-xs text-white/40">Admin Console</div>
          </div>
        </div>

        <h1 className="mt-7 font-display text-xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-white/45">
          Access the operations dashboard.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@mehtab.pk"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
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

        {/* <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-2 text-[0.7rem] uppercase tracking-wider text-white/35">Demo accounts</div>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setValue("email", a.email);
                  setValue("password", a.password);
                }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div> */}
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#06070d]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
