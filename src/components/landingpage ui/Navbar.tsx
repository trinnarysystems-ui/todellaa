import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import PilotBanner from "./PilotBanner";

interface NavbarProps {
  onOpenTrialModal?: () => void;
  showBanner?: boolean;
}

export default function Navbar({ onOpenTrialModal, showBanner = true }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("todella_banner_dismissed") === "true";
    }
    return false;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleCloseBanner = () => {
    setBannerDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("todella_banner_dismissed", "true");
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const isHomePage = location.pathname === "/" || location.pathname === "";

    if (!isHomePage) {
      navigate({ to: "/", hash: targetId }).then(() => {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      });
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = targetId;
      }
    }
  };

  const handleTrialClick = () => {
    setMobileMenuOpen(false);
    if (onOpenTrialModal) {
      onOpenTrialModal();
    } else {
      navigate({ to: "/signup" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full font-sans">
      {showBanner && !bannerDismissed && (
        <PilotBanner
          onOpenTrialModal={handleTrialClick}
          onClose={handleCloseBanner}
        />
      )}
      {/* Main Header Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#e6e4dc] transition-all">
        <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3.5 max-w-7xl mx-auto w-full">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none shrink-0 group">
            <svg className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e8562a" />
                  <stop offset="100%" stopColor="#f06e42" />
                </linearGradient>
              </defs>
              <path
                d="M40 50 C 40 50, 90 40, 160 40 C 170 40, 170 50, 160 60 C 130 90, 120 120, 105 160 C 100 170, 90 170, 85 160 C 75 140, 70 120, 75 90 Z"
                fill="url(#logoGrad)"
              />
              <path
                d="M80 95 L105 120 L150 70"
                stroke="white"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-extrabold tracking-tight text-[#010101]">Todellaa</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 font-sans">
            <Link to="/features" className="text-[14px] font-medium text-[#404040] hover:text-[#010101] transition-colors cursor-pointer" activeProps={{ className: "text-[#010101] font-semibold" }}>Features</Link>
            <Link to="/integrations" className="text-[14px] font-medium text-[#404040] hover:text-[#010101] transition-colors cursor-pointer" activeProps={{ className: "text-[#010101] font-semibold" }}>Integrations</Link>
            <Link to="/reconciliation" className="text-[14px] font-medium text-[#404040] hover:text-[#010101] transition-colors cursor-pointer" activeProps={{ className: "text-[#010101] font-semibold" }}>Reconciliation</Link>
            <Link to="/pricing" className="text-[14px] font-medium text-[#404040] hover:text-[#010101] transition-colors cursor-pointer" activeProps={{ className: "text-[#010101] font-semibold" }}>Pricing</Link>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-5 font-sans">
            <Link
              to="/login"
              className="text-[14px] font-medium text-[#404040] hover:text-[#010101] transition-colors"
            >
              Login
            </Link>
            <button
              onClick={handleTrialClick}
              className="bg-[#e8562a] hover:bg-[#d44820] text-white font-semibold text-[14px] py-2.5 px-5 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center bg-white border border-[#e6e4dc] rounded-lg text-[#010101] hover:bg-neutral-100 transition-all cursor-pointer shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full bg-white border-b border-[#e6e4dc] backdrop-blur-xl px-6 py-6 flex flex-col gap-4 shadow-xl z-50 md:hidden font-sans">
            <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#404040] hover:text-[#010101] py-2 border-b border-[#e6e4dc]/60 cursor-pointer flex items-center justify-between" activeProps={{ className: "text-[#010101] font-bold" }}>
              <span>Features</span>
            </Link>
            <Link to="/integrations" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#404040] hover:text-[#010101] py-2 border-b border-[#e6e4dc]/60 cursor-pointer flex items-center justify-between" activeProps={{ className: "text-[#010101] font-bold" }}>
              <span>Integrations</span>
            </Link>
            <Link to="/reconciliation" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#404040] hover:text-[#010101] py-2 border-b border-[#e6e4dc]/60 cursor-pointer flex items-center justify-between" activeProps={{ className: "text-[#010101] font-bold" }}>
              <span>Reconciliation</span>
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#404040] hover:text-[#010101] py-2 border-b border-[#e6e4dc]/60 cursor-pointer flex items-center justify-between" activeProps={{ className: "text-[#010101] font-bold" }}>
              <span>Pricing</span>
            </Link>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-center py-2.5 text-[#010101] border border-[#e6e4dc] bg-white rounded-lg"
              >
                Login
              </Link>
              <button
                onClick={handleTrialClick}
                className="text-sm font-semibold text-center py-2.5 bg-[#e8562a] text-white rounded-lg shadow-xs cursor-pointer w-full"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

