"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BookOpen, Send, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
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
      setEmail("");
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "An error occurred");
      setSuccess(false);
    },
  });

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email);
  }

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "All Articles", href: "/blogs" },
        { name: "Live Search", href: "/search" },
        { name: "Featured Categories", href: "/categories" },
        { name: "Trending Content", href: "/trending" },
      ],
    },
    {
      title: "Categories",
      links: [
        { name: "Artificial Intelligence", href: "/blogs?category=artificial-intelligence" },
        { name: "Web Development", href: "/blogs?category=web-development" },
        { name: "Design Systems", href: "/blogs?category=design-systems" },
        { name: "Cloud Computing", href: "/blogs?category=cloud-computing" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact Press", href: "/contact" },
        { name: "Privacy Guidelines", href: "/privacy" },
        { name: "SaaS Licensing", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-[#09090b]/40 backdrop-blur-xl">
      {/* Background soft glow bubble */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-white/5">
          {/* Logo & Newsletter Column */}
          <div className="col-span-1 lg:col-span-5 flex flex-col space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                AuraBlog
              </span>
            </Link>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              An enterprise-grade, cinematic technical publication engine driven by high-dimensional semantic recommendation vectors and luxury glassmorphism.
            </p>

            {/* In-Footer Newsletter Signup */}
            <div className="flex flex-col space-y-3 max-w-sm">
              <span className="text-xs font-semibold text-zinc-300 tracking-wider uppercase flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Join our weekly briefing</span>
              </span>

              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribeMutation.isPending}
                  className="w-full glass-input px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white transition-all shadow-md focus:outline-none disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Status Notifications */}
              {success && (
                <div className="flex items-center space-x-2 text-emerald-400 text-xs mt-1 animate-fade-in-up">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Success! Welcome to AuraBlog briefings!</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center space-x-2 text-red-400 text-xs mt-1 animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{errorMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="col-span-1 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex flex-col space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {section.title}
                </span>
                <ul className="flex flex-col space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AuraBlog Platform Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-zinc-300 transition-colors">Twitter</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">GitHub</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
