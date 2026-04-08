"use client";

import { useState } from "react";
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
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Loader2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function ContactView() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: data.message,
        });
        (e.target as HTMLFormElement).reset();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Send",
          description: data.error || "Something went wrong",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Have a question or need help? We&apos;d love to hear from you. Send us a
          message and we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-4">
          {[
            {
              icon: <Mail className="h-5 w-5" />,
              title: "Email",
              value: "support@eventhub.com",
              description: "We reply within 24 hours",
            },
            {
              icon: <Phone className="h-5 w-5" />,
              title: "Phone",
              value: "+1 (555) 123-4567",
              description: "Mon-Fri, 9am-6pm EST",
            },
            {
              icon: <MapPin className="h-5 w-5" />,
              title: "Office",
              value: "123 Event Street",
              description: "Suite 100, New York, NY",
            },
            {
              icon: <Clock className="h-5 w-5" />,
              title: "Business Hours",
              value: "Mon - Fri",
              description: "9:00 AM - 6:00 PM EST",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="text-primary mt-0.5">{item.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-sm">{item.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Full Name *</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email *</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject *</Label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message *</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
