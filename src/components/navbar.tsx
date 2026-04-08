"use client";

import { useSession, signOut } from "next-auth/react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CalendarDays,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Home,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ViewType } from "@/store/app-store";

const navItems: { label: string; view: ViewType; icon: React.ReactNode; authOnly?: boolean }[] = [
  { label: "Home", view: "home", icon: <Home className="h-4 w-4" /> },
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, authOnly: true },
  { label: "Events", view: "events", icon: <CalendarDays className="h-4 w-4" /> },
  { label: "Contact", view: "contact", icon: <MessageSquare className="h-4 w-4" /> },
];

export function Navbar() {
  const { data: session } = useSession();
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen } = useAppStore();

  const filteredNavItems = navItems.filter(
    (item) => !item.authOnly || session?.user
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => setCurrentView("home")}
          className="flex items-center gap-2 font-bold text-lg transition-colors hover:text-primary"
        >
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">EventHub</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(item.view)}
              className="flex items-center gap-2"
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden lg:inline">
                    {session.user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{session.user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCurrentView("dashboard")}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCurrentView("events")}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>My Events</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("auth")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentView("auth")}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex flex-col gap-1">
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.view}
                    variant={currentView === item.view ? "secondary" : "ghost"}
                    className="flex items-center gap-3 justify-start"
                    onClick={() => {
                      setCurrentView(item.view);
                      setSidebarOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
              <div className="border-t pt-4">
                {session?.user ? (
                  <div className="flex flex-col gap-2">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 justify-start"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setCurrentView("auth");
                      setSidebarOpen(false);
                    }}
                  >
                    Sign In / Register
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
