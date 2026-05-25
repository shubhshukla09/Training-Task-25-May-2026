"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, CornerDownRight, Send, User, ChevronDown, Lock } from "lucide-react";

interface CommentAuthor {
  name: string | null;
  image: string | null;
  role: string;
}

interface CommentReply {
  id: string;
  content: string;
  createdAt: string | Date;
  author: CommentAuthor;
}

interface ParentComment {
  id: string;
  content: string;
  createdAt: string | Date;
  author: CommentAuthor;
  replies: CommentReply[];
}

interface CommentsSectionProps {
  postId: string;
  initialComments: ParentComment[];
}

export default function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<ParentComment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const user = session?.user as any;

  // Mutation to post a new comment or reply
  const commentMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: payload.content,
          postId,
          parentId: payload.parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post comment");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.parentId) {
        // Append reply to the appropriate parent comment local state
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === data.parentId) {
              return {
                ...c,
                replies: [...c.replies, data],
              };
            }
            return c;
          })
        );
        setReplyText("");
        setActiveReplyId(null);
      } else {
        // Append new top-level comment to the top of the feed
        setComments((prev) => [data, ...prev]);
        setNewComment("");
      }
    },
  });

  function handleSubmitTopLevel(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || commentMutation.isPending) return;
    commentMutation.mutate({ content: newComment });
  }

  function handleSubmitReply(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    if (!replyText.trim() || commentMutation.isPending) return;
    commentMutation.mutate({ content: replyText, parentId });
  }

  return (
    <div className="w-full flex flex-col space-y-8 mt-12 border-t border-white/5 pt-10">
      <div className="flex items-center space-x-2.5">
        <MessageSquare className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">
          Discussion ({comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)})
        </h3>
      </div>

      {/* 1. Comment Posting Form */}
      {session ? (
        <form onSubmit={handleSubmitTopLevel} className="flex flex-col space-y-3">
          <div className="flex items-start space-x-4">
            <img
              src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
              alt={user.name || "User"}
              className="w-8.5 h-8.5 rounded-full object-cover border border-white/10 shrink-0"
            />
            <div className="flex-grow">
              <textarea
                placeholder="Share your thoughts on this technical blueprint..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentMutation.isPending}
                className="w-full glass-input px-4 py-3 text-sm min-h-[90px] h-[90px] resize-none focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={commentMutation.isPending || !newComment.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold shadow-glow-cyan flex items-center space-x-1.5 focus:outline-none disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-950/20 text-center flex flex-col items-center">
          <Lock className="w-6 h-6 text-zinc-500 mb-3" />
          <p className="text-zinc-400 text-sm mb-4">
            You must be authenticated to join this technical discussion.
          </p>
          <a
            href="/login"
            className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold"
          >
            Sign In with Credentials
          </a>
        </div>
      )}

      {/* 2. Comments List Feed */}
      <div className="flex flex-col space-y-6 mt-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex flex-col space-y-4 border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
              {/* Parent Comment Card */}
              <div className="flex items-start space-x-4">
                <img
                  src={comment.author.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                  alt={comment.author.name || ""}
                  className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <span className="text-sm font-bold text-white">{comment.author.name}</span>
                    {comment.author.role === "ADMIN" && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                        Editor
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-500">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Reply Action button */}
                  {session && (
                    <button
                      onClick={() => {
                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                        setReplyText("");
                      }}
                      className="text-xs font-semibold text-zinc-500 hover:text-cyan-400 transition-colors mt-2"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>

              {/* Reply posting form */}
              {activeReplyId === comment.id && (
                <form
                  onSubmit={(e) => handleSubmitReply(e, comment.id)}
                  className="flex items-start space-x-4 pl-12 animate-fade-in-up"
                >
                  <img
                    src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                    alt={user.name || ""}
                    className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                  />
                  <div className="flex-grow flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder={`Reply to ${comment.author.name?.split(" ")[0]}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full glass-input px-3.5 py-1.5 text-xs focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={commentMutation.isPending || !replyText.trim()}
                      className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Nested replies lists */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="flex flex-col space-y-4 pl-12 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3.5">
                      <CornerDownRight className="w-4 h-4 text-zinc-600 shrink-0 mt-1" />
                      <img
                        src={reply.author.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                        alt={reply.author.name || ""}
                        className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-bold text-white">{reply.author.name}</span>
                          {reply.author.role === "ADMIN" && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-bold text-cyan-400 uppercase tracking-wider">
                              Editor
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500">
                            {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-normal">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-10 border border-white/5 bg-zinc-950/10 rounded-2xl text-center text-zinc-500 text-sm italic">
            No discussion threads started yet. Be the first to post!
          </div>
        )}
      </div>
    </div>
  );
}
