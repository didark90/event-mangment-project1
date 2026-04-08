"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  User,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app-store";

// ─── Types ───────────────────────────────────────────────────────────

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

// ─── Constants ───────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Conference",
  "Workshop",
  "Meetup",
  "Webinar",
  "Social",
  "Concert",
] as const;

const EVENT_CATEGORIES = CATEGORIES.filter((c) => c !== "All") as string[];

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  ongoing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
};

const CATEGORY_COLORS: Record<string, string> = {
  conference: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  workshop: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  meetup: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  webinar: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  social: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  concert: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  general: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ─── Helpers ─────────────────────────────────────────────────────────

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateForInput(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// ─── Loading Skeletons ───────────────────────────────────────────────

function EventsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="mb-3 h-4 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Separator className="my-3" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
        {hasSearch ? (
          <Search className="size-8 text-muted-foreground" />
        ) : (
          <CalendarX className="size-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {hasSearch ? "No events found" : "No events yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Be the first to create an event and start building your community."}
      </p>
    </motion.div>
  );
}

// ─── Event Card ──────────────────────────────────────────────────────

function EventCard({
  event,
  onView,
  isOwner,
}: {
  event: EventData;
  onView: (event: EventData) => void;
  isOwner: boolean;
}) {
  const categoryColor =
    CATEGORY_COLORS[event.category?.toLowerCase()] ||
    CATEGORY_COLORS.general;

  const statusColor = STATUS_COLORS[event.status?.toLowerCase()] || STATUS_COLORS.upcoming;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col p-4 sm:p-6">
          {/* Badges */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className={`text-[11px] ${categoryColor} border-0`}
            >
              {event.category || "General"}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[11px] capitalize ${statusColor}`}
            >
              {event.status || "upcoming"}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="mb-1 text-base font-semibold leading-snug text-foreground line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {truncate(event.description, 100)}
          </p>

          {/* Details */}
          <div className="mb-3 space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{event.location}</span>
            </div>
            {event.user?.name && (
              <div className="flex items-center gap-2">
                <User className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{event.user.name}</span>
              </div>
            )}
          </div>

          {/* Owner badge */}
          {isOwner && (
            <Badge variant="outline" className="mb-3 w-fit text-[10px] text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
              Your Event
            </Badge>
          )}

          {/* Action */}
          <div className="mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onView(event)}
            >
              <Eye className="mr-2 size-3.5" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Create Event Dialog ─────────────────────────────────────────────

function CreateEventDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "Conference",
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      location: "",
      category: "Conference",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create event");
      }

      toast({
        title: "Event created!",
        description: "Your event has been created successfully.",
      });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-title">Title</Label>
            <Input
              id="create-title"
              placeholder="Enter event title"
              className="h-12 rounded-lg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <textarea
              id="create-description"
              placeholder="Describe your event"
              className="flex h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-date">Date & Time</Label>
            <Input
              id="create-date"
              type="datetime-local"
              className="h-12 rounded-lg"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-location">Location</Label>
            <Input
              id="create-location"
              placeholder="Enter event location"
              className="h-12 rounded-lg"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger className="h-12 rounded-lg">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); onOpenChange(false); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Event Dialog ───────────────────────────────────────────────

function EditEventDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: {
  event: EventData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    status: "upcoming",
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        date: formatDateForInput(event.date),
        location: event.location || "",
        category: event.category || "Conference",
        status: event.status || "upcoming",
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !event) return;

    if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update event");
      }

      toast({
        title: "Event updated!",
        description: "Your event has been updated successfully.",
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details of your event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Enter event title"
              className="h-12 rounded-lg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <textarea
              id="edit-description"
              placeholder="Describe your event"
              className="flex h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date & Time</Label>
            <Input
              id="edit-date"
              type="datetime-local"
              className="h-12 rounded-lg"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              placeholder="Enter event location"
              className="h-12 rounded-lg"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── View Event Dialog ───────────────────────────────────────────────

function ViewEventDialog({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isOwner,
}: {
  event: EventData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: EventData) => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}) {
  if (!event) return null;

  const statusColor = STATUS_COLORS[event.status?.toLowerCase()] || STATUS_COLORS.upcoming;
  const categoryColor =
    CATEGORY_COLORS[event.category?.toLowerCase()] ||
    CATEGORY_COLORS.general;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={`text-xs ${categoryColor} border-0`}>
              {event.category || "General"}
            </Badge>
            <Badge variant="outline" className={`text-xs capitalize ${statusColor}`}>
              {event.status || "upcoming"}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Event details for {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="mb-1 text-sm font-medium text-foreground">Description</h4>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium text-foreground">
                  {formatEventDate(event.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <MapPin className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">
                  {event.location}
                </p>
              </div>
            </div>
            {event.user?.name && (
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Organizer</p>
                  <p className="text-sm font-medium text-foreground">
                    {event.user.name}
                    {event.user.email && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({event.user.email})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <>
            <Separator />
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(event);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
                    onOpenChange(false);
                    onDelete(event.id);
                  }
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Events View ────────────────────────────────────────────────

export function EventsView() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { setCurrentView } = useAppStore();

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventData | null>(null);
  const [viewEvent, setViewEvent] = useState<EventData | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== "All") {
        params.set("category", activeCategory);
      }
      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeCategory, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter by search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete event");
      }
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      fetchEvents();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const isAuthenticated = !!session?.user;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Events
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover and join events happening in your community.
            </p>
          </div>
          {isAuthenticated ? (
            <Button onClick={() => setCreateOpen(true)} className="shrink-0">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setCurrentView("auth")}
              className="shrink-0"
            >
              Sign in to Create
            </Button>
          )}
        </div>
      </section>

      {/* Search & Filter */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events by title, description, or location..."
              className="h-12 rounded-lg pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium
                    transition-colors focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-ring focus-visible:ring-offset-2
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }
                  `}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <EventsGridSkeleton />
        ) : filteredEvents.length === 0 ? (
          <EmptyState hasSearch={searchQuery.length > 0 || activeCategory !== "All"} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={setViewEvent}
                  isOwner={isAuthenticated && session?.user?.id === event.userId}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Create Dialog */}
      <CreateEventDialog
        open={createOpen}
        onOpenChange={(v) => {
          if (!isAuthenticated) {
            setCurrentView("auth");
            toast({
              title: "Sign in required",
              description: "Please sign in to create events.",
            });
            return;
          }
          setCreateOpen(v);
        }}
        onSuccess={fetchEvents}
      />

      {/* Edit Dialog */}
      <EditEventDialog
        event={editEvent}
        open={!!editEvent}
        onOpenChange={(v) => { if (!v) setEditEvent(null); }}
        onSuccess={fetchEvents}
      />

      {/* View Dialog */}
      <ViewEventDialog
        event={viewEvent}
        open={!!viewEvent}
        onOpenChange={(v) => { if (!v) setViewEvent(null); }}
        onEdit={setEditEvent}
        onDelete={handleDelete}
        isOwner={!!viewEvent && isAuthenticated && session?.user?.id === viewEvent?.userId}
      />
    </div>
  );
}
