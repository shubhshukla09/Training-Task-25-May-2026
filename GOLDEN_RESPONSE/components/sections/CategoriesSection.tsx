import { FolderKanban } from "lucide-react";

import { CategoryStat } from "@/types/blog";

interface CategoriesSectionProps {
  categories: CategoryStat[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="section-title">Browse categories</h2>
        <p className="section-description">Quickly jump into focused topics across the publication.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article key={category.name} className="glass-card rounded-2xl p-5 transition hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{category.name}</p>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {category.count} article{category.count > 1 ? "s" : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

