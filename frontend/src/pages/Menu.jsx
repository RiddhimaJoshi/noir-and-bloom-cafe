import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { key: "all", name: "All" },
  { key: "coffee", name: "Coffee" },
  { key: "brunch", name: "Brunch" },
  { key: "desserts", name: "Desserts" },
  { key: "cold_drinks", name: "Cold Drinks" },
  { key: "signature", name: "Signature" },
];
const DIETARY = ["vegetarian", "vegan", "gluten-free"];

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("all");
  const [diet, setDiet] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get("/products").then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (diet) list = list.filter((p) => p.dietary?.includes(diet));
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, diet, q, sort]);

  return (
    <div data-testid="menu-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="mb-20">
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— The atelier</div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05]">The <span className="italic text-noir-champagne">menu</span></h1>
          <p className="mt-6 text-noir-text2 max-w-xl">
            A rotating collection of coffee, brunch, desserts and quiet indulgences — sourced with care, plated with restraint.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-12 border-y border-noir-border py-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                data-testid={`filter-cat-${c.key}`}
                onClick={() => setCat(c.key)}
                className={`px-4 py-2 text-[10px] tracking-luxe uppercase border transition-colors ${
                  cat === c.key ? "bg-noir-gold text-noir-bg border-noir-gold" : "border-noir-border text-noir-text2 hover:border-noir-gold hover:text-noir-gold"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex-1 flex items-center gap-4 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-muted" />
              <input
                data-testid="menu-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold pl-6 py-2 text-sm outline-none"
              />
            </div>
            <select
              data-testid="menu-diet-filter"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="bg-transparent border-b border-noir-border py-2 text-xs uppercase tracking-widest focus:border-noir-gold outline-none"
            >
              <option value="">All diets</option>
              {DIETARY.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button
              data-testid="menu-sort"
              onClick={() => setSort(sort === "asc" ? "desc" : sort === "desc" ? "default" : "asc")}
              className="flex items-center gap-2 text-[10px] tracking-luxe uppercase hover:text-noir-gold"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sort === "asc" ? "Price ↑" : sort === "desc" ? "Price ↓" : "Sort"}
            </button>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div data-testid="menu-loading" className="text-noir-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <div data-testid="menu-empty" className="text-noir-muted py-24 text-center">Nothing matches — try another filter.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                data-testid={`product-card-${p.slug}`}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: (i % 6) * 0.05 }}
                className="product-card group"
              >
                <Link to={`/menu/${p.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-noir-bg3">
                  <img src={p.image} alt={p.name} className="product-img absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-bg via-noir-bg/20 to-transparent opacity-80" />
                  <div className="absolute top-4 left-4 text-[10px] tracking-luxe uppercase text-noir-champagne">
                    {p.category.replace("_", " ")}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 flex justify-between items-end">
                    <div>
                      <div className="font-serif text-2xl">{p.name}</div>
                      {p.calories && <div className="text-[10px] tracking-luxe uppercase text-noir-muted mt-1">{p.calories} kcal</div>}
                    </div>
                    <div className="font-serif text-xl text-noir-gold">${p.price.toFixed(2)}</div>
                  </div>
                </Link>
                <button
                  data-testid={`add-to-cart-${p.slug}`}
                  onClick={() => { add(p); toast.success(`${p.name} added`); }}
                  className="w-full mt-4 border border-noir-border py-3 text-[10px] tracking-luxe uppercase text-noir-text2 hover:border-noir-gold hover:text-noir-gold transition-colors"
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
