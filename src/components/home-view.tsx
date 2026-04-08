"use client";

import { useAppStore } from "@/store/app-store";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const features = [
  {
    icon: <CalendarDays className="h-8 w-8" />,
    title: "Create Events",
    description:
      "Easily create and manage events with all the details your attendees need.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community",
    description:
      "Connect with event organizers and attendees in your local community.",
  },
  {
    icon: <MapPin className="h-8 w-8" />,
    title: "Discover",
    description:
      "Find exciting events happening near you across various categories.",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Dashboard",
    description:
      "Track your event performance with detailed analytics and insights.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure",
    description:
      "Your data is safe with us. Enterprise-grade security for all users.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Fast & Reliable",
    description:
      "Lightning-fast performance ensures your events load in milliseconds.",
  },
];

export function HomeView() {
  const { setCurrentView } = useAppStore();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Event Management Made Simple
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Create & Manage{" "}
                <span className="text-primary">Amazing Events</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                The all-in-one platform for event organizers. Create, manage, and
                promote your events with ease. Join thousands of users who trust
                EventHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="text-base px-8"
                  onClick={() =>
                    setCurrentView(session ? "events" : "auth")
                  }
                >
                  {session ? "My Events" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8"
                  onClick={() => setCurrentView("events")}
                >
                  Browse Events
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero.png"
                  alt="Event management platform hero"
                  width={576}
                  height={432}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Events Created" },
              { value: "5K+", label: "Active Users" },
              { value: "50+", label: "Categories" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything You Need
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Our platform provides all the tools you need to create successful
            events, from planning to execution.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group cursor-default">
                <CardContent className="p-6 space-y-4">
                  <div className="text-primary group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join EventHub today and start creating unforgettable events. It&apos;s free
            to get started!
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-base px-8"
            onClick={() => setCurrentView(session ? "events" : "auth")}
          >
            {session ? "Go to Dashboard" : "Create Free Account"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
