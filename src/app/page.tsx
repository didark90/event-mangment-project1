"use client";

import { useSession, SessionProvider } from "next-auth/react";
import { useAppStore } from "@/store/app-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeView } from "@/components/home-view";
import { AuthView } from "@/components/auth-view";
import { DashboardView } from "@/components/dashboard-view";
import { EventsView } from "@/components/events-view";
import { ContactView } from "@/components/contact-view";
import { useEffect } from "react";

function AppContent() {
  const { currentView, setSession } = useAppStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  // Redirect to login if accessing protected routes
  useEffect(() => {
    if (currentView === "dashboard" && !session && status !== "loading") {
      useAppStore.getState().setCurrentView("auth");
    }
  }, [currentView, session, status]);

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView />;
      case "auth":
        return <AuthView />;
      case "dashboard":
        return session ? <DashboardView /> : <AuthView />;
      case "events":
        return <EventsView />;
      case "contact":
        return <ContactView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{renderView()}</main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
