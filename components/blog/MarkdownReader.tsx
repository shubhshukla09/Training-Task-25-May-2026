"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

interface MarkdownReaderProps {
  content: string;
}

export default function MarkdownReader({ content }: MarkdownReaderProps) {
  return (
    <article className="prose prose-invert lg:prose-lg max-w-none">
      <ReactMarkdown 
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
