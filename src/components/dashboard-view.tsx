"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  Mail,
  MapPin,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";

interface EventUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: EventUser;
}

interface CategoryStat {
  name: string;
  count: number;
}

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  upcomingEvents: number;
  messages: number;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  ongoing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatEventDate(dateStr);
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-3xl font-bold tracking-tight"
    >
      {value}
    </motion.span>
  );
}

function StatsCard({
  icon: Icon,
  label,
  value,
  colorClasses,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  colorClasses: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-full ${colorClasses}`}
          >
            <Icon className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0">
            <AnimatedNumber value={value} />
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CategoryBreakdownLoading() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentEventsLoading() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CategoryBreakdown({
  categories,
}: {
  categories: CategoryStat[];
}) {
  if (categories.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No events yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...categories.map((c) => c.count));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-foreground">
                {cat.name}
              </span>
              <span className="text-muted-foreground">
                {cat.count} event{cat.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(cat.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.08, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentEventsList({
  events,
  onNavigateToEvents,
}: {
  events: EventData[];
  onNavigateToEvents: () => void;
}) {
  if (events.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No events yet. Create one!
            </p>
            <Button
              variant="link"
              className="mt-2 text-emerald-600"
              onClick={onNavigateToEvents}
            >
              Create Event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {events.map((event, index) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <button
                onClick={onNavigateToEvents}
                className="group w-full rounded-lg border p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {event.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {event.category}
                  </Badge>
                </div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {formatRelativeDate(event.createdAt)}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const { data: session } = useSession();
  const { setCurrentView } = useAppStore();

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/events");
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Unable to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Compute stats
  const stats: DashboardStats = {
    totalEvents: events.length,
    totalUsers: new Set(events.map((e) => e.userId)).size,
    upcomingEvents: events.filter((e) => {
      if (e.status === "upcoming") return true;
      return new Date(e.date) > new Date();
    }).length,
    messages: 0,
  };

  // Compute categories
  const categoryMap = new Map<string, number>();
  events.forEach((e) => {
    const cat = e.category || "general";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });
  const categories: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Recent events (last 5 by createdAt desc)
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleNavigateToEvents = () => {
    setCurrentView("events");
  };

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
              Here&apos;s what&apos;s happening.
            </p>
          </div>
          <Button
            onClick={handleNavigateToEvents}
            className="shrink-0"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Event</span>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {loading ? (
          <StatsLoadingSkeleton />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <StatsCard
                icon={Calendar}
                label="Total Events"
                value={stats.totalEvents}
                colorClasses="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
              />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <StatsCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                colorClasses="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300"
              />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <StatsCard
                icon={Clock}
                label="Upcoming Events"
                value={stats.upcomingEvents}
                colorClasses="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
              />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <StatsCard
                icon={Mail}
                label="Messages"
                value={stats.messages}
                colorClasses="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Two Column Layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <CategoryBreakdownLoading />
              <RecentEventsLoading />
            </>
          ) : (
            <>
              <CategoryBreakdown categories={categories} />
              <RecentEventsList
                events={recentEvents}
                onNavigateToEvents={handleNavigateToEvents}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Ready to host an event?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create your first event and start inviting people.
                </p>
              </div>
              <Button
                onClick={handleNavigateToEvents}
                variant="outline"
                className="shrink-0"
              >
                Browse Events
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
