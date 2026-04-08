"use client";

import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/app-store";
import { useSession } from "next-auth/react";

export function Footer() {
  const { setCurrentView } = useAppStore();
  const { data: session } = useSession();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>EventHub</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your all-in-one platform for creating, managing, and discovering
              amazing events. Connect with your community today.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => setCurrentView("home")}
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("events")}
                  className="hover:text-foreground transition-colors"
                >
                  Browse Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView(session ? "events" : "auth")}
                  className="hover:text-foreground transition-colors"
                >
                  Create Event
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("contact")}
                  className="hover:text-foreground transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@eventhub.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Event Street, Suite 100</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
          <p>
            Built with Next.js, Tailwind CSS & shadcn/ui
          </p>
        </div>
      </div>
    </footer>
  );
}
