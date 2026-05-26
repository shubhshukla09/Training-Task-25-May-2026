"use client";

import { useEffect, useMemo, useState } from "react";

import { TocItem } from "@/types/blog";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const handler = () => {
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 120) current = id;
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handler, { passive: true });
    handler();

    return () => window.removeEventListener("scroll", handler);
  }, [ids]);

  if (!items.length) return null;

  return (
    <aside className="rounded-2xl border border-border/70 bg-card/70 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Table of Contents</h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className={`transition hover:text-foreground ${
                activeId === item.id ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

