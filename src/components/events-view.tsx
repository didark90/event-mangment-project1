"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  PlusCircle,
  MapPin,
  Clock,
  Search,
  Pencil,
  Trash2,
  Filter,
  Loader2,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
}

const categories = [
  "conference",
  "workshop",
  "meetup",
  "seminar",
  "social",
  "sports",
  "music",
  "tech",
  "general",
];

const emptyFormData: EventFormData = {
  title: "",
  description: "",
  date: "",
  location: "",
  category: "general",
};

export function EventsView() {
  const { data: session } = useSession();
  const { setCurrentView } = useAppStore();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }
      if (session?.user) {
        params.set("userId", (session.user as { id: string }).id);
      }
      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, session, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setCurrentView("auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Event Created!",
          description: `"${formData.title}" has been created successfully.`,
        });
        setShowCreateDialog(false);
        setFormData(emptyFormData);
        fetchEvents();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Create",
          description: data.error || "Something went wrong",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Event Updated!",
          description: `"${formData.title}" has been updated successfully.`,
        });
        setShowEditDialog(false);
        setSelectedEvent(null);
        setFormData(emptyFormData);
        fetchEvents();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Update",
          description: data.error || "Something went wrong",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Event Deleted",
          description: `"${selectedEvent.title}" has been deleted.`,
        });
        setShowDeleteDialog(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Delete",
          description: data.error || "Something went wrong",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? event.date.split("T")[0] : "",
      location: event.location,
      category: event.category,
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (event: Event) => {
    setSelectedEvent(event);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const isOwner = (event: Event) => {
    if (!session?.user) return false;
    return event.user.id === (session.user as { id: string }).id;
  };

  const EventForm = ({
    onSubmit,
    submitLabel,
    isLoading,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    isLoading: boolean;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-title">Event Title *</Label>
        <Input
          id="event-title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="Enter event title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-desc">Description *</Label>
        <Textarea
          id="event-desc"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe your event..."
          rows={3}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-date">Date & Time *</Label>
          <Input
            id="event-date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) =>
              setFormData({ ...formData, category: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-location">Location *</Label>
        <Input
          id="event-location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Event venue or address"
          required
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setFormData(emptyFormData);
            setSelectedEvent(null);
          }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  const getStatusBadge = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    if (eventDate < now) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Past
        </Badge>
      );
    }
    const diffDays = Math.ceil(
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 7) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          Soon
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-sky-100 text-sky-700">
        Upcoming
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            {session?.user
              ? "Manage your events or discover new ones"
              : "Browse upcoming events in your area"}
          </p>
        </div>
        {session?.user && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : session?.user
              ? "Create your first event to get started!"
              : "Sign in to create and manage events"}
          </p>
          {session?.user ? (
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          ) : (
            <Button onClick={() => setCurrentView("auth")}>
              Sign In to Create Events
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(event.date)}
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {event.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-base truncate">
                          {event.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {format(new Date(event.date), "MMM dd, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openViewDialog(event)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                      {isOwner(event) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(event)}
                            className="flex-shrink-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(event)}
                            className="flex-shrink-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new event
            </DialogDescription>
          </DialogHeader>
          <EventForm
            onSubmit={handleCreateEvent}
            submitLabel="Create Event"
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details of your event
            </DialogDescription>
          </DialogHeader>
          <EventForm
            onSubmit={handleEditEvent}
            submitLabel="Save Changes"
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  Created by {selectedEvent.user.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedEvent.date)}
                  <Badge variant="outline" className="capitalize">
                    {selectedEvent.category}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(selectedEvent.date),
                        "EEEE, MMMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedEvent?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSelectedEvent(null)}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
