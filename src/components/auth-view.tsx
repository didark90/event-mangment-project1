"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      {requirements.map((req) => (
        <div key={req.label} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          )}
          <span
            className={
              req.met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AuthView() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regPassword, setRegPassword] = useState("");
  const { setCurrentView } = useAppStore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description:
            result.error === "CredentialsSignin"
              ? "Invalid email or password"
              : "Something went wrong. Please try again.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        setCurrentView("dashboard");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegisterLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Passwords do not match.",
      });
      setIsRegisterLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Account Created!",
          description: "Please sign in with your new account.",
        });
        // Switch to login tab
        const loginTab = document.querySelector(
          '[data-value="login"]'
        ) as HTMLElement;
        loginTab?.click();
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.error || "Something went wrong.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EventHub</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            Join our community and start creating amazing events today.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-6 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger
              value="login"
              data-value="login"
              className="h-10 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              data-value="register"
              className="h-10 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="mt-0">
            <Card className="border-border/60 shadow-lg shadow-black/5 dark:shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Welcome Back</CardTitle>
                <CardDescription className="text-sm">
                  Sign in to manage your events
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-5 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11 h-12 text-sm rounded-lg border-border/80 bg-muted/30 focus-visible:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-11 pr-11 h-12 text-sm rounded-lg border-border/80 bg-muted/30 focus-visible:bg-background transition-colors"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold rounded-lg"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register" className="mt-0">
            <Card className="border-border/60 shadow-lg shadow-black/5 dark:shadow-black/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Create Account</CardTitle>
                <CardDescription className="text-sm">
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-5 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-name"
                      className="text-sm font-medium"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="reg-name"
                        name="name"
                        placeholder="John Doe"
                        className="pl-11 h-12 text-sm rounded-lg border-border/80 bg-muted/30 focus-visible:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11 h-12 text-sm rounded-lg border-border/80 bg-muted/30 focus-visible:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="reg-password"
                        name="password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-11 pr-11 h-12 text-sm rounded-lg border-border/80 bg-muted/30 focus-visible:bg-background transition-colors"
                        required
                        minLength={6}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <PasswordRequirements password={regPassword} />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-confirm"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="reg-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-11 pr-11 h-12 text-sm rounded-lg border-border/80 bg-muted/30 focus-visible:bg-background transition-colors"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold rounded-lg"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to home link */}
        <button
          onClick={() => setCurrentView("home")}
          className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-8 py-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
