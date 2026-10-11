"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft, LogOut, X } from "lucide-react";
import Icon from "@/components/ui/Icon";
import BrandMark from "@/components/ui/BrandMark";
import { NAV } from "@/lib/admin/nav";
import { can } from "@/lib/admin/permissions";
import { useAuth } from "@/lib/admin/auth";
import { useUI } from "@/lib/admin/ui-store";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useUI();
  if (!user) return null;

  const items = NAV.filter((n) => can(user.role, n.cap));
  const groups = Array.from(new Set(items.map((i) => i.group)));

  // The phone drawer is always full width with labels; collapsing is desktop-only.
  const mini = collapsed && !mobileOpen;
  const width = collapsed ? "w-[85vw] max-w-72 lg:w-[76px]" : "w-[85vw] max-w-72 lg:w-64";

  return (
    <>
      {/* mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-50 flex h-[100dvh] flex-col border-r border-white/10 transition-[width,transform] duration-300",
          width,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <BrandMark size={36} priority />
            {!mini && (
              <span className="font-display text-sm uppercase tracking-wider text-[var(--admin-fg)]">
                Mehtab <span className="text-brand">Electronics</span>
              </span>
            )}
          </Link>
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto hidden h-8 w-8 place-items-center rounded-lg text-[var(--admin-muted)] hover:bg-white/5 hover:text-[var(--admin-fg)] lg:grid"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-[var(--admin-muted)] hover:bg-white/5 hover:text-[var(--admin-fg)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g}>
              {!mini && (
                <div className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-wider text-[var(--admin-label)]">
                  {g}
                </div>
              )}
              <div className="space-y-1">
                {items
                  .filter((i) => i.group === g)
                  .map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "font-medium text-[var(--admin-active-fg)]"
                            : "text-[var(--admin-muted)] hover:bg-white/5 hover:text-[var(--admin-fg)]",
                          mini && "justify-center",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-active-admin"
                            className="absolute inset-0 rounded-xl border border-[var(--admin-active-border)] bg-[var(--admin-active-bg)]"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            }}
                          />
                        )}
                        <Icon
                          name={item.icon}
                          className="relative z-10 h-[18px] w-[18px] shrink-0"
                        />
                        {!mini && (
                          <span className="relative z-10">{item.label}</span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--admin-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300",
              mini && "justify-center",
            )}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!mini && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
