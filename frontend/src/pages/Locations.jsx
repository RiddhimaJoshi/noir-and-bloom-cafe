import React, { useEffect, useState } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";

export default function Locations() {
  const [locs, setLocs] = useState([]);
  useEffect(() => { api.get("/locations").then((r) => setLocs(r.data)); }, []);

  return (
    <div data-testid="locations-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Our rooms</div>
        <h1 className="font-serif text-5xl md:text-7xl">Find us <span className="italic text-noir-champagne">nearby.</span></h1>
        <p className="mt-6 text-noir-text2 max-w-xl">Four rooms across the world, each shaped by its city — but bound by the same quiet philosophy.</p>

        <div className="mt-20 grid md:grid-cols-2 gap-8">
          {locs.map((l, i) => (
            <motion.div
              key={l.id}
              data-testid={`location-${l.id}`}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="border border-noir-border p-8 md:p-12 bg-noir-bg2 hover:border-noir-gold transition-colors group"
            >
              <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-3">— Room 0{i + 1}</div>
              <h3 className="font-serif text-4xl md:text-5xl mb-8">{l.city}</h3>
              <div className="space-y-4 text-noir-text2">
                <div className="flex gap-4"><MapPin className="w-4 h-4 mt-1 text-noir-gold shrink-0" /> {l.address}</div>
                <div className="flex gap-4"><Clock className="w-4 h-4 mt-1 text-noir-gold shrink-0" /> {l.hours}</div>
                <div className="flex gap-4"><Phone className="w-4 h-4 mt-1 text-noir-gold shrink-0" /> {l.phone}</div>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(l.address)}`}
                target="_blank"
                rel="noreferrer"
                data-testid={`directions-${l.id}`}
                className="mt-10 inline-block border border-noir-border px-6 py-3 text-[10px] tracking-luxe uppercase hover:border-noir-gold hover:text-noir-gold"
              >
                Directions
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
