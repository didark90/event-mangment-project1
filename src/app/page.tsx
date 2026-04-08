"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeView } from "@/components/home-view";
import { AuthView } from "@/components/auth-view";
import { DashboardView } from "@/components/dashboard-view";
import { EventsView } from "@/components/events-view";
import { ContactView } from "@/components/contact-view";

function AppContent() {
  const { data: session, status } = useSession();
  const { currentView, setCurrentView, setSession } = useAppStore();

  // Sync session to zustand store
  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  // Redirect to auth if trying to access dashboard without session
  useEffect(() => {
    if (currentView === "dashboard" && !session && status !== "loading") {
      setCurrentView("auth");
    }
  }, [currentView, session, status, setCurrentView]);

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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col">{renderView()}</main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
