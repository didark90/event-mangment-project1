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
/*  Event Video-Style Interactive Background                            */
/* ------------------------------------------------------------------ */
type ShapeType = "ticket" | "star" | "confetti" | "note" | "ring" | "pin" | "bokeh" | "sparkle";

interface FloatingElement {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: ShapeType;
  depth: number;        // 0-1, controls parallax strength
  color: string;
  pulse: number;        // for bokeh glow pulsing
  pulseSpeed: number;
}

function EventVideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0-1
  const elementsRef = useRef<FloatingElement[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const colors = [
    "rgba(255,255,255,",   // white
    "rgba(167,243,208,",  // emerald-300
    "rgba(110,231,183,",  // emerald-400
    "rgba(52,211,153,",   // emerald-500
    "rgba(255,255,255,",  // white
    "rgba(204,251,241,",  // teal-200
    "rgba(153,246,228,",  // teal-300
  ];

  const createElement = useCallback((w: number, h: number, type?: ShapeType): FloatingElement => {
    const types: ShapeType[] = ["ticket", "star", "confetti", "note", "ring", "pin", "bokeh", "sparkle"];
    const t = type || types[Math.floor(Math.random() * types.length)];
    const depth = t === "bokeh" ? Math.random() * 0.3 + 0.1 : Math.random() * 0.7 + 0.3;
    const size = t === "bokeh"
      ? Math.random() * 60 + 30
      : t === "ring"
        ? Math.random() * 25 + 10
        : t === "ticket"
          ? Math.random() * 18 + 14
          : Math.random() * 8 + 4;

    return {
      x: Math.random() * w,
      y: Math.random() * h,
      baseX: Math.random() * w,
      baseY: Math.random() * h,
      vx: (Math.random() - 0.5) * (t === "bokeh" ? 0.15 : 0.4),
      vy: t === "confetti" ? Math.random() * 0.3 + 0.15 : (Math.random() - 0.5) * 0.3,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      opacity: t === "bokeh" ? Math.random() * 0.12 + 0.04 : Math.random() * 0.4 + 0.15,
      type: t,
      depth,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    };
  }, []);

  const initElements = useCallback((w: number, h: number) => {
    const els: FloatingElement[] = [];
    // Background bokeh (large, slow, faint)
    for (let i = 0; i < 8; i++) els.push(createElement(w, h, "bokeh"));
    // Mid-ground: rings, tickets, notes
    for (let i = 0; i < 6; i++) els.push(createElement(w, h, "ring"));
    for (let i = 0; i < 5; i++) els.push(createElement(w, h, "ticket"));
    for (let i = 0; i < 4; i++) els.push(createElement(w, h, "note"));
    // Foreground: stars, confetti, sparkles, pins
    for (let i = 0; i < 10; i++) els.push(createElement(w, h, "star"));
    for (let i = 0; i < 15; i++) els.push(createElement(w, h, "confetti"));
    for (let i = 0; i < 8; i++) els.push(createElement(w, h, "sparkle"));
    for (let i = 0; i < 4; i++) els.push(createElement(w, h, "pin"));
    elementsRef.current = els;
  }, [createElement]);

  // Draw helpers
  const drawTicket = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(el.rotation);
    ctx.globalAlpha = el.opacity;
    const s = el.size;

    // Ticket body
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s * 0.6, s, s * 1.2, 3);
    ctx.strokeStyle = el.color + "0.8)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Dashed separator
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(-s / 2 + 4, 0);
    ctx.lineTo(s / 2 - 4, 0);
    ctx.strokeStyle = el.color + "0.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.setLineDash([]);

    // Star on ticket stub
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = 3;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r + 0;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = el.color + "0.6)";
    ctx.fill();

    ctx.restore();
  }, []);

  const drawStar = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(el.rotation);
    ctx.globalAlpha = el.opacity;
    const s = el.size;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      ctx.lineTo(Math.cos(outerAngle) * s, Math.sin(outerAngle) * s);
      ctx.lineTo(Math.cos(innerAngle) * s * 0.4, Math.sin(innerAngle) * s * 0.4);
    }
    ctx.closePath();
    ctx.fillStyle = el.color + "0.7)";
    ctx.fill();
    ctx.restore();
  }, []);

  const drawSparkle = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(el.rotation);
    ctx.globalAlpha = el.opacity * (0.6 + Math.sin(el.pulse) * 0.4);
    const s = el.size;

    // 4-point sparkle
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0);
    ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s);
    ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0);
    ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s);
    ctx.fillStyle = el.color + "0.8)";
    ctx.fill();
    ctx.restore();
  }, []);

  const drawConfetti = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(el.rotation);
    ctx.globalAlpha = el.opacity;
    const s = el.size;
    ctx.fillStyle = el.color + "0.6)";
    ctx.fillRect(-s / 2, -s / 4, s, s / 2);
    ctx.restore();
  }, []);

  const drawNote = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(el.rotation);
    ctx.globalAlpha = el.opacity;
    const s = el.size;

    // Note head (ellipse)
    ctx.beginPath();
    ctx.ellipse(0, s * 0.3, s * 0.35, s * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = el.color + "0.7)";
    ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.moveTo(s * 0.3, s * 0.2);
    ctx.lineTo(s * 0.3, -s * 0.7);
    ctx.strokeStyle = el.color + "0.7)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Flag
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.8, -s * 0.4, s * 0.3, -s * 0.1);
    ctx.strokeStyle = el.color + "0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }, []);

  const drawRing = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(el.rotation);
    ctx.globalAlpha = el.opacity;
    ctx.beginPath();
    ctx.arc(0, 0, el.size, 0, Math.PI * 2);
    ctx.strokeStyle = el.color + "0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawPin = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.globalAlpha = el.opacity;
    const s = el.size;

    // Pin head (teardrop)
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.6, s * 0.3, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.6, -s * 0.5, 0, -s);
    ctx.fillStyle = el.color + "0.6)";
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(0, -s * 0.3, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16,185,129,0.8)";
    ctx.fill();

    ctx.restore();
  }, []);

  const drawBokeh = useCallback((ctx: CanvasRenderingContext2D, el: FloatingElement) => {
    ctx.save();
    ctx.globalAlpha = el.opacity * (0.7 + Math.sin(el.pulse) * 0.3);
    const gradient = ctx.createRadialGradient(el.x, el.y, 0, el.x, el.y, el.size);
    gradient.addColorStop(0, el.color + "0.15)");
    gradient.addColorStop(0.5, el.color + "0.06)");
    gradient.addColorStop(1, el.color + "0)");
    ctx.beginPath();
    ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ring edge
    ctx.beginPath();
    ctx.arc(el.x, el.y, el.size * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = el.color + "0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
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
      initElements(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    canvas.addEventListener("mousemove", handleMouse);

    // Spotlight sweep
    let spotlightAngle = 0;

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      timeRef.current += 1;
      const t = timeRef.current;
      const mouse = mouseRef.current;

      // -- Spotlight rays from top-center --
      spotlightAngle += 0.003;
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const angle = spotlightAngle + (i * Math.PI * 2) / 3;
        const cx = width * 0.5 + Math.cos(angle) * width * 0.3;
        const gradient = ctx.createLinearGradient(cx, 0, cx + Math.sin(angle) * 100, height * 0.8);
        gradient.addColorStop(0, "rgba(255,255,255,0.04)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(cx - 40, 0);
        ctx.lineTo(cx - 120, height);
        ctx.lineTo(cx + 120, height);
        ctx.lineTo(cx + 40, 0);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      ctx.restore();

      // -- Draw all floating elements --
      const elements = elementsRef.current;
      const parallaxStrength = 60; // max px shift at depth=1

      for (const el of elements) {
        // Parallax offset based on mouse position and element depth
        const offsetX = (mouse.x - 0.5) * parallaxStrength * el.depth;
        const offsetY = (mouse.y - 0.5) * parallaxStrength * el.depth;
        el.x = el.baseX + offsetX;
        el.y = el.baseY + offsetY;

        // Natural drift
        el.baseX += el.vx;
        el.baseY += el.vy;

        // Wrap around edges with buffer
        if (el.baseX < -60) el.baseX = width + 60;
        if (el.baseX > width + 60) el.baseX = -60;
        if (el.baseY < -60) el.baseY = height + 60;
        if (el.baseY > height + 60) el.baseY = -60;

        // Rotation
        el.rotation += el.rotationSpeed;
        el.pulse += el.pulseSpeed;

        // Draw by type
        switch (el.type) {
          case "ticket": drawTicket(ctx, el); break;
          case "star": drawStar(ctx, el); break;
          case "confetti": drawConfetti(ctx, el); break;
          case "note": drawNote(ctx, el); break;
          case "ring": drawRing(ctx, el); break;
          case "pin": drawPin(ctx, el); break;
          case "bokeh": drawBokeh(ctx, el); break;
          case "sparkle": drawSparkle(ctx, el); break;
        }
      }

      // -- Floating light streaks (like video light leaks) --
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const streakY = ((t * 0.3 + i * 150) % (height + 200)) - 100;
        const streakX = width * (0.15 + i * 0.25) + Math.sin(t * 0.005 + i) * 40;
        const grad = ctx.createLinearGradient(streakX - 2, streakY, streakX + 2, streakY);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, "rgba(255,255,255,0.04)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(streakX - 1.5, streakY, 3, 120);
      }
      ctx.restore();

      // -- Mouse cursor glow --
      if (mouse.x > 0 && mouse.x < 1 && mouse.y > 0 && mouse.y < 1) {
        const mx = mouse.x * width;
        const my = mouse.y * height;
        const cursorGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 100);
        cursorGrad.addColorStop(0, "rgba(255,255,255,0.06)");
        cursorGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(mx, my, 100, 0, Math.PI * 2);
        ctx.fillStyle = cursorGrad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, [initElements, drawTicket, drawStar, drawSparkle, drawConfetti, drawNote, drawRing, drawPin, drawBokeh]);

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
      {/* ===== Hero with Event Video Background ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900">
        {/* Interactive event-themed canvas */}
        <EventVideoBackground />

        {/* Gradient overlays for cinematic depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center md:py-36">
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
            className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl"
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
            className="max-w-xl text-lg text-emerald-100/90 drop-shadow-md"
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
              className="h-12 rounded-lg bg-white px-8 font-semibold text-emerald-700 shadow-xl shadow-black/20 hover:bg-white/90"
              onClick={() => setCurrentView("events")}
            >
              <CalendarDays className="mr-2 size-5" />
              Explore Events
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-white/30 bg-white/10 px-8 font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
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
            className="mt-10 flex flex-col items-center gap-1.5"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-7 w-4.5 rounded-full border-2 border-white/20 p-1"
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

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
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
