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
      {/* ===== Hero with Real Video Background ===== */}
      <section className="relative min-h-[600px] overflow-hidden bg-black">
        {/* Video Background — real humans at events */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src="https://aigc-files.bigmodel.cn/api/cogvideo/2d6fb47e-3387-11f1-ab67-2af25a00ba21_0.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        <div className="relative mx-auto flex min-h-[600px] max-w-6xl flex-col items-center justify-center gap-8 px-6 py-24 text-center md:py-36">
          {/* Brand pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md"
          >
            <CalendarDays className="size-4" />
            EventHub
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            Discover &amp; Create{" "}
            <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-300 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="max-w-xl text-lg text-white/85 drop-shadow-lg"
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
              className="h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-xl shadow-black/30 hover:bg-white/90"
              onClick={() => setCurrentView("events")}
            >
              <CalendarDays className="mr-2 size-5" />
              Explore Events
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-white/40 bg-white/10 px-8 font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              onClick={() =>
                setCurrentView(session ? "dashboard" : "auth")
              }
            >
              {session ? "Dashboard" : "Get Started"}
            </Button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-8 flex flex-col items-center gap-1.5"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1 h-7 w-4.5 rounded-full border-2 border-white/20 p-1"
            >
              <div className="h-2 w-full rounded-full bg-white/40" />
            </motion.div>
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

      {/* ===== Video Showcase Section ===== */}
      <section className="relative overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src="https://aigc-files.bigmodel.cn/api/cogvideo/62395e26-3387-11f1-ab67-2af25a00ba21_0.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80" />

        <AnimatedSection className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Bringing People Together,{" "}
            <span className="text-emerald-300">One Event at a Time</span>
          </h2>
          <p className="max-w-xl text-lg text-white/80">
            From intimate workshops to massive conferences, EventHub powers
            unforgettable experiences for organizers and attendees alike.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-white">120+</span>
              <span className="text-sm text-white/60">Countries</span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-white">24/7</span>
              <span className="text-sm text-white/60">Support</span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-white">10M+</span>
              <span className="text-sm text-white/60">Tickets Sold</span>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src="https://aigc-files.bigmodel.cn/api/cogvideo/6b3324f8-3387-11f1-9fd6-06393149dd5d_0.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <AnimatedSection className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="max-w-md text-white/80">
            Join thousands of event organizers and attendees already using
            EventHub. Create your first event today.
          </p>
          <Button
            size="lg"
            className="mt-2 h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-lg shadow-black/20 hover:bg-white/90"
            onClick={() => setCurrentView("auth")}
          >
            Sign Up Now
          </Button>
        </AnimatedSection>
      </section>
    </div>
  );
}
