import React from "react";
import { motion } from "framer-motion";

const heroImg = "https://images.unsplash.com/photo-1726835498689-b4f6dbcdbdfb?w=1800&q=85";
const beansImg = "https://images.unsplash.com/photo-1620815498155-a09c73b5fce1?w=1600&q=85";
const dessertImg = "https://images.unsplash.com/photo-1776763019245-2de2352cce7e?w=1600&q=85";

export default function About() {
  return (
    <div data-testid="about-page" className="pt-32 pb-24">
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="absolute inset-0 hero-vignette" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-16 pb-16">
          <div className="text-[10px] tracking-luxe uppercase text-noir-champagne mb-6">— Our story</div>
          <h1 className="font-serif text-5xl md:text-8xl leading-[0.95] max-w-4xl">Where coffee becomes <span className="italic text-noir-champagne">ritual.</span></h1>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24">
        <div className="max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-noir-text2 space-y-8">
          <p>Noir & Bloom began as a quiet obsession — the difference between a coffee that is simply prepared and one that is <em className="italic text-noir-champagne">conjured.</em> Between a dessert plated and a dessert composed.</p>
          <p>From a single counter in Paris to ateliers in Tokyo, New York and Dubai, we have built rooms where light falls slowly, where cream still moves in ribbons, and where every guest is invited into a moment worth remembering.</p>
          <p>We source from a small circle of producers we know by name. We roast in small batches. We plate with restraint. We believe that indulgence, when done with intention, becomes something closer to prayer.</p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24 bg-noir-bg2 border-y border-noir-border">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.img
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            src={beansImg}
            alt="Coffee beans"
            className="aspect-[4/5] object-cover w-full"
          />
          <div>
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— The bean</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.1]">A journey that begins <span className="italic text-noir-champagne">1,800m</span> above sea.</h2>
            <p className="mt-6 text-noir-text2 leading-relaxed">
              Our Ethiopian Yirgacheffe is hand-picked at altitude by families we've worked with for a decade.
              It is fermented slowly, sun-dried on raised beds, and roasted in Paris by our master roaster, Céline Rousseau.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— The plate</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-[1.1]">Desserts that whisper before they <span className="italic text-noir-champagne">sing.</span></h2>
            <p className="mt-6 text-noir-text2 leading-relaxed">
              Our pastry team trained in Lyon and Kyoto. They work in shadows and gold — Guanaja chocolate, Bronte pistachio, Madagascar vanilla.
              Restraint is our first ingredient.
            </p>
          </div>
          <motion.img
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            src={dessertImg}
            alt="Fine dessert"
            className="aspect-[4/5] object-cover w-full order-1 md:order-2"
          />
        </div>
      </section>
    </div>
  );
}
