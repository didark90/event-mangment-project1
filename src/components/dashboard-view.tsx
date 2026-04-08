"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  PlusCircle,
  MapPin,
  Clock,
  TrendingUp,
  CalendarCheck,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  createdAt: string;
}

export function DashboardView() {
  const { data: session } = useSession();
  const { setCurrentView } = useAppStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserEvents = useCallback(async () => {
    if (!session?.user) return;
    try {
      const userId = session.user.id;
      const response = await fetch(`/api/events?userId=${userId}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  const upcomingEvents = events.filter(
    (e) => new Date(e.date) >= new Date()
  );
  const pastEvents = events.filter((e) => new Date(e.date) < new Date());

  const categoryCounts = events.reduce(
    (acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: <CalendarDays className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Upcoming",
      value: upcomingEvents.length,
      icon: <CalendarClock className="h-5 w-5" />,
      color: "text-orange-500",
    },
    {
      label: "Completed",
      value: pastEvents.length,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: "text-green-500",
    },
    {
      label: "Categories",
      value: Object.keys(categoryCounts).length,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-500",
    },
  ];

  const getStatusBadge = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    if (eventDate < now) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Completed
        </Badge>
      );
    }
    const diffDays = Math.ceil(
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 7) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          This Week
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Upcoming
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your events
          </p>
        </div>
        <Button onClick={() => setCurrentView("events")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Manage Events
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`${stat.color}`}>{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <CardDescription>Your next scheduled events</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("events")}
            >
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No upcoming events</p>
                <p className="text-sm mt-1">Create your first event!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2 text-center min-w-[48px]">
                      <p className="text-xs text-primary font-medium">
                        {format(new Date(event.date), "MMM")}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {format(new Date(event.date), "dd")}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(event.date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity / Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events by Category</CardTitle>
            <CardDescription>Breakdown of your events by type</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : Object.keys(categoryCounts).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No data yet</p>
                <p className="text-sm mt-1">Create events to see analytics</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = Math.round(
                      (count / events.length) * 100
                    );
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize">
                            {category}
                          </span>
                          <span className="text-muted-foreground">
                            {count} event{count > 1 ? "s" : ""} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Past Events</CardTitle>
            <CardDescription>
              Events that have already taken place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {pastEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex-shrink-0 bg-muted rounded-lg p-2 text-center min-w-[48px]">
                    <p className="text-xs text-muted-foreground font-medium">
                      {format(new Date(event.date), "MMM")}
                    </p>
                    <p className="text-lg font-bold text-muted-foreground">
                      {format(new Date(event.date), "dd")}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
