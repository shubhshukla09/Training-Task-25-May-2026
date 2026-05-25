"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, ShieldAlert, Sparkles, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PageTransition from "@/components/transitions/PageTransition";
import ScrollReveal from "@/components/transitions/ScrollReveal";

export default function NewsletterPortalPage() {
  const [emailInput, setEmailInput] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const subscribeMutation = useMutation({
    mutationFn: async (subEmail: string) => {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Subscription failed");
      }
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setErrorMsg("");
      setEmailInput("");
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "An error occurred");
      setSuccess(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim() || subscribeMutation.isPending) return;
    subscribeMutation.mutate(emailInput);
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
        {/* Glow Filters */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10"
        >
          {/* Back Home */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>

          {!success ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 mb-4 animate-float">
                  <Mail className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-outfit">
                  Technical Newsletter
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Join our weekly briefings to receive deconstructed code-audits, SaaS system blueprints, and luxury UI playbooks straight from our AI engines.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
                    <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={subscribeMutation.isPending}
                      className="w-full glass-input pl-11 pr-4 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-glow-cyan focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  {subscribeMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Join Weekly Briefing</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <div className="inline-flex p-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-outfit">Successfully Subscribed!</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Welcome to AuraBlog technical weekly briefings. We have logged a confirmation transaction to your email. Check your dev console server logs!
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold transition-all focus:outline-none"
              >
                Return to Home
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
