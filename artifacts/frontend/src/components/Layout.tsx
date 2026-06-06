import { Link, useLocation } from "wouter";
import { auth } from "@/lib/api";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/universities", label: "Universities" },
  { href: "/applications", label: "My Applications" },
  { href: "/payments", label: "Payments" },
  { href: "/profile", label: "Profile" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  const handleLogout = useCallback(() => {
    auth.clearToken();
    navigate("/login");
  }, [navigate]);

  const isLoggedIn = auth.isLoggedIn();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-[hsl(222,47%,11%)] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="flex items-center gap-2 cursor-pointer select-none">
                <img
                  src="https://www.globetrekoverseas.com/assets/logo-DQuwRIJG.png"
                  alt="GlobeTrek Overseas"
                  className="h-10 w-auto"
                />
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {isLoggedIn &&
                navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        location === link.href
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/5",
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
            </nav>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded border border-white/20 hover:border-white/40"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/login">
                    <span className="text-sm text-white/70 hover:text-white cursor-pointer transition-colors">
                      Sign In
                    </span>
                  </Link>
                  <Link href="/register">
                    <span className="text-sm bg-[hsl(43,100%,50%)] text-[hsl(222,47%,11%)] font-semibold px-4 py-1.5 rounded cursor-pointer hover:brightness-110 transition-all">
                      Register
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile nav */}
          {isLoggedIn && (
            <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap cursor-pointer",
                      location === link.href
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white",
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[hsl(222,47%,11%)] text-white/40 text-center text-xs py-6 mt-auto">
        <p>
          GlobeTrek Overseas &copy; {new Date().getFullYear()} — Empowering
          students to study abroad
        </p>
      </footer>
    </div>
  );
}
