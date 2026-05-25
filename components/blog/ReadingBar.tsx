"use client";

import { useReadingProgress } from "@/hooks/useReadingProgress";
import { motion } from "framer-motion";

export default function ReadingBar() {
  const progress = useReadingProgress();

  return (
    <div className="fixed top-[73px] left-0 w-full h-[3px] z-50 pointer-events-none">
      <motion.div
        className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-600 shadow-glow-cyan"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "easeOut", duration: 0.1 }}
      />
    </div>
  );
}
