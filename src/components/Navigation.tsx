"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Home as HomeIcon, CreditCard, Sparkles, LayoutGrid, TrendingUp, BookOpen, ArrowUpRight, Youtube, Instagram, Facebook } from "lucide-react";
import { Link } from "@/components/Link";
import NavLink from "@/components/NavLink";
import { analytics } from "@/services/analytics";
import { brandConfig } from "@/config/brand.config";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";

type MobileNavItem = {
  label: string;
  to?: string;
  description?: string;
  action?: () => void;
};

type MobileSection = {
  title: string;
  items: MobileNavItem[];
};

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
  sections: MobileSection[];
  logoSrc: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const MobileMenuOverlay = ({
  open,
  onClose,
  sections,
  logoSrc,
  triggerRef,
}: MobileMenuOverlayProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  // Mount only when open to avoid unnecessary portals
  if (typeof document === "undefined") return null;

  useEffect(() => {
    if (!open) return;

    // Save previously focused element to restore later
    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Initial focus: first focusable within, else dialog itself
    const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable[0] || dialog;
    first.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const isShift = event.shiftKey;
        const current = document.activeElement as HTMLElement | null;

        if (!current) return;

        if (!isShift && current === lastEl) {
          event.preventDefault();
          firstEl.focus();
        } else if (isShift && current === firstEl) {
          event.preventDefault();
          lastEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Restore focus to trigger when closing
  useEffect(() => {
    if (!open && previousFocusedElementRef.current) {
      previousFocusedElementRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleDialogClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="menu-backdrop lg:hidden"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Overlay */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className="menu-overlay open safe-area-inset-top lg:hidden"
        onClick={handleBackdropClick}
      >
        <div
          className="relative flex flex-col flex-1 bg-white shadow-2xl"
          onClick={handleDialogClick}
        >
          {/* Header with LAZYPAY wordmark */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="lp-logo-mark" />
              <span className="font-display text-xl font-extrabold tracking-tight text-[#0A0A0F]">
                LAZY<span className="text-[#FF1E7E]">PAY</span>
              </span>
            </div>
            <button
              ref={firstFocusRef}
              className="touch-target w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 active:bg-pink-100 transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[#FF1E7E]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 bg-white">
            {/* Primary Navigation - pill chips */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link
                to="/"
                className="group flex flex-col items-start justify-between rounded-3xl p-5 h-32 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FFE4EF 0%, #FFCEDF 100%)" }}
                onClick={onClose}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-[#FF1E7E]" strokeWidth={2.2} />
                </div>
                <span className="font-display text-lg font-bold text-pink-950">Home</span>
              </Link>

              <Link
                to="/cards"
                className="group flex flex-col items-start justify-between rounded-3xl p-5 h-32 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #EFE9FB 0%, #DCD0F5 100%)" }}
                onClick={onClose}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-700" strokeWidth={2.2} />
                </div>
                <span className="font-display text-lg font-bold text-purple-950">Discover</span>
              </Link>
            </div>

            {/* Tools Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF1E7E]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  AI Tools
                </p>
              </div>
              <div className="space-y-2">
                {(() => {
                  const toolIcons: Record<string, typeof Sparkles> = {
                    'Super Card Genius': Sparkles,
                    'Category Card Genius': LayoutGrid,
                    'Beat My Card': TrendingUp,
                  };
                  const toolColors: Record<string, { bg: string; icon: string; text: string }> = {
                    'Super Card Genius': { bg: 'bg-pink-50', icon: 'text-[#FF1E7E]', text: 'text-[#0A0A0F]' },
                    'Category Card Genius': { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-[#0A0A0F]' },
                    'Beat My Card': { bg: 'bg-emerald-50', icon: 'text-emerald-700', text: 'text-[#0A0A0F]' },
                  };
                  return sections
                    .find((s) => s.title === "Tools")
                    ?.items.map((tool) => {
                      if (!tool.to) return null;
                      const Icon = toolIcons[tool.label] || Sparkles;
                      const colors = toolColors[tool.label] || { bg: 'bg-slate-50', icon: 'text-slate-700', text: 'text-[#0A0A0F]' };
                      return (
                        <Link
                          key={tool.to}
                          to={tool.to}
                          className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 hover:border-[#FF1E7E]/30 hover:bg-pink-50/30 transition-all"
                          onClick={onClose}
                        >
                          <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={2.2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-display font-bold text-sm ${colors.text}`}>
                              {tool.label}
                            </div>
                            {tool.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {tool.description}
                              </p>
                            )}
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF1E7E] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      );
                    });
                })()}
              </div>
            </div>

            {/* Blogs */}
            <Link
              to="/blogs"
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 hover:border-[#FF1E7E]/30 hover:bg-pink-50/30 transition-all mb-6"
              onClick={onClose}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-amber-700" strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm text-[#0A0A0F]">Blogs</div>
                <p className="text-xs text-slate-500 mt-0.5">Expert tips & guides</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF1E7E] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>

            {/* Socials */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF1E7E]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Follow Us
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "YouTube", href: "https://www.youtube.com/@lazypayofficial", Icon: Youtube, color: "text-red-600", bg: "bg-red-50" },
                  { label: "Instagram", href: "https://www.instagram.com/lazypay_official/", Icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
                  { label: "Facebook", href: "https://www.facebook.com/lazypayofficial/", Icon: Facebook, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl ${s.bg} py-4 transition-all hover:scale-[1.03] active:scale-[0.97]`}
                    onClick={onClose}
                  >
                    <s.Icon className={`w-5 h-5 ${s.color}`} strokeWidth={2.2} />
                    <span className="text-[11px] font-semibold text-slate-700">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <Link
              to="/card-genius"
              onClick={onClose}
              className="lp-btn-primary w-full inline-flex items-center justify-center gap-2 text-sm"
            >
              Get Started
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollYRef = useRef(0);

  // Auto-hide navigation on scroll
  const { style, isVisible } = useAutoHideNav({
    threshold: 10,
    duration: 300,
  });

  // Update CSS variable for nav height based on visibility
  const navHeight = isVisible ? '7rem' : '0rem';

  // Body scroll lock with scroll position preservation (iOS friendly)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;

    if (isMobileMenuOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      body.classList.add('menu-scroll-lock');
      body.style.top = `-${scrollYRef.current}px`;
    } else {
      const prevTop = body.style.top;
      body.classList.remove('menu-scroll-lock');
      body.style.top = '';

      if (prevTop) {
        const y = Math.abs(parseInt(prevTop, 10)) || scrollYRef.current;
        window.scrollTo(0, y);
      }
    }

    return () => {
      body.classList.remove('menu-scroll-lock');
      body.style.top = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks: MobileNavItem[] = useMemo(() => ([
    { label: 'Home', to: '/', action: () => analytics.trackMenuClick('Home') },
    { label: 'Discover', to: '/cards', action: () => analytics.trackMenuClick('Discover') },
    { label: 'About', to: '/about', action: () => analytics.trackMenuClick('About') },
  ]), []);

  const toolLinks: MobileNavItem[] = useMemo(() => ([
    { label: 'Super Card Genius', description: 'AI finds the right card for you.', to: '/card-genius', action: () => analytics.trackMenuClick('Super Card Genius') },
    { label: 'Category Card Genius', description: 'Find the best card for your spend style.', to: '/card-genius-category', action: () => analytics.trackMenuClick('Category Card Genius') },
    { label: 'Beat My Card', description: 'See if you can upgrade your card.', to: '/beat-my-card', action: () => analytics.trackMenuClick('Beat My Card') },
  ]), []);

  const mobileSections: MobileSection[] = useMemo(() => ([
    {
      title: 'Navigate',
      items: navLinks
    },
    {
      title: 'Tools',
      items: toolLinks
    }
  ]), [navLinks, toolLinks]);

  return <nav
    className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl overflow-visible will-change-transform border-b border-black/5"
    style={{
      ...style,
      '--nav-height': navHeight,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
    } as React.CSSProperties}
  >
    <div className="container mx-auto px-6 py-3 lg:py-4 overflow-visible">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center gap-1">
            <div className="lp-logo-mark" />
            <span className="font-display text-2xl font-extrabold tracking-tight text-[#0A0A0F]">
              LAZY<span className="text-[#FF1E7E]">PAY</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <NavLink
              key={link.label}
              to={link.to!}
              className="px-4 py-2 rounded-full text-slate-700 hover:text-[#FF1E7E] hover:bg-pink-50 transition-all font-medium text-sm"
              activeClassName="text-[#FF1E7E] bg-pink-50 font-semibold"
              onClick={link.action}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Tools Dropdown */}
          <div className="relative group">
            <button className="px-4 py-2 rounded-full text-slate-700 hover:text-[#FF1E7E] hover:bg-pink-50 transition-all font-medium text-sm flex items-center gap-1">
              Tools
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full right-0 mt-2 w-80 bg-white border border-black/5 rounded-2xl shadow-2xl py-2 z-[100]">
              {toolLinks.map(tool => (
                <Link
                  key={tool.to}
                  to={tool.to!}
                  className="block px-5 py-3 hover:bg-pink-50 transition-colors group/item"
                  onClick={tool.action}
                >
                  <div className="font-semibold text-slate-900 group-hover/item:text-[#FF1E7E] transition-colors">{tool.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>
                </Link>
              ))}
            </div>
          </div>

          <NavLink
            to="/blogs"
            className="px-4 py-2 rounded-full text-slate-700 hover:text-[#FF1E7E] hover:bg-pink-50 transition-all font-medium text-sm"
            activeClassName="text-[#FF1E7E] bg-pink-50 font-semibold"
          >
            Blogs
          </NavLink>
        </div>

        {/* CTA Button - Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/card-genius" className="lp-btn-primary inline-flex items-center gap-2 text-sm">
            Get Started
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            ref={menuTriggerRef}
            className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 active:bg-pink-100 border border-pink-200 transition-all touch-target"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <div className="relative w-5 h-5 flex flex-col items-center justify-center gap-1">
              <span className="block w-5 h-0.5 bg-[#FF1E7E] rounded-full"></span>
              <span className="block w-5 h-0.5 bg-[#FF1E7E] rounded-full"></span>
              <span className="block w-5 h-0.5 bg-[#FF1E7E] rounded-full"></span>
            </div>
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu Drawer (portal overlay) */}
    <MobileMenuOverlay
      open={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
      sections={mobileSections}
      logoSrc={brandConfig.logo}
      triggerRef={menuTriggerRef}
    />

  </nav>;
};
export default Navigation;
