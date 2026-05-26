"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BlogPost } from "@/types/blog";

export interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.1, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-glass-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <Badge variant="gradient" className="absolute left-4 top-4">
            {post.category}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {publishedDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-lg font-semibold tracking-tight md:text-xl">{post.title}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>

          <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
            <div className="flex items-center gap-2">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <div className="text-xs">
                <p className="font-medium">{post.author.name}</p>
                <p className="text-muted-foreground">{post.author.role}</p>
              </div>
            </div>

            <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium">
              Read
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}