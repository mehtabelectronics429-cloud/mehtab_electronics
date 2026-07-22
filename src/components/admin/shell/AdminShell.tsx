"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Icon from "@/components/ui/Icon";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/lib/admin/auth";
import { useUI } from "@/lib/admin/ui-store";
import { NAV } from "@/lib/admin/nav";
import { can } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";

function CommandMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const items = user
    ? NAV.filter(
        (n) =>
          can(user.role, n.cap) &&
          n.label.toLowerCase().includes(q.toLowerCase()),
      )
    : [];
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[var(--admin-panel)]/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="h-4 w-4 text-white/40" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages…"
                className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[0.6rem] text-white/40">
                ESC
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-white/40">
                  No results
                </div>
              ) : (
                items.map((it) => (
                  <button
                    key={it.label}
                    onClick={() => {
                      router.push(it.href);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Icon name={it.icon} className="h-4 w-4 text-white/40" />{" "}
                    {it.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { collapsed, toggle } = useUI();
  const [cmd, setCmd] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setCmd(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // Redirect unauthenticated users once session is known (never during render).
  useEffect(() => {
    if (isLogin || loading) return;
    if (!user) router.replace("/admin/login");
  }, [isLogin, loading, user, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--admin-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-fg)]">
      {/* Fixed sidebar (out of flow); the content column is offset by its width. */}
      <Sidebar />
      <div
        className={cn(
          "flex h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64",
        )}
      >
        {/* Topbar stays pinned; only <main> scrolls. */}
        <Topbar onSearch={() => setCmd(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <CommandMenu open={cmd} onClose={() => setCmd(false)} />
    </div>
  );
}
