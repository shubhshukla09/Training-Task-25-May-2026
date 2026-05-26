"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { BlogPost } from "@/types/blog";

interface TrendingCarouselProps {
  posts: BlogPost[];
}

export function TrendingCarousel({ posts }: TrendingCarouselProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const amount = direction === "left" ? -320 : 320;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Trending now</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Scroll left" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Scroll right" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={sliderRef} className="flex snap-x gap-4 overflow-x-auto pb-2">
        {posts.map((post) => (
          <motion.article
            key={post.id}
            whileHover={{ y: -4 }}
            className="glass-card min-w-[280px] snap-start overflow-hidden rounded-2xl md:min-w-[360px]"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="relative aspect-[16/9]">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{post.category}</p>
                <h3 className="line-clamp-2 text-lg font-semibold">{post.title}</h3>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

