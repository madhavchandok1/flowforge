import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import { NAV_ITEMS, SETTINGS_NAV, APP_NAME } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import logo from "@/assets/images/logo.png";
import logoSimplified from "@/assets/images/logo-simplified.png";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
      <div className="relative">
        <aside
          className={cn(
            "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-in-out",
            collapsed ? "w-[68px]" : "w-[260px]"
          )}
        >
          {/* Header */}
          <div className={cn("flex items-center justify-center h-16")}>
            <img
              src={collapsed ? logoSimplified : logo}
              alt={APP_NAME}
              className="h-10 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon size={20} className="shrink-0" />
                <AnimatePresence mode="popLayout">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-1">
          <Separator className="mb-3 bg-sidebar-border" />

          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon size={20} className="shrink-0" />
                <AnimatePresence mode="popLayout">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}

          {/* User Section */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 mt-2",
              collapsed ? "justify-center" : ""
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="popLayout">
              {!collapsed && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-sm font-medium text-sidebar-accent-foreground truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs text-sidebar-foreground/50 truncate">
                    {user?.email}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-50 p-1 rounded-md bg-sidebar hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>
      </div>
  );
}
