"use client";

import { useSession, signOut } from "next-auth/react";
import { CalendarDays, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore, type ViewType } from "@/store/app-store";

const navLinks: { label: string; view: ViewType; authOnly?: boolean }[] = [
  { label: "Home", view: "home" },
  { label: "Events", view: "events" },
  { label: "Dashboard", view: "dashboard", authOnly: true },
  { label: "Contact", view: "contact" },
];

export function Navbar() {
  const { data: session } = useSession();
  const { currentView, setCurrentView } = useAppStore();

  const visibleLinks = navLinks.filter(
    (link) => !link.authOnly || session
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          onClick={() => setCurrentView("home")}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <CalendarDays className="size-6 text-emerald-500" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            EventHub
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {visibleLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => setCurrentView(link.view)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                currentView === link.view
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 md:flex">
            {session ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Hi, <span className="font-medium text-foreground">{session.user?.name}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView("auth")}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentView("auth")}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <CalendarDays className="size-5 text-emerald-500" />
                    EventHub
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4" aria-label="Mobile navigation">
                  {visibleLinks.map((link) => (
                    <button
                      key={link.view}
                      onClick={() => {
                        setCurrentView(link.view);
                      }}
                      className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        currentView === link.view
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-auto border-t px-4 pt-4">
                  {session ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Signed in as{" "}
                        <span className="font-medium text-foreground">
                          {session.user?.name}
                        </span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => signOut()}
                      >
                        <LogOut className="size-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setCurrentView("auth")}
                      >
                        Login
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => setCurrentView("auth")}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
