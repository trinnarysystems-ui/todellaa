import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Twitter, Youtube, Send } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <footer className="bg-white text-[#010101] pt-16 pb-12 border-t border-[#e6e4dc] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#e6e4dc]">
          
          {/* Column 1: Logo & Description (4 cols) */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2.5 select-none mb-4 group">
                <svg className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="footerLogoGrad" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#e8562a" />
                      <stop offset="100%" stopColor="#f06e42" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M40 50 C 40 50, 90 40, 160 40 C 170 40, 170 50, 160 60 C 130 90, 120 120, 105 160 C 100 170, 90 170, 85 160 C 75 140, 70 120, 75 90 Z"
                    fill="url(#footerLogoGrad)"
                  />
                  <path
                    d="M80 95 L105 120 L150 70"
                    stroke="white"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xl font-bold tracking-tight text-[#010101] dark:text-white">Todellaa</span>
              </Link>

              <p className="text-sm text-[#737373] leading-relaxed max-w-sm font-normal mb-6">
                Smart payment verification and reconciliation for businesses and educational institutions.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#e6e4dc] text-[#525252] hover:text-[#010101] hover:border-[#010101] flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#e6e4dc] text-[#525252] hover:text-[#010101] hover:border-[#010101] flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#e6e4dc] text-[#525252] hover:text-[#010101] hover:border-[#010101] flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-[#e6e4dc] text-[#525252] hover:text-[#010101] hover:border-[#010101] flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Product (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-[#010101] uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs font-medium text-[#737373]">
              <li><Link to="/features" className="hover:text-[#010101] transition-colors">Features</Link></li>
              <li><Link to="/integrations" className="hover:text-[#010101] transition-colors">Integrations</Link></li>
              <li><Link to="/pricing" className="hover:text-[#010101] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources & Company (3 cols) */}
          <div className="md:col-span-3 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#010101] uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs font-medium text-[#737373]">
                <li><Link to="/help-center" className="hover:text-[#010101] transition-colors">Help Center</Link></li>
                <li><Link to="/guides" className="hover:text-[#010101] transition-colors">Guides</Link></li>
                <li><Link to="/security" className="hover:text-[#010101] transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#010101] uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs font-medium text-[#737373]">
                <li><Link to="/about" className="hover:text-[#010101] transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-[#010101] transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-[#010101] transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-[#010101] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#010101] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 4: Stay updated (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-[#010101] uppercase tracking-wider mb-2">Stay updated</h4>
            <p className="text-xs text-[#737373] mb-4">
              Get tips, product updates, and finance insights straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#e6e4dc] rounded-xl px-3.5 py-2.5 text-xs text-[#010101] placeholder-[#a3a3a3] focus:outline-none focus:border-[#e8562a]"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#e8562a] hover:bg-[#d44820] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#737373]">
          <div>© 2026 TODELLAA. All rights reserved.</div>
        </div>

      </div>
    </footer>
  );
}
