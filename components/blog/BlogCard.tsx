"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Clock, Calendar, ArrowRight } from "lucide-react";

export interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    featuredImage: string | null;
    publishedAt: string | Date | null;
    views: number;
    readingTime: number;
    author: {
      name: string | null;
      image: string | null;
    };
    category: {
      name: string;
      slug: string;
    };
  };
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.1, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass-panel glass-panel-hover"
    >
      <div>
        {/* Featured Image Frame */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5">
          <img
            src={post.featuredImage || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?w=600"}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-60" />
          
          {/* Category Pill Tag */}
          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full border border-white/10 bg-zinc-950/80 text-cyan-400 backdrop-blur-md">
            {post.category.name}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-6">
          <div className="flex items-center space-x-3 text-xs text-zinc-400 mb-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{publishedDate}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime} min read</span>
            </span>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight mb-2">
            {post.title}
          </h3>

          <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-4">
            {post.summary}
          </p>
        </div>
      </div>

      {/* Footer Details (Author + CTAs) */}
      <div className="px-6 pb-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img
            src={post.author.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
            alt={post.author.name || "Author"}
            className="w-7 h-7 rounded-full object-cover border border-white/10"
          />
          <span className="text-xs font-medium text-zinc-300">{post.author.name}</span>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="flex items-center space-x-1 text-xs font-bold text-cyan-400 group-hover:text-white transition-colors"
        >
          <span>Read Post</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
