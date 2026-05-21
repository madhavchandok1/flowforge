import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useThemeStore();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user?.name?.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input defaultValue={user?.name} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={user?.email} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input defaultValue={user?.role} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Customize the look and feel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      theme === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications (UI only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Configure notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Email notifications", description: "Receive email updates for task assignments" },
              { label: "Push notifications", description: "Get notified about status changes" },
              { label: "Weekly digest", description: "Receive a weekly summary of activity" },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
                <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors">
                  <span className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg translate-x-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
