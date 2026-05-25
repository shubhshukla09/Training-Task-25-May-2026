"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, User, MessageSquare, Send, ShieldCheck, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";
import PageTransition from "@/components/transitions/PageTransition";
import ScrollReveal from "@/components/transitions/ScrollReveal";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver ? zodResolver(contactSchema) : undefined,
    defaultValues: { name: "", email: "", message: "" },
  });

  const contactMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to dispatch message");
      }
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setErrorMsg("");
      reset();
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "An unexpected error occurred");
      setSuccess(false);
    },
  });

  function onSubmit(values: ContactFormValues) {
    contactMutation.mutate(values);
  }

  return (
    <PageTransition>
      <div className="w-full min-h-screen px-6 pb-24">
        {/* Glow Backdrops */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto pt-10">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 mb-4 animate-float">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-outfit">
                Get in Touch
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Connect with our editorial team for code-audits, press releases, or SaaS licensing inquiries.
              </p>
            </div>
          </ScrollReveal>

          {/* Double Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            {/* Info details */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <ScrollReveal delay={0.15}>
                <div className="p-6 rounded-2xl border border-white/5 bg-zinc-950/20 flex flex-col space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Direct Inquiries</span>
                  </span>
                  
                  <div className="flex flex-col space-y-3 text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    <p>
                      <strong>Licensing:</strong> our platform is open to custom white-label deployments for tech enterprises.
                    </p>
                    <p>
                      <strong>Submissions:</strong> we welcome guest editorials covering React 19 compilers and database caching optimizations.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={0.2}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl space-y-5"
                >
                  {/* Status displays */}
                  {errorMsg && (
                    <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
                      <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in-up">
                      <ShieldCheck className="w-4.5 h-4.5 shrink-0 animate-pulse" />
                      <span>Message sent! Checked dev console server logs.</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        disabled={contactMutation.isPending}
                        {...register("name")}
                        className="w-full glass-input pl-11 pr-4 py-2.5 text-sm"
                        required
                      />
                    </div>
                    {errors.name && (
                      <span className="text-xs text-red-400 mt-1">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        disabled={contactMutation.isPending}
                        {...register("email")}
                        className="w-full glass-input pl-11 pr-4 py-2.5 text-sm"
                        required
                      />
                    </div>
                    {errors.email && (
                      <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Message Body
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-5 w-4.5 h-4.5 text-zinc-500" />
                      <textarea
                        placeholder="Detail your inquiry here..."
                        disabled={contactMutation.isPending}
                        {...register("message")}
                        className="w-full glass-input pl-11 pr-4 py-3 text-sm min-h-[120px] h-[120px] resize-none"
                        required
                      />
                    </div>
                    {errors.message && (
                      <span className="text-xs text-red-400 mt-1">{errors.message.message}</span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-glow-cyan focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    {contactMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
