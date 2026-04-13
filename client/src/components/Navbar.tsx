import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Minha Conta", href: "/account" },
    { label: "Sobre nós", href: "/about" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container">
          <nav className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Logo */}
            <Link href="/">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/logo-organick_9080e848.png"
                alt="Organick"
                className="h-8 md:h-9 w-auto hover:opacity-70 transition-opacity"
              />
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span
                      className={`text-[15px] font-medium tracking-tight transition-all duration-200 hover:opacity-60 ${
                        isActive(link.href)
                          ? "text-foreground opacity-100"
                          : "text-foreground opacity-75"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/members">
                  <span className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-foreground text-background text-[14px] font-medium hover:opacity-80 transition-all active:scale-95">
                    Minha Conta
                  </span>
                </Link>
              ) : (
                <Link href="/login">
                  <span className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-foreground text-background text-[14px] font-medium hover:opacity-80 transition-all active:scale-95">
                    Entrar
                  </span>
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -mr-2 text-foreground opacity-75 hover:opacity-100 transition-opacity"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-white/80 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />
        {/* Menu panel */}
        <div
          className={`absolute top-0 left-0 right-0 glass pt-20 pb-8 px-6 transition-transform duration-300 ${
            mobileOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <span
                    className={`block py-3 text-[18px] font-medium tracking-tight border-b border-border last:border-0 ${
                      isActive(link.href) ? "text-foreground" : "text-foreground/70"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {isAuthenticated ? (
              <Link href="/members">
                <span className="block text-center py-3 rounded-full bg-foreground text-background text-[16px] font-medium">
                  Minha Conta
                </span>
              </Link>
            ) : (
              <Link href="/login">
                <span className="block text-center py-3 rounded-full bg-foreground text-background text-[16px] font-medium">
                  Entrar
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
