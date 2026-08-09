import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

const links = [
  { to: "/menu", label: "Menu" },
  { to: "/story", label: "Our Story" },
  { to: "/locations", label: "Locations" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <>
      <header
        data-testid="nav-header"
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-noir-bg/80 backdrop-blur-xl border-b border-noir-border" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 flex items-center justify-between h-20">
          <Link to="/" data-testid="nav-logo" className="font-serif text-xl md:text-2xl tracking-[0.25em] text-noir-text">
            NOIR<span className="text-noir-gold"> · </span>BLOOM
          </Link>
          <nav className="hidden lg:flex items-center gap-10">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `link-underline text-[11px] tracking-luxe uppercase transition-colors ${
                    isActive ? "text-noir-gold" : "text-noir-text2 hover:text-noir-text"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <Link
              to="/cart"
              data-testid="nav-cart-btn"
              className="relative text-noir-text2 hover:text-noir-gold transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-noir-gold text-noir-bg text-[10px] font-medium w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <Link
              to="/menu"
              data-testid="nav-order-btn"
              className="hidden md:inline-block bg-noir-gold text-noir-bg px-6 py-3 text-[10px] tracking-luxe uppercase hover:bg-noir-champagne transition-colors"
            >
              Order Now
            </Link>
            <button
              data-testid="nav-menu-btn"
              onClick={() => setOpen(true)}
              className="lg:hidden text-noir-text"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-noir-bg/95 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between px-6 h-20">
              <span className="font-serif text-xl tracking-[0.25em]">NOIR · BLOOM</span>
              <button data-testid="mobile-menu-close" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>
            <motion.nav
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="flex flex-col gap-8 items-start px-8 pt-12"
            >
              {links.map((l) => (
                <motion.div
                  key={l.to}
                  variants={{ hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                >
                  <Link
                    to={l.to}
                    data-testid={`mobile-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                    className="font-serif text-4xl text-noir-text"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={{ hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
                <Link
                  to="/menu"
                  data-testid="mobile-order-btn"
                  className="inline-block mt-6 bg-noir-gold text-noir-bg px-8 py-4 text-xs tracking-luxe uppercase"
                >
                  Order Now
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
