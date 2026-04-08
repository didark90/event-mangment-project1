"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  CalendarDays,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app-store";

/* ------------------------------------------------------------------ */
/*  Password requirement helpers                                       */
/* ------------------------------------------------------------------ */
function hasMinLength(pw: string) {
  return pw.length >= 6;
}
function hasNumber(pw: string) {
  return /\d/.test(pw);
}
function hasUppercase(pw: string) {
  return /[A-Z]/.test(pw);
}

const requirements = [
  { label: "At least 6 characters", check: hasMinLength },
  { label: "Contains a number", check: hasNumber },
  { label: "Contains uppercase letter", check: hasUppercase },
] as const;

function PasswordChecks({ password }: { password: string }) {
  return (
    <ul className="space-y-1.5 pt-1">
      {requirements.map((r) => {
        const ok = r.check(password);
        return (
          <li key={r.label} className="flex items-center gap-2 text-sm">
            {ok ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground/40" />
            )}
            <span className={ok ? "text-emerald-600" : "text-muted-foreground"}>
              {r.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared password input                                              */
/* ------------------------------------------------------------------ */
function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 rounded-lg bg-muted/30 pl-10 pr-10 transition-colors focus:bg-background"
          required
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AuthView                                                           */
/* ------------------------------------------------------------------ */
export function AuthView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const { toast } = useToast();

  /* Tab state */
  const [activeTab, setActiveTab] = useState<string>("signin");

  /* Sign in fields */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  /* Register fields */
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  /* ---------- Handlers ---------- */

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        setCurrentView("dashboard");
      }
    } catch {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (!requirements.every((r) => r.check(regPassword))) {
      toast({
        title: "Password too weak",
        description: "Please meet all the password requirements.",
        variant: "destructive",
      });
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please sign in with your new credentials.",
        });
        setActiveTab("signin");
      }
    } catch {
      toast({
        title: "Registration failed",
        description: "Could not reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegLoading(false);
    }
  }

  /* ---------- Render ---------- */

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        {/* ---- Header ---- */}
        <CardHeader className="pb-2">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CalendarDays className="size-5" />
            </div>
            <span className="text-xl font-bold">EventHub</span>
          </div>
          <CardTitle className="text-center text-2xl">
            Welcome
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mx-auto flex w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* ===== Sign In ===== */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5 pt-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-12 rounded-lg bg-muted/30 pl-10 transition-colors focus:bg-background"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <PasswordInput
                  id="login-password"
                  label="Password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  show={showLoginPassword}
                  onToggleShow={() => setShowLoginPassword((v) => !v)}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-lg font-semibold"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ===== Create Account ===== */}
            <TabsContent value="signup">
              <form onSubmit={handleCreateAccount} className="space-y-5 pt-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="h-12 rounded-lg bg-muted/30 pl-10 transition-colors focus:bg-background"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="h-12 rounded-lg bg-muted/30 pl-10 transition-colors focus:bg-background"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <PasswordInput
                  id="reg-password"
                  label="Password"
                  placeholder="Create a password"
                  value={regPassword}
                  onChange={setRegPassword}
                  show={showRegPassword}
                  onToggleShow={() => setShowRegPassword((v) => !v)}
                />

                {/* Password requirements */}
                <PasswordChecks password={regPassword} />

                {/* Confirm Password */}
                <PasswordInput
                  id="reg-confirm-password"
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={regConfirmPassword}
                  onChange={setRegConfirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword((v) => !v)}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-lg font-semibold"
                  disabled={regLoading}
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Back to Home */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setCurrentView("home")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
