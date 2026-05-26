"use client";

import { motion } from "framer-motion";

import { useReadingProgress } from "@/hooks/use-reading-progress";

export function ReadingProgressBar() {
  const progress = useReadingProgress();

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[60] h-1 bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-rose"
      style={{ width: `${progress}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    />
  );
}

