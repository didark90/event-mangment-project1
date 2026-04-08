"use client";

import { CalendarDays, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useAppStore, type ViewType } from "@/store/app-store";

const quickLinks: { label: string; view: ViewType }[] = [
  { label: "Home", view: "home" },
  { label: "Events", view: "events" },
  { label: "Dashboard", view: "dashboard" },
  { label: "Contact", view: "contact" },
];

const socialLinks = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Mail, label: "Email", href: "#" },
];

export function Footer() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <CalendarDays className="size-5 text-emerald-500" />
              <span>EventHub</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Discover, create, and share amazing events with your community.
              Your next unforgettable experience starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.view}>
                    <button
                      onClick={() => setCurrentView(link.view)}
                      className="text-sm text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-emerald-500 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2024 EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
