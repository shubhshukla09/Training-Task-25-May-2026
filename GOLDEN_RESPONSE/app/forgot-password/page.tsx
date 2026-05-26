"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import PageTransition from "@/components/transitions/PageTransition";

export default function ForgotPasswordPage() {
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput) return;

    setIsLoading(true);
    // Simulate reset dispatcher delay
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Print diagnostic reset instructions to the terminal console
      console.log(`
============================================================
🔒 PASSWORD RESET DISPATCH DIAGNOSTIC MOCK
============================================================
TARGET USER : ${emailInput}
RESET TOKEN : rst_${Math.random().toString(36).substring(2, 15)}
MOCK LINK   : http://localhost:3000/reset-password?token=mocked-token
STATUS      : TERMINAL LOGGED (OFFLINE DEV MOCK SUCCESS)
============================================================
      `);
    }, 1200);
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
        {/* Glow Filters */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10"
        >
          {/* Back to sign in */}
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Sign In</span>
          </Link>

          {!success ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Reset Password</h1>
                <p className="text-sm text-zinc-400">
                  Enter your email address below and we'll dispatch password recovery instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleReset} className="space-y-5">
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
                      disabled={isLoading}
                      className="w-full glass-input pl-11 pr-4 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-sm shadow-glow-cyan focus:outline-none disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
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
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Instructions Sent!</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Password recovery links have been logged to the **developer console window terminal** (simulated email dispatch). Please check your server output!
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold transition-all focus:outline-none"
              >
                Return to Login
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
