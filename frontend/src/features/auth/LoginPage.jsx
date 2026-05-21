import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.password.trim()) errs.password = "Password is required";
    else if (form.password.length < 4) errs.password = "Password must be at least 4 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    login();
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-2xl tracking-tight">{APP_NAME}</span>
        </div>

        <Card className="shadow-xl shadow-black/5">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to continue to your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange("username")}
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange("password")}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Demo: enter any username and password (min 4 chars)
        </p>
      </div>
    </div>
  );
}
