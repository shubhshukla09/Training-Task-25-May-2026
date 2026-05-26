"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">Modern editorial platform</p>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
          Build, publish, and scale a <span className="gradient-title">premium blog experience</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          A fast, minimal, and fully responsive Next.js 15 blog UI with elegant motion, clean typography, and
          production-ready component architecture.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="gradient" size="lg" asChild>
            <Link href="/blog">
              Explore articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/admin">Open dashboard UI</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

