"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import PageTransition from "@/components/transitions/PageTransition";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver ? zodResolver(registerSchema) : undefined,
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
        {/* Cinematic glow filters */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10"
        >
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white mb-4 shadow-glow-violet">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-sm text-zinc-400">Join AuraBlog to read, comment, and bookmark posts.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Outbound states */}
            {errorMsg && (
              <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in-up">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Account created successfully! Forwarding to sign in...</span>
              </div>
            )}

            {/* Name Field */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                  {...register("name")}
                  className="w-full glass-input pl-11 pr-4 py-2 text-sm"
                  required
                />
              </div>
              {errors.name && (
                <span className="text-xs text-red-400 mt-1">{errors.name.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  {...register("email")}
                  className="w-full glass-input pl-11 pr-4 py-2 text-sm"
                  required
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className="w-full glass-input pl-11 pr-4 py-2 text-sm"
                  required
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-400 mt-1">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                  className="w-full glass-input pl-11 pr-4 py-2 text-sm"
                  required
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-glow-violet focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          {/* Login redirection link */}
          <div className="text-center mt-6 text-sm text-zinc-500">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
