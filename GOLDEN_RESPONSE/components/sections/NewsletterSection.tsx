"use client";

import { MailCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 2000);
  };

  return (
    <section className="animated-border rounded-2xl bg-card/70 p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="section-title">Join the weekly newsletter</h2>
        <p className="section-description">
          One curated email each week with practical frontend, design, and publishing insights.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@company.com"
            aria-label="Email address"
          />
          <Button type="submit" variant="gradient">
            Subscribe
          </Button>
        </form>

        {subscribed && (
          <p className="inline-flex items-center gap-2 text-sm text-emerald-500">
            <MailCheck className="h-4 w-4" />
            You’re subscribed.
          </p>
        )}
      </div>
    </section>
  );
}

