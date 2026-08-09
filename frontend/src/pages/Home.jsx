import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import HeroCanvas from "../components/HeroCanvas";
import { api } from "../lib/api";

const heroImg = "https://images.unsplash.com/photo-1726835498689-b4f6dbcdbdfb?w=2000&q=85";
const pourImg = "https://images.unsplash.com/photo-1522992319-0365e5f11656?w=1600&q=85";
const dessertImg = "https://images.unsplash.com/photo-1776763019245-2de2352cce7e?w=1600&q=85";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    api.get("/products", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page" className="relative">
      {/* HERO */}
      <section data-testid="hero-section" className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 opacity-70">
          <HeroCanvas />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-32 px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.3 }}
            className="text-[10px] tracking-luxe uppercase text-noir-champagne mb-8"
          >
            — An international café atelier
          </motion.div>
          <motion.h1
            data-testid="hero-headline"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] text-noir-text max-w-5xl"
          >
            Slow down. <br/>
            <span className="italic text-noir-champagne">Savour</span> the extraordinary.
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mt-8 max-w-xl text-noir-text2 text-base md:text-lg leading-relaxed"
          >
            An elevated café experience crafted around exceptional coffee, beautiful plates and unforgettable moments.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/menu"
              data-testid="hero-explore-menu-btn"
              className="group inline-flex items-center gap-3 bg-noir-gold text-noir-bg px-8 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne transition-colors"
            >
              Explore Menu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/menu"
              data-testid="hero-order-now-btn"
              className="inline-flex items-center gap-3 border border-noir-text/20 text-noir-text px-8 py-4 text-[11px] tracking-luxe uppercase hover:border-noir-gold hover:text-noir-gold transition-colors"
            >
              Order Now
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 right-6 md:right-16 text-[10px] tracking-luxe uppercase text-noir-muted rotate-90 origin-bottom-right hidden md:block">
          Scroll to discover
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-noir-border overflow-hidden py-8 bg-noir-bg2">
        <div className="marquee-track flex whitespace-nowrap gap-16 font-serif text-3xl md:text-5xl italic text-noir-text2">
          {[..."Espresso Noir · Velvet Mocha · Burrata Sunrise · Dark Chocolate Torte · Pistachio Paris-Brest · Midnight Cold Brew · Truffle Brioche · ".repeat(4)].join("")}
        </div>
      </section>

      {/* CRAFTED IN MOTION */}
      <section data-testid="crafted-section" className="relative py-24 md:py-40 px-6 md:px-16">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— Crafted in motion</div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">
              Every pour is a<br/><span className="italic text-noir-champagne">quiet ritual.</span>
            </h2>
            <p className="mt-8 text-noir-text2 max-w-md leading-relaxed">
              A single origin bean, a hand-turned grind, twenty-eight seconds of patience.
              This is coffee kept in reverence — the kind you feel before you taste.
            </p>
            <Link
              to="/story"
              className="mt-10 inline-flex items-center gap-3 text-noir-gold text-[11px] tracking-luxe uppercase link-underline"
            >
              Read the story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="md:col-span-7 md:col-start-6 relative aspect-[4/5] overflow-hidden">
            <motion.img
              src={pourImg}
              alt="Espresso pouring"
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-bg/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section data-testid="featured-section" className="relative py-24 md:py-40 px-6 md:px-16 bg-noir-bg2">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— The collection</div>
              <h2 className="font-serif text-4xl md:text-6xl">Signature creations</h2>
            </div>
            <Link
              to="/menu"
              data-testid="view-all-menu-btn"
              className="text-[11px] tracking-luxe uppercase text-noir-text2 hover:text-noir-gold link-underline"
            >
              View full menu →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.08 }}
                className="product-card group"
              >
                <Link to={`/menu/${p.slug}`} data-testid={`featured-product-${p.slug}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-noir-bg3">
                    <img src={p.image} alt={p.name} className="product-img absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir-bg via-noir-bg/30 to-transparent opacity-70" />
                    <div className="absolute bottom-0 p-6">
                      <div className="text-[10px] tracking-luxe uppercase text-noir-champagne mb-2">
                        {p.category.replace("_", " ")}
                      </div>
                      <div className="font-serif text-2xl md:text-3xl">{p.name}</div>
                      <div className="mt-2 text-noir-gold">${p.price.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL DESSERT */}
      <section className="relative py-24 md:py-40 px-6 md:px-16 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 relative aspect-[5/6] overflow-hidden order-2 md:order-1">
            <img src={dessertImg} alt="Fine dessert" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2">
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— The dessert atelier</div>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">
              Where <span className="italic text-noir-champagne">coffee</span><br/>becomes ritual.
            </h2>
            <p className="mt-8 text-noir-text2 leading-relaxed">
              Our patissiers work between Paris and Tokyo, honing textures and shadows.
              Every plate arrives as a small essay in restraint.
            </p>
            <Link
              to="/story"
              className="mt-10 inline-flex items-center gap-3 border border-noir-text/20 px-8 py-4 text-[11px] tracking-luxe uppercase hover:border-noir-gold hover:text-noir-gold transition-colors"
            >
              Our philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* RESERVE STRIP */}
      <section className="relative py-24 px-6 md:px-16 bg-noir-bg2 border-y border-noir-border">
        <div className="max-w-[1400px] mx-auto text-center">
          <h3 className="font-serif text-3xl md:text-5xl">Reserve a table. Or a moment.</h3>
          <p className="mt-4 text-noir-text2">Private tastings, seasonal events, and quiet corners.</p>
          <Link
            to="/events"
            data-testid="home-reserve-btn"
            className="mt-8 inline-block bg-noir-gold text-noir-bg px-10 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne transition-colors"
          >
            Reserve now
          </Link>
        </div>
      </section>
    </div>
  );
}
