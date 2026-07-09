"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (v) => set({ collapsed: v }),
      mobileOpen: false,
      setMobileOpen: (v) => set({ mobileOpen: v }),
    }),
    { name: "me_admin_ui", partialize: (s) => ({ collapsed: s.collapsed }) }
  )
);
