"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  CalendarPlus,
  LayoutDashboard,
  Bell,
  Users,
  BarChart3,
  ShieldCheck,
  CalendarDays,
  TrendingUp,
  UserCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
  }),
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */
const stats = [
  { label: "Events Created", value: "500+", icon: CalendarDays, color: "text-emerald-500" },
  { label: "Active Users", value: "1,000+", icon: UserCheck, color: "text-emerald-500" },
  { label: "Categories", value: "50+", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Satisfaction", value: "99%", icon: Star, color: "text-emerald-500" },
];

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: CalendarPlus,
    title: "Event Creation",
    description:
      "Create stunning events in minutes with our intuitive builder. Customize every detail from date to description.",
  },
  {
    icon: LayoutDashboard,
    title: "Easy Management",
    description:
      "Manage all your events from a single dashboard. Track attendees, update details, and monitor progress.",
  },
  {
    icon: Bell,
    title: "Real-time Updates",
    description:
      "Stay informed with instant notifications. Get alerts for new registrations, changes, and reminders.",
  },
  {
    icon: Users,
    title: "Community Hub",
    description:
      "Connect with event-goers and organizers. Build meaningful relationships within your community.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Gain insights with powerful analytics. Track attendance, engagement, and revenue in real-time.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    description:
      "Your data is protected with enterprise-grade security. Privacy and safety are our top priorities.",
  },
];

/* ------------------------------------------------------------------ */
/*  HomeView                                                           */
/* ------------------------------------------------------------------ */
export function HomeView() {
  const { data: session } = useSession();
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  return (
    <div className="flex flex-col">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-36">
          {/* Brand pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
          >
            <CalendarDays className="size-4" />
            EventHub
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            Discover &amp; Create{" "}
            <span className="bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="max-w-xl text-lg text-emerald-100"
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
          >
            The all-in-one platform to organize, discover, and attend events
            that bring people together. Start building your community today.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <Button
              size="lg"
              className="h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-lg hover:bg-white/90"
              onClick={() => setCurrentView("events")}
            >
              Explore Events
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-white/40 bg-transparent px-8 font-semibold text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                setCurrentView(session ? "dashboard" : "auth")
              }
            >
              {session ? "Dashboard" : "Get Started"}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-12 md:grid-cols-4 md:gap-8">
          {stats.map((s, i) => (
            <AnimatedSection key={s.label}>
              <motion.div
                custom={i}
                variants={fadeUp}
                className="flex flex-col items-center gap-2 text-center"
              >
                <s.icon className={`size-8 ${s.color}`} />
                <span className="text-3xl font-bold tracking-tight">
                  {s.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {s.label}
                </span>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <AnimatedSection>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose <span className="text-emerald-600">EventHub</span>?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Everything you need to plan, promote, and manage unforgettable
            events — all in one place.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <AnimatedSection key={f.title}>
              <motion.div
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
                className="group flex flex-col gap-4 rounded-xl border bg-card p-6 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                  <f.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700">
        <AnimatedSection className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="max-w-md text-emerald-100">
            Join thousands of event organizers and attendees already using
            EventHub. Create your first event today.
          </p>
          <Button
            size="lg"
            className="mt-2 h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-lg hover:bg-white/90"
            onClick={() => setCurrentView("auth")}
          >
            Sign Up Now
          </Button>
        </AnimatedSection>
      </section>
    </div>
  );
}
