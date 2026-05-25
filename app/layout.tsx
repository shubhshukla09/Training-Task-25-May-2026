import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "AuraBlog | Cinematic AI Blogging Platform",
    template: "%s | AuraBlog",
  },
  description: "An enterprise-grade luxury blogging platform driven by high-dimensional mathematical NLP semantic related recommendation vectors, sliding rate limits, and dark glassmorphic storytelling UI.",
  keywords: ["Artificial Intelligence", "Web Development", "Design Systems", "Cloud Caches", "Vector Similarity", "React 19", "Next.js 15"],
  authors: [{ name: "AuraBlog Editorial Team" }],
  creator: "AuraBlog Core Development",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "AuraBlog | Cinematic AI Blogging Platform",
    description: "Immersive luxury technical publication engine.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased text-zinc-100 bg-[#09090b] font-sans`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Immersive Glass Navigation */}
            <Navbar />
            
            {/* Main Content Area */}
            <main className="flex-grow pt-24 min-h-screen">
              {children}
            </main>

            {/* Premium Footer */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
