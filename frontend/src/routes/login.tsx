import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import { Grid2x2, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth.js";
import { api } from "@/lib/api.js";
import { Button } from "@/components/kit/Button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SupplyX SCM" },
      { name: "description", content: "Sign in to your SupplyX workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // If user is already authenticated, redirect to home
  React.useEffect(() => {
    if (user) {
      void navigate({ to: "/" });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post<{ token: string; user: any }>("/users/login", {
        email,
        password,
      });

      login(res.token, res.user);
      toast.success("Welcome back to SupplyX!");
      
      // Force page reload to apply all route conditions and fetch profile freshly
      window.location.assign("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0b0d] px-4 font-sans text-white">
      {/* Dynamic abstract grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.12]" />
      
      {/* Background ambient light gradients */}
      <div className="absolute -top-40 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative w-full max-w-[400px]">
        {/* Workspace Brand Logo / Title */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5 mb-3">
            <Grid2x2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SupplyX SCM Suite</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Enterprise supply chain management workspace
          </p>
        </div>

        {/* Glassmorphic Login Form Container */}
        <div className="rounded-sm border border-white/[0.06] bg-[#111215]/80 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="text-[16px] font-semibold text-white mb-5">Sign in to workspace</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 text-[12px] text-destructive-foreground">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-sm border border-white/[0.08] bg-[#1a1b20] pl-10 pr-3 text-[13px] text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-sm border border-white/[0.08] bg-[#1a1b20] pl-10 pr-3 text-[13px] text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center h-10 mt-2 font-semibold text-[13px] tracking-wide"
              disabled={loading}
            >
              {loading ? "Authenticating..." : (
                <>
                  Enter Workspace
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-5 rounded-sm border border-white/[0.04] bg-[#111215]/40 p-4 text-center">
          <p className="text-[12px] font-medium text-[#0078d4]">Demo Administrator Access Credentials:</p>
          <div className="mt-1.5 flex justify-center gap-4 text-[11px] text-muted-foreground">
            <div>
              <span className="font-semibold text-white">Email:</span> superadmin@supplyx.com
            </div>
            <div>
              <span className="font-semibold text-white">Password:</span> Password123
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Protected by enterprise security systems. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
