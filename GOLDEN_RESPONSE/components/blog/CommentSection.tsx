"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: number;
  name: string;
  message: string;
}

const initialComments: Comment[] = [
  { id: 1, name: "Alex", message: "Great breakdown — especially the section on scalable architecture." },
  { id: 2, name: "Priya", message: "Loved the examples. Looking forward to more posts on performance patterns." },
];

export function CommentSection() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
    };

    setComments((prev) => [newComment, ...prev]);
    setName("");
    setMessage("");
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Comments</h2>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-4">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          aria-label="Your name"
        />
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a comment..."
          aria-label="Write a comment"
        />
        <Button type="submit">Post comment</Button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-2xl border border-border/70 bg-card/70 p-4">
            <h3 className="text-sm font-semibold">{comment.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{comment.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

