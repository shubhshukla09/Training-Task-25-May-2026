"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Search, BookOpen } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track window scroll to add extra background opacity
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/blogs" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const user = session?.user as any;
  const isAdminOrEditor = user?.role === "ADMIN" || user?.role === "EDITOR";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/80 border-b border-white/10 backdrop-blur-md py-4"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Glowing Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-between px-1.5 py-2 text-white shadow-glow-cyan">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-[#e4e4e7] to-cyan-400 bg-clip-text text-transparent group-hover:text-cyan-300 transition-colors">
            AuraBlog
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-white ${
                  isActive ? "text-white" : "text-zinc-400"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Shell Actions (Search + Auth Dropdowns) */}
        <div className="hidden md:flex items-center space-x-5">
          {/* Search Trigger Icon */}
          <Link href="/search" className="text-zinc-400 hover:text-white transition-colors" title="Search Database">
            <Search className="w-5 h-5" />
          </Link>

          {session ? (
            /* User Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all focus:outline-none"
              >
                <img
                  src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                  alt={user.name || "User"}
                  className="w-6 h-6 rounded-full object-cover border border-white/10"
                />
                <span className="text-sm font-medium text-zinc-200">{user.name?.split(" ")[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 rounded-xl border border-white/10 bg-zinc-950/95 p-2 shadow-glass-lg backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>

                    {isAdminOrEditor && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                        <span>Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/bookmarks"
                      className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <User className="w-4 h-4 text-violet-400" />
                      <span>Reading Bookmarks</span>
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all mt-1.5 border-t border-white/5 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Login Link Button */
            <Link
              href="/login"
              className="relative px-5 py-1.5 rounded-full text-sm font-medium text-white overflow-hidden group border border-white/10 bg-white/5 transition-all hover:border-cyan-500/40"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Burger Trigger */}
        <div className="flex md:hidden items-center space-x-4">
          <Link href="/search" className="text-zinc-400 hover:text-white" title="Search">
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-zinc-400 hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/10 bg-zinc-950/95 overflow-hidden backdrop-blur-xl"
          >
            <div className="px-6 py-5 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base font-medium py-1.5 border-b border-white/5 ${
                    pathname === link.href ? "text-cyan-400" : "text-zinc-400"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {session ? (
                <>
                  {isAdminOrEditor && (
                    <Link href="/admin" className="text-zinc-300 flex items-center space-x-2 py-1.5">
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <Link href="/bookmarks" className="text-zinc-300 flex items-center space-x-2 py-1.5">
                    <User className="w-4 h-4 text-violet-400" />
                    <span>My Bookmarks</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-red-400 flex items-center space-x-2 py-2 border-t border-white/5 mt-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm shadow-glow-cyan mt-3"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
