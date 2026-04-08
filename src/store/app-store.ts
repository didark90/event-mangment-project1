import { create } from "zustand";
import { Session } from "next-auth";

export type ViewType = "home" | "auth" | "dashboard" | "events" | "contact";

interface AppState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "home",
  setCurrentView: (view) => set({ currentView: view }),
  session: null,
  setSession: (session) => set({ session }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
