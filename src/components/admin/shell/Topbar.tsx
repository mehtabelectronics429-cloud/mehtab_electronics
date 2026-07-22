"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Command,
} from "lucide-react";
import Icon from "@/components/ui/Icon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/admin/auth";
import { useUI } from "@/lib/admin/ui-store";
import { NOTIFICATIONS } from "@/lib/admin/mock-data";
import { cn } from "@/lib/utils";

function crumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean); // ["admin", "customers"]
  return parts.map((p, i) => ({
    label:
      p === "admin"
        ? "Home"
        : p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export default function Topbar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setMobileOpen } = useUI();
  const [openN, setOpenN] = useState(false);
  const [openP, setOpenP] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const bc = crumbs(pathname);

  useEffect(() => {
    setOpenN(false);
    setOpenP(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[var(--admin-bg)]/80 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/5 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="hidden items-center gap-1.5 text-sm sm:flex">
        {bc.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-white/25" />}
            <Link
              href={c.href}
              className={cn(
                i === bc.length - 1
                  ? "text-white"
                  : "text-white/45 hover:text-white/80",
              )}
            >
              {c.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onSearch}
          className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/40 hover:bg-white/10"
        >
          <Search className="h-3.5 w-3.5" />{" "}
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-2 hidden items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[0.6rem] text-white/50 sm:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenN((v) => !v);
              setOpenP(false);
            }}
            className="relative grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/5"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-cyan px-1 text-[0.55rem] font-bold text-obsidian">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {openN && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenN(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0c0e16]/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="px-3 py-2 text-xs font-semibold text-white/70">
                    Notifications
                  </div>
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-cyan ring-1 ring-white/10",
                        )}
                      >
                        <Icon
                          name={
                            n.kind === "stock"
                              ? "PackageMinus"
                              : n.kind === "payment"
                                ? "Wallet"
                                : "Bell"
                          }
                          className="h-4 w-4"
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm text-white">
                          {n.title}
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                          )}
                        </div>
                        <div className="truncate text-xs text-white/50">
                          {n.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />

        {/* profile */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenP((v) => !v);
              setOpenN(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-white/5"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-electric to-cyan text-xs font-bold text-white">
              {user?.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium text-white">
                {user?.name}
              </span>
              <span className="block text-[0.65rem] capitalize text-white/40">
                {user?.role}
              </span>
            </span>
          </button>
          <AnimatePresence>
            {openP && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenP(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-white/10 bg-[#0c0e16]/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="px-3 py-2">
                    <div className="text-sm text-white">{user?.name}</div>
                    <div className="text-xs text-white/40">{user?.email}</div>
                  </div>
                  <div className="my-1 h-px bg-white/10" />
                  <Link
                    href="/admin/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
