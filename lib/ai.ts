import { db } from "./db";

// Stopwords to filter out during local NLP analysis
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at", 
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "cant", "cannot", 
  "co", "con", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", 
  "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", 
  "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isnt", 
  "it", "its", "itself", "me", "more", "most", "must", "my", "myself", "no", "nor", "not", "of", "off", "on", 
  "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", 
  "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", 
  "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", 
  "wasnt", "we", "were", "werent", "what", "when", "where", "which", "while", "who", "whom", "why", "with", 
  "would", "yet", "you", "your", "yours", "yourself", "yourselves"
]);

// 8 Thematic topics matching our 8-dimensional seeded vectors
const TOPICS = [
  // 1. Web Development / Frontend
  ["nextjs", "react", "tailwind", "css", "html", "javascript", "typescript", "frontend", "compiler", "hydration", "rendering"],
  // 2. Artificial Intelligence / Data
  ["ai", "openai", "neural", "embeddings", "vector", "similarity", "data", "model", "python", "machine", "learning", "semantic"],
  // 3. Design / UI / UX
  ["design", "glassmorphism", "typography", "animations", "micro", "interactions", "cinematic", "ux", "ui", "aesthetics", "shadow"],
  // 4. Backend / Database / Caching
  ["backend", "prisma", "sql", "database", "cache", "redis", "postgres", "sqlite", "query", "models", "cascade", "deletions"],
  // 5. Cloud / CDNs / serverless
  ["cloud", "servers", "distributed", "serverless", "cdn", "edge", "deploy", "hosting", "dns", "scaling", "infrastructure"],
  // 6. SaaS / SaaS-grade
  ["saas", "production", "enterprise", "business", "billing", "users", "metrics", "analytics", "subscribers", "dashboard"],
  // 7. Coding / Engineering
  ["code", "functions", "architect", "compiler", "cycles", "benchmarking", "actions", "state", "loading", "error", "hook"],
  // 8. Security / Hardening
  ["security", "auth", "tokens", "hash", "validation", "limits", "cors", "xss", "csrf", "sanitize", "brute", "rate"]
];

/**
 * Clean and tokenize raw text into lowercase word tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

/**
 * Compute cosine similarity between two numeric vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const ai = {
  /**
   * Generates an 8-dimensional float embedding using local TF-IDF or OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            input: text.substring(0, 8000), // Limit token footprint
            model: "text-embedding-3-small",
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const rawEmbedding = json.data[0].embedding as number[];
          // Truncate or map to 8 dimensions for schema consistency
          // Take first 8 components and normalize them
          const subVec = rawEmbedding.slice(0, 8);
          const magnitude = Math.sqrt(subVec.reduce((sum, val) => sum + val * val, 0));
          return magnitude === 0 ? subVec : subVec.map((v) => v / magnitude);
        }
      } catch (err) {
        console.warn("⚠️ OpenAI Embedding failed. Falling back to local NLP vectorizer:", err);
      }
    }

    // LOCAL MATHEMATICAL TF-IDF TOPICAL VECTORIZER FALLBACK
    const tokens = tokenize(text);
    const vector = new Array(8).fill(0.05); // Seed with slight default signal to avoid division by zero

    tokens.forEach((token) => {
      TOPICS.forEach((keywords, topicIndex) => {
        if (keywords.includes(token)) {
          vector[topicIndex] += 1.0;
        }
      });
    });

    // Normalize the vector to unit length (length = 1)
    const normSq = vector.reduce((sum, val) => sum + val * val, 0);
    const norm = Math.sqrt(normSq);

    return norm === 0 ? vector : vector.map((v) => v / norm);
  },

  /**
   * Generates a concise summary of the content
   */
  async generateSummary(content: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a professional blogging assistant. Summarize the provided blog content into a single, high-quality, engaging paragraph under 150 words.",
              },
              { role: "user", content: content.substring(0, 6000) },
            ],
            max_tokens: 180,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          return json.choices[0].message.content.trim();
        }
      } catch (err) {
        console.warn("⚠️ OpenAI Summarizer failed. Falling back to local summarizer:", err);
      }
    }

    // LOCAL SENTENCE-FREQUENCY SUMMARIZER FALLBACK
    // Split text into lines, strip markdown headings/styling, gather sentences
    const plainText = content
      .replace(/[#*`_]/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1"); // Strip markdown links
    
    const sentences = plainText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25); // Exclude very short phrases

    if (sentences.length <= 2) {
      return sentences.join(". ") + ".";
    }

    // Word counts mapping for scoring
    const tokens = tokenize(plainText);
    const frequencies = new Map<string, number>();
    tokens.forEach((tok) => {
      frequencies.set(tok, (frequencies.get(tok) || 0) + 1);
    });

    // Score each sentence by summing word frequencies
    const scoredSentences = sentences.map((sentence) => {
      const sentTokens = tokenize(sentence);
      const score = sentTokens.reduce((sum, tok) => sum + (frequencies.get(tok) || 0), 0);
      return { sentence, score: score / (sentTokens.length + 1) }; // Normalize for length to avoid bias for long sentences
    });

    // Sort by score and take the top 2 sentences in the original reading order
    const topScored = [...scoredSentences]
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const result = sentences
      .filter((s) => topScored.some((t) => t.sentence === s))
      .join(". ") + ".";

    return result.length > 200 ? result.substring(0, 197) + "..." : result;
  },

  /**
   * Generates highly specific content tags
   */
  async generateTags(content: string): Promise<string[]> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Generate a list of 3-4 short, lowercased, comma-separated keywords/tags representing the main topics of this blog content.",
              },
              { role: "user", content: content.substring(0, 4000) },
            ],
            max_tokens: 30,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const text = json.choices[0].message.content as string;
          return text
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
        }
      } catch (err) {
        console.warn("⚠️ OpenAI Smart Tagging failed. Falling back to local tagger:", err);
      }
    }

    // LOCAL KEYWORD EXTRACTOR FALLBACK
    const tokens = tokenize(content);
    const counts = new Map<string, number>();
    tokens.forEach((tok) => {
      counts.set(tok, (counts.get(tok) || 0) + 1);
    });

    // Take top counts that are inside our vocabulary list (to avoid random nouns)
    const allKeywords = TOPICS.flat();
    const matches = Array.from(counts.entries())
      .filter(([word]) => allKeywords.includes(word) && word.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    // Default fallbacks if no vocabulary words are matched
    if (matches.length === 0) {
      return ["general", "insights", "tech"];
    }

    return matches;
  },

  /**
   * Computes semantic similarity over SQLite databases and returns top recommendations
   */
  async getRecommendations(currentPostId: string, limit: number = 3): Promise<any[]> {
    try {
      const currentPost = await db.post.findUnique({
        where: { id: currentPostId },
        select: { embedding: true, categoryId: true },
      });

      if (!currentPost || !currentPost.embedding) {
        // Fallback to random post recommendations from the same category if no embedding
        return await db.post.findMany({
          where: {
            id: { not: currentPostId },
            published: true,
          },
          take: limit,
          include: { author: true, category: true },
        });
      }

      const currentVec = JSON.parse(currentPost.embedding) as number[];

      const otherPosts = await db.post.findMany({
        where: {
          id: { not: currentPostId },
          published: true,
        },
        include: { author: true, category: true },
      });

      const ranked = otherPosts
        .map((post) => {
          let score = 0;
          if (post.embedding) {
            try {
              const vecB = JSON.parse(post.embedding) as number[];
              score = cosineSimilarity(currentVec, vecB);
            } catch (err) {
              score = 0;
            }
          }
          // Slight score boost (0.1) if in the exact same category
          if (post.categoryId === currentPost.categoryId) {
            score += 0.1;
          }
          return { post, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((r) => r.post);

      return ranked;
    } catch (err) {
      console.error("❌ Recommendation service crashed, returning empty array:", err);
      return [];
    }
  }
};
