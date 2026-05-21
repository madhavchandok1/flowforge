import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "light" ? "dark" : "light";
          document.documentElement.classList.toggle("dark", next === "dark");
          return { theme: next };
        }),
      setTheme: (theme) =>
        set(() => {
          document.documentElement.classList.toggle("dark", theme === "dark");
          return { theme };
        }),
    }),
    {
      name: "flowforge-theme",
      onRehydrate: () => {
        return (state) => {
          if (state?.theme === "dark") {
            document.documentElement.classList.add("dark");
          }
        };
      },
    }
  )
);
