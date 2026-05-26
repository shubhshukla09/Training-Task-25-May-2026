"use client";

import { useEffect, useState } from "react";

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const contentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (contentHeight <= 0) {
        setProgress(0);
        return;
      }

      const completion = Math.min(100, Math.max(0, (currentScroll / contentHeight) * 100));
      setProgress(completion);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return Math.round(progress);
}
