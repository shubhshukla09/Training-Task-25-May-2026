import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Admin UI", href: "/admin" },
];

const socials = [
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border/80 py-12">
      <div className="container grid gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-semibold">Lumen Blog</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            A modern editorial experience focused on premium reading design, smooth interactions, and clean content
            architecture.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <nav className="flex flex-wrap gap-4 text-sm">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted-foreground transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-full border border-border/80 p-2 text-muted-foreground transition hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container mt-8 border-t border-border/70 pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lumen Blog. All rights reserved.
      </div>
    </footer>
  );
}