import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

export default function Cart() {
  const { items, remove, setQty, clear } = useCart();
  const [totals, setTotals] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) { setTotals(null); return; }
    api.post("/cart/totals", { items, coupon: applied || undefined })
      .then((r) => setTotals(r.data.totals));
  }, [items, applied]);

  const applyCoupon = async () => {
    try {
      await api.post("/coupons/validate", { code: coupon });
      setApplied(coupon.toUpperCase());
      toast.success(`Coupon ${coupon.toUpperCase()} applied`);
    } catch {
      toast.error("Invalid coupon");
    }
  };

  if (items.length === 0) {
    return (
      <div data-testid="cart-empty" className="pt-40 pb-24 px-6 text-center">
        <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— The cart</div>
        <h1 className="font-serif text-5xl md:text-6xl mb-6">Your bag is empty.</h1>
        <p className="text-noir-text2 max-w-md mx-auto">Begin your ritual — a single espresso, a slice of torte, a moment of pause.</p>
        <Link to="/menu" className="mt-10 inline-block bg-noir-gold text-noir-bg px-10 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne">
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-5xl md:text-6xl mb-12">Your bag</h1>
          <div className="border-t border-noir-border">
            {items.map((i) => (
              <div key={i.product_id} data-testid={`cart-item-${i.product_id}`} className="grid grid-cols-[100px_1fr_auto] gap-6 py-8 border-b border-noir-border items-center">
                <img src={i.image} alt={i.name} className="w-24 h-24 object-cover" />
                <div>
                  <div className="font-serif text-xl">{i.name}</div>
                  <div className="text-noir-muted text-sm mt-1">${i.price.toFixed(2)}</div>
                  <div className="mt-3 flex items-center border border-noir-border w-fit">
                    <button data-testid={`cart-minus-${i.product_id}`} onClick={() => setQty(i.product_id, i.quantity - 1)} className="px-3 py-2 hover:text-noir-gold"><Minus className="w-3 h-3" /></button>
                    <span className="px-4 text-sm">{i.quantity}</span>
                    <button data-testid={`cart-plus-${i.product_id}`} onClick={() => setQty(i.product_id, i.quantity + 1)} className="px-3 py-2 hover:text-noir-gold"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-xl text-noir-gold">${(i.price * i.quantity).toFixed(2)}</div>
                  <button data-testid={`cart-remove-${i.product_id}`} onClick={() => remove(i.product_id)} className="mt-3 text-noir-muted hover:text-noir-rust"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <button data-testid="cart-clear-btn" onClick={clear} className="mt-8 text-[10px] tracking-luxe uppercase text-noir-muted hover:text-noir-rust">Clear all</button>
        </div>

        <aside className="lg:sticky lg:top-32 h-fit border border-noir-border p-8 bg-noir-bg2">
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— Summary</div>
          <div className="flex gap-2 mb-6">
            <input
              data-testid="coupon-input"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 bg-transparent border-b border-noir-border py-2 outline-none focus:border-noir-gold text-sm"
            />
            <button data-testid="coupon-apply-btn" onClick={applyCoupon} className="text-[10px] tracking-luxe uppercase text-noir-gold hover:text-noir-champagne">Apply</button>
          </div>
          {totals && (
            <div className="space-y-3 text-sm">
              <Row label="Subtotal" value={totals.subtotal} />
              <Row label="Tax (8%)" value={totals.tax} />
              <Row label="Delivery" value={totals.delivery} />
              {totals.discount > 0 && <Row label={`Discount (${applied})`} value={-totals.discount} accent />}
              <div className="border-t border-noir-border pt-4 mt-4 flex justify-between font-serif text-2xl">
                <span>Total</span>
                <span data-testid="cart-total" className="text-noir-gold">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button
            data-testid="cart-checkout-btn"
            onClick={() => navigate("/checkout", { state: { coupon: applied } })}
            className="w-full mt-8 bg-noir-gold text-noir-bg py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-noir-text2">{label}</span>
      <span className={accent ? "text-noir-gold" : ""}>{value < 0 ? "-" : ""}${Math.abs(value).toFixed(2)}</span>
    </div>
  );
}
