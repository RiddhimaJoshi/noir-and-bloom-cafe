import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/newsletter", { email });
      toast.success("Welcome to the ritual. Check your inbox.");
      setEmail("");
    } catch {
      toast.error("Please enter a valid email.");
    }
  };
  return (
    <footer data-testid="footer" className="relative z-10 border-t border-noir-border bg-noir-bg2 mt-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl tracking-[0.2em] mb-6">NOIR · BLOOM</div>
          <p className="text-noir-text2 max-w-md text-sm leading-relaxed">
            An international sanctuary for exceptional coffee, seasonal plates and desserts crafted with reverence.
          </p>
          <form onSubmit={submit} className="mt-8 flex items-center gap-4 max-w-md" data-testid="newsletter-form">
            <input
              data-testid="newsletter-input"
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent border-b border-noir-border focus:border-noir-gold text-noir-text placeholder:text-noir-muted py-3 outline-none text-sm"
            />
            <button
              data-testid="newsletter-submit"
              type="submit"
              className="text-[10px] tracking-luxe uppercase text-noir-gold hover:text-noir-champagne"
            >
              Subscribe →
            </button>
          </form>
        </div>
        <div>
          <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-4">Explore</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/menu" className="hover:text-noir-gold">Menu</Link></li>
            <li><Link to="/story" className="hover:text-noir-gold">Our Story</Link></li>
            <li><Link to="/locations" className="hover:text-noir-gold">Locations</Link></li>
            <li><Link to="/events" className="hover:text-noir-gold">Events</Link></li>
            <li><Link to="/contact" className="hover:text-noir-gold">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-4">Follow</div>
          <div className="flex gap-4 text-noir-text2">
            <a href="https://instagram.com" aria-label="Instagram" className="hover:text-noir-gold"><Instagram className="w-5 h-5" /></a>
            <a href="https://facebook.com" aria-label="Facebook" className="hover:text-noir-gold"><Facebook className="w-5 h-5" /></a>
          </div>
          <div className="mt-8 text-[10px] tracking-luxe uppercase text-noir-muted mb-2">Legal</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-noir-gold">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-noir-gold">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-noir-border px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-luxe uppercase text-noir-muted">
        <div>© {new Date().getFullYear()} NOIR & BLOOM · All rights reserved</div>
        <div>Crafted in Paris · Tokyo · New York · Dubai</div>
      </div>
    </footer>
  );
}
