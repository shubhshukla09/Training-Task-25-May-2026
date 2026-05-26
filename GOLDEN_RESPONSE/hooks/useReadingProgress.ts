import { useState, useEffect } from "react";

export function useReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalScrollHeight > 0) {
        const progress = (currentScrollY / totalScrollHeight) * 100;
        setCompletion(Math.min(100, Math.max(0, Math.round(progress))));
      } else {
        setCompletion(0);
      }
    }

    // Attach event listener with passive binding for smooth scrolling performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Run once on load to initialize progress (for cached/reloaded pages)
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return completion;
}
