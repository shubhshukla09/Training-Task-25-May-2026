"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import PageTransition from "@/components/transitions/PageTransition";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver ? zodResolver(loginSchema) : undefined, // Fallback if resolvers lag
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMsg(res.error || "Invalid credentials. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      setErrorMsg("An unexpected system error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
        {/* Cinematic glow filters */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10"
        >
          {/* Logo Title */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white mb-4 shadow-glow-cyan">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-zinc-400">Sign in to publish posts and moderate comments.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Outbound message states */}
            {errorMsg && (
              <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in-up">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Access Granted! Loading platform...</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col space-y-1.5">
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
                  className="w-full glass-input pl-11 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className="w-full glass-input pl-11 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-400 mt-1">{errors.password.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-sm shadow-glow-cyan focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Direct registration trigger */}
          <div className="text-center mt-6 text-sm text-zinc-500">
            <span>New to the platform? </span>
            <Link
              href="/register"
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
