import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [recommended, setRecommended] = useState([]);
  const { add } = useCart();

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => setP(r.data)).catch(() => setP(false));
    api.get("/products", { params: { featured: true } }).then((r) => setRecommended(r.data.slice(0, 3)));
  }, [slug]);

  if (p === false) return <div className="pt-40 px-6 text-center text-noir-muted">Product not found.</div>;
  if (!p) return <div className="pt-40 px-6 text-center text-noir-muted">Loading…</div>;

  return (
    <div data-testid="product-details-page" className="pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16">
        <Link to="/menu" className="inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-noir-muted hover:text-noir-gold mb-12">
          <ArrowLeft className="w-3 h-3" /> Back to menu
        </Link>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative aspect-square overflow-hidden bg-noir-bg3"
          >
            <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>
          <div className="md:pt-8">
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">{p.category.replace("_", " ")}</div>
            <h1 data-testid="product-name" className="font-serif text-5xl md:text-6xl leading-[1.05]">{p.name}</h1>
            <div className="mt-6 font-serif text-3xl text-noir-champagne">${p.price.toFixed(2)}</div>
            <p className="mt-8 text-noir-text2 leading-relaxed">{p.description}</p>

            {p.ingredients?.length > 0 && (
              <div className="mt-10">
                <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-3">Ingredients</div>
                <div className="text-noir-text2">{p.ingredients.join(" · ")}</div>
              </div>
            )}
            {p.allergens?.length > 0 && (
              <div className="mt-6">
                <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-3">Allergens</div>
                <div className="text-noir-text2">{p.allergens.join(" · ")}</div>
              </div>
            )}
            {p.calories && (
              <div className="mt-6">
                <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-3">Nutrition</div>
                <div className="text-noir-text2">{p.calories} kcal</div>
              </div>
            )}

            <div className="mt-10 flex items-center gap-6">
              <div className="flex items-center border border-noir-border">
                <button data-testid="qty-minus" onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:text-noir-gold"><Minus className="w-4 h-4" /></button>
                <span data-testid="qty-value" className="px-6 text-lg">{qty}</span>
                <button data-testid="qty-plus" onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:text-noir-gold"><Plus className="w-4 h-4" /></button>
              </div>
              <button
                data-testid="detail-add-to-cart"
                onClick={() => { add(p, qty); toast.success(`${p.name} × ${qty} added`); }}
                className="flex-1 bg-noir-gold text-noir-bg px-8 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne transition-colors"
              >
                Add to Cart · ${(p.price * qty).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <div className="mt-32">
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— You may also love</div>
            <div className="grid md:grid-cols-3 gap-8">
              {recommended.filter((r) => r.slug !== p.slug).slice(0, 3).map((r) => (
                <Link key={r.id} to={`/menu/${r.slug}`} className="product-card group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-noir-bg3">
                    <img src={r.image} alt={r.name} className="product-img absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-noir-bg/90 to-transparent">
                      <div className="font-serif text-2xl">{r.name}</div>
                      <div className="text-noir-gold mt-1">${r.price.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
