import { create } from "zustand";
import { currentUser } from "@/lib/mock-data";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: () => set({ user: currentUser, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
