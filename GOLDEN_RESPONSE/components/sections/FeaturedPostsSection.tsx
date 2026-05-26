import BlogCard from "@/components/blog/BlogCard";
import { BlogPost } from "@/types/blog";

interface FeaturedPostsSectionProps {
  posts: BlogPost[];
}

export function FeaturedPostsSection({ posts }: FeaturedPostsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="section-title">Featured articles</h2>
        <p className="section-description">Hand-picked insights from design, engineering, and growth teams.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </section>
  );
}

