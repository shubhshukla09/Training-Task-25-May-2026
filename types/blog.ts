export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  readingTime: number;
  featured: boolean;
  trending: boolean;
  category: string;
  tags: string[];
  author: Author;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface CategoryStat {
  name: string;
  count: number;
}

