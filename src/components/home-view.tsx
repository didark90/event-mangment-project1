"use client";

import { useRef, useEffect, useCallback } from "react";
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
/*  Interactive Particle Network Background                              */
/* ------------------------------------------------------------------ */
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
  }

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 12000), 80);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const MOUSE_RADIUS = 160;
    const CONNECTION_DIST = 140;
    const MOUSE_CONNECTION_DIST = 200;

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse attraction/repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.02;
          p.vy += (dy / dist) * force * 0.02;
        }

        // Speed damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Draw particle with glow
        const isNearMouse = dist < MOUSE_RADIUS;
        const glowOpacity = isNearMouse
          ? Math.min(p.opacity + 0.4, 0.9)
          : p.opacity;
        const glowRadius = isNearMouse ? p.radius * 2.5 : p.radius * 1.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${glowOpacity * 0.15})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${glowOpacity})`;
        ctx.fill();

        // Connections between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < CONNECTION_DIST) {
            const opacity = (1 - cdist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Connection to mouse cursor
        if (dist < MOUSE_CONNECTION_DIST && dist > 0) {
          const opacity = (1 - dist / MOUSE_CONNECTION_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Mouse glow dot
          if (i === 0) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, 0.08)`;
            ctx.fill();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "auto" }}
    />
  );
}

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
      {/* ===== Hero with Interactive Particle Background ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Interactive particle canvas */}
        <ParticleNetwork />

        {/* Decorative gradient overlays for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-36">
          {/* Brand pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
          >
            <CalendarDays className="size-4" />
            EventHub
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl"
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
            className="max-w-xl text-lg text-emerald-100 drop-shadow-sm"
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
              className="h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-lg shadow-black/10 hover:bg-white/90"
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

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-8 flex flex-col items-center gap-1"
          >
            <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1 h-6 w-4 rounded-full border-2 border-white/30 p-0.5"
            >
              <div className="h-1.5 w-full rounded-full bg-white/50" />
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

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Subtle decoration */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-white/5 blur-3xl" />

        <AnimatedSection className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="max-w-md text-emerald-100">
            Join thousands of event organizers and attendees already using
            EventHub. Create your first event today.
          </p>
          <Button
            size="lg"
            className="mt-2 h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-lg shadow-black/10 hover:bg-white/90"
            onClick={() => setCurrentView("auth")}
          >
            Sign Up Now
          </Button>
        </AnimatedSection>
      </section>
    </div>
  );
}
