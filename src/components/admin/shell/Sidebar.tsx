"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import Icon from "@/components/ui/Icon";
import { LOGO_MARK } from "@/lib/assets";
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

  const width = collapsed ? "w-[76px]" : "w-64";

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
          "admin-sidebar fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-white/10 transition-[width,transform] duration-300",
          width,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
              <Image
                src={LOGO_MARK}
                alt="Mehtab Electronics"
                width={210}
                height={178}
                className="h-[78%] w-[78%] object-contain"
                priority
              />
            </span>
            {!collapsed && (
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
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g}>
              {!collapsed && (
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
                          collapsed && "justify-center",
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
                        {!collapsed && (
                          <span className="relative z-10">{item.label}</span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--admin-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
