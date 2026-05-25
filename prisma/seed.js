const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing database
  await prisma.activity.deleteMany({});
  await prisma.analytics.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned existing database tables.");

  // 2. Create Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const editorPassword = await bcrypt.hash("editor123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Marcus Aurelius",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
      title: "Chief Architect & Editor",
      bio: "Stoic philosopher, software architect, and AI researcher. Interested in building cinematic experiences and scalable backends.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  });

  const editor = await prisma.user.create({
    data: {
      name: "Sophia Carter",
      email: "editor@example.com",
      password: editorPassword,
      role: "EDITOR",
      title: "Senior Content Strategist",
      bio: "Design-first technical writer focusing on modern frontend design languages and developer workflows.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Ethan Hunt",
      email: "user@example.com",
      password: userPassword,
      role: "USER",
      title: "Full Stack Engineer",
      bio: "Passionate developer exploring deep tech, vector similarity searches, and next-generation UI micro-interactions.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("👥 Seeded users (Admin, Editor, regular User).");

  // 3. Create Categories
  const catAI = await prisma.category.create({
    data: { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Deep dives into LLMs, neural networks, embeddings, and mathematical NLP vectors." }
  });

  const catWeb = await prisma.category.create({
    data: { name: "Web Development", slug: "web-development", description: "Premium guides on modern web standards, App Routers, state management, and edge runtimes." }
  });

  const catDesign = await prisma.category.create({
    data: { name: "Design Systems", slug: "design-systems", description: "Mastering luxury UI aesthetics, glassmorphism, micro-animations, and GPU optimization." }
  });

  const catCloud = await prisma.category.create({
    data: { name: "Cloud Computing", slug: "cloud-computing", description: "Architecture blueprints covering multi-level caches, serverless databases, and global CDNs." }
  });

  console.log("🏷 Seeded content categories.");

  // 4. Create Tags
  const tagNext = await prisma.tag.create({ data: { name: "Next.js", slug: "nextjs" } });
  const tagReact = await prisma.tag.create({ data: { name: "React", slug: "react" } });
  const tagTailwind = await prisma.tag.create({ data: { name: "Tailwind CSS", slug: "tailwindcss" } });
  const tagOpenAI = await prisma.tag.create({ data: { name: "OpenAI", slug: "openai" } });
  const tagML = await prisma.tag.create({ data: { name: "Machine Learning", slug: "machine-learning" } });
  const tagUX = await prisma.tag.create({ data: { name: "UX Design", slug: "ux-design" } });
  const tagSaaS = await prisma.tag.create({ data: { name: "SaaS", slug: "saas" } });

  console.log("🏷 Seeded tags.");

  // 5. Create Blog Posts (with mock embeddings)
  const mockEmbedding1 = JSON.stringify([0.15, -0.23, 0.45, 0.12, -0.09, 0.82, -0.15, 0.04]);
  const mockEmbedding2 = JSON.stringify([0.12, -0.25, 0.42, 0.08, -0.12, 0.88, -0.18, 0.01]);
  const mockEmbedding3 = JSON.stringify([-0.35, 0.15, -0.12, 0.76, 0.45, -0.22, 0.65, 0.32]);
  const mockEmbedding4 = JSON.stringify([0.55, 0.45, -0.32, -0.12, 0.22, 0.15, -0.05, -0.45]);

  const post1 = await prisma.post.create({
    data: {
      title: "The Future of Web Development with Next.js 15 & React 19",
      slug: "future-of-web-development-nextjs15-react19",
      summary: "Explore the new compiler paradigms, server action enhancements, and async transition architectures redefining the modern web.",
      content: `# The Future of Web Development with Next.js 15 & React 19

Next.js 15 and React 19 represent a monumental shift in how we think about full-stack web architectures. Instead of relying on manual state-sync mechanisms, we are moving towards an era of deep runtime integration.

## React Server Components (RSC) and React Compiler
Manual optimization tools like \`useMemo\` and \`useCallback\` are officially becoming fossils. The new **React Compiler (React Forget)** automatically detects rendering trees and memoizes component outputs:

\`\`\`tsx
// Before React 19 - Manual Optimization
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});
\`\`\`

With the React Compiler, you write pure JavaScript components, and the compiler injects optimization flags during compilation, leading to significant CPU cycle savings.

---

## Next.js 15 App Router & Async Security
Next.js 15 hardens server route caches. Fetch requests are **no longer cached by default** (\`force-cache\` must be explicitly requested), leading to real-time sync by default. Server Actions also gain robust validation layers, making security auditing incredibly clean.

> "The web is shifting back to dynamic-by-default, backed by powerful edge compute layers."

### What does this mean for developers?
1. **Less boilerplate**: Native React 19 \`use\` handles async data fetching elegantly.
2. **Predictable state**: Form Actions automatically manage loading and error boundaries using \`useActionState\`.
3. **Cinematic transitions**: Seamless page transitions leveraging React 19's native Transition APIs.
`,
      featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop",
      published: true,
      publishedAt: new Date(),
      views: 1240,
      readingTime: 4,
      embedding: mockEmbedding1,
      authorId: admin.id,
      categoryId: catWeb.id,
      tags: { connect: [{ id: tagNext.id }, { id: tagReact.id }, { id: tagTailwind.id }] }
    }
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Semantic Search & Vector Embeddings: Building Recommendations",
      slug: "semantic-search-vector-embeddings-recommendations",
      summary: "Understand how high-dimensional vectors and cosine similarity map context rather than strings to drive state-of-the-art recommenders.",
      content: `# Semantic Search & Vector Embeddings

In the early days of search engines, matching words exactly was the gold standard. However, literal keyword matching fails when words have synonyms or context shapes meaning. Enter **vector embeddings**.

## What is a Vector Embedding?
A vector embedding maps textual content (sentences, paragraphs, or entire articles) into a high-dimensional vector space:

$$\\vec{v} \\in \\mathbb{R}^{d}$$

In this vector space, the geometric distance between two vectors corresponds perfectly to their semantic similarity.

\`\`\`python
# Conceptualizing Vector Distance
import numpy as np

v_king = np.array([0.25, 0.45, -0.15, 0.88])
v_queen = np.array([0.23, 0.42, -0.12, 0.85])
v_computer = np.array([-0.85, 0.12, 0.74, -0.32])

# Cosine similarity shows king and queen are close, computer is far
print(cosine_similarity(v_king, v_queen)) # 0.99
print(cosine_similarity(v_king, v_computer)) # -0.12
\`\`\`

---

## Local Math Recommender Fallback
Our platform implements a **TF-IDF + Cosine Similarity Vectorizer** locally. If the OpenAI API is offline, we parse each post, extract high-value vocabulary weights, compute similarity vectors, and match documents. This ensures recommendations are completely operational offline!
`,
      featuredImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop",
      published: true,
      publishedAt: new Date(),
      views: 820,
      readingTime: 5,
      embedding: mockEmbedding2,
      authorId: admin.id,
      categoryId: catAI.id,
      tags: { connect: [{ id: tagOpenAI.id }, { id: tagML.id }] }
    }
  });

  const post3 = await prisma.post.create({
    data: {
      title: "Crafting Cinematic Luxury UI/UX: The Glassmorphism Playbook",
      slug: "crafting-cinematic-luxury-uiux-glassmorphism-playbook",
      summary: "Step-by-step masterclass on background blur, translucent borders, depth staging, and GPU-optimized micro-interactions.",
      content: `# Crafting Cinematic Luxury UI/UX: The Glassmorphism Playbook

The web should be more than a grid of flat boxes. Premium modern applications use **depth, lighting, and glassmorphism** to construct immersive, digital environments that respond gracefully to interaction.

## Core Pillars of Glassmorphism
1. **Translucency (Alpha Channel)**: Use semi-transparent background fills: \`rgba(24, 24, 27, 0.6)\`.
2. **Backdrop Blur**: Use heavy backdrop filters to blur background contents: \`backdrop-filter: blur(16px)\`.
3. **Subtle Outlines**: Semi-transparent, razor-thin white borders simulate reflections: \`border: 1px solid rgba(255, 255, 255, 0.08)\`.
4. **Drop Shadows**: Deep, ambient dark drop shadows provide elevations.

\`\`\`css
/* Glassmorphism utility class */
.luxury-glass-card {
  background: rgba(24, 24, 27, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45);
}
\`\`\`

## GPU Optimization and Animations
To maintain a butter-smooth 60fps experience on mobile devices, **never animate properties that trigger layout shifts** (like \`width\`, \`height\`, \`margin\`, or \`top\`). Instead, lock transitions onto GPU-accelerated attributes:
* \`opacity\`
* \`transform: scale()\`
* \`transform: translate3d()\`
`,
      featuredImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&fit=crop",
      published: true,
      publishedAt: new Date(),
      views: 950,
      readingTime: 3,
      embedding: mockEmbedding3,
      authorId: editor.id,
      categoryId: catDesign.id,
      tags: { connect: [{ id: tagUX.id }, { id: tagTailwind.id }, { id: tagReact.id }] }
    }
  });

  const post4 = await prisma.post.create({
    data: {
      title: "Designing a Resilient Distributed Cache using Redis & Fallbacks",
      slug: "designing-resilient-distributed-cache-redis-fallbacks",
      summary: "Architecting zero-downtime microservice caching layers that dynamically handle server fallbacks.",
      content: `# Designing a Resilient Distributed Cache

Caching is critical for production scalability, but caching layers are notorious single points of failure. In this architectural breakdown, we design a multi-layered fallback cache.

## Caching Strategy
1. **Level 1 (In-Memory)**: Superfast, local process cache Map for instant retrievals.
2. **Level 2 (Upstash Redis)**: Shared distributed cache for horizontal scaling.
3. **Self-Healing Fallback**: If Redis crashes, transparently fall back to Level 1 in-process caching and log error reports.
`,
      featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop",
      published: false,
      views: 0,
      readingTime: 3,
      embedding: mockEmbedding4,
      authorId: editor.id,
      categoryId: catCloud.id,
      tags: { connect: [{ id: tagSaaS.id }] }
    }
  });

  console.log("📝 Seeded blog posts (3 published, 1 draft).");

  // 6. Create Comments (including nested replies)
  const comment1 = await prisma.comment.create({
    data: {
      content: "This is a brilliant review of React 19! The explanation of the React Compiler is extremely clear. Can't wait to test it on production.",
      postId: post1.id,
      authorId: user.id,
    }
  });

  await prisma.comment.create({
    data: {
      content: "Thank you Ethan! I highly recommend testing the compiler on small components first to benchmark the render cycles. Let me know how it goes!",
      postId: post1.id,
      authorId: admin.id,
      parentId: comment1.id,
    }
  });

  await prisma.comment.create({
    data: {
      content: "Excellent writeup! Cosine similarity on local TF-IDF matrices is a clever engineering choice to keep everything completely functional offline.",
      postId: post2.id,
      authorId: user.id,
    }
  });

  console.log("💬 Seeded comments with nested thread relationships.");

  // 7. Create Likes and Bookmarks
  await prisma.like.create({ data: { userId: user.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: user.id, postId: post2.id } });
  await prisma.bookmark.create({ data: { userId: user.id, postId: post1.id } });
  await prisma.bookmark.create({ data: { userId: user.id, postId: post3.id } });

  console.log("❤️ Seeded user likes and bookmarks.");

  // 8. Create Newsletter Subscribers
  await prisma.newsletterSubscriber.create({ data: { email: "newsletter@example.com", active: true } });
  await prisma.newsletterSubscriber.create({ data: { email: "subscriber2@example.com", active: true } });

  console.log("✉️ Seeded newsletter subscribers.");

  // 9. Create Analytics and Activities
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    await prisma.analytics.create({
      data: {
        date: new Date(date.toISOString().split("T")[0]),
        pageViews: Math.floor(Math.random() * 500) + 200,
        uniqueVisitors: Math.floor(Math.random() * 200) + 80,
      }
    });
  }

  await prisma.activity.create({ data: { description: "Blog post 'Next.js 15 & React 19' was published.", type: "BLOG_CREATED" } });
  await prisma.activity.create({ data: { description: "Marcus Aurelius moderated a comment from Ethan Hunt.", type: "COMMENT_MODERATED" } });
  await prisma.activity.create({ data: { description: "New newsletter subscriber registered.", type: "NEWSLETTER_SUBSCRIBE" } });

  console.log("📊 Seeded dashboard analytics and activities.");
  console.log("✨ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
