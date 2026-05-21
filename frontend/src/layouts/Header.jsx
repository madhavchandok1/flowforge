import { useLocation } from "react-router";
import { NAV_ITEMS, SETTINGS_NAV } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const currentPage =
    [...NAV_ITEMS, ...SETTINGS_NAV].find((item) =>
      location.pathname.startsWith(item.path)
    )?.label || "Dashboard";

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{currentPage}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
