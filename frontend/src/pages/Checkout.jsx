import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

export default function Checkout() {
  const { items, clear } = useCart();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [totals, setTotals] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    delivery_type: "delivery", address: "", city: "", postal_code: "", instructions: "",
  });

  useEffect(() => {
    if (items.length === 0) { navigate("/cart"); return; }
    api.post("/cart/totals", { items, coupon: state?.coupon || undefined })
      .then((r) => setTotals(r.data.totals));
  }, [items, state, navigate]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/checkout/session", {
        items,
        customer: { full_name: form.full_name, email: form.email, phone: form.phone },
        delivery: {
          type: form.delivery_type,
          address: form.address, city: form.city, postal_code: form.postal_code,
          instructions: form.instructions,
        },
        coupon: state?.coupon,
        origin_url: window.location.origin,
      });
      localStorage.setItem("nb_last_order", data.order_number);
      clear();
      window.location.href = data.checkout_url;
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Checkout failed");
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="checkout-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-16">
        <form onSubmit={submit} className="lg:col-span-2 space-y-12">
          <div>
            <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Step 01</div>
            <h1 className="font-serif text-5xl md:text-6xl">Checkout</h1>
          </div>

          <Section title="Contact">
            <Field label="Full name" value={form.full_name} onChange={update("full_name")} required testid="co-name" />
            <Field label="Email" type="email" value={form.email} onChange={update("email")} required testid="co-email" />
            <Field label="Phone" value={form.phone} onChange={update("phone")} required testid="co-phone" />
          </Section>

          <Section title="Delivery">
            <div className="col-span-2 flex gap-4 mb-4">
              {["delivery", "pickup"].map((t) => (
                <button
                  key={t}
                  type="button"
                  data-testid={`delivery-type-${t}`}
                  onClick={() => setForm({ ...form, delivery_type: t })}
                  className={`px-6 py-3 text-[10px] tracking-luxe uppercase border ${
                    form.delivery_type === t ? "bg-noir-gold text-noir-bg border-noir-gold" : "border-noir-border text-noir-text2 hover:border-noir-gold"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.delivery_type === "delivery" && (
              <>
                <Field label="Address" value={form.address} onChange={update("address")} required testid="co-address" full />
                <Field label="City" value={form.city} onChange={update("city")} required testid="co-city" />
                <Field label="Postal code" value={form.postal_code} onChange={update("postal_code")} required testid="co-postal" />
              </>
            )}
            <Field label="Special instructions (optional)" value={form.instructions} onChange={update("instructions")} testid="co-instructions" full />
          </Section>

          <button
            data-testid="checkout-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full bg-noir-gold text-noir-bg py-5 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne disabled:opacity-60"
          >
            {submitting ? "Redirecting to Stripe…" : "Pay Securely with Stripe"}
          </button>
        </form>

        <aside className="lg:sticky lg:top-32 h-fit border border-noir-border p-8 bg-noir-bg2">
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-6">— Order summary</div>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between text-sm">
                <span className="text-noir-text2">{i.name} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {totals && (
            <div className="mt-6 space-y-2 border-t border-noir-border pt-4 text-sm">
              <Row label="Subtotal" v={totals.subtotal} />
              <Row label="Tax" v={totals.tax} />
              <Row label="Delivery" v={totals.delivery} />
              {totals.discount > 0 && <Row label="Discount" v={-totals.discount} accent />}
              <div className="border-t border-noir-border pt-3 mt-3 flex justify-between font-serif text-2xl">
                <span>Total</span>
                <span data-testid="checkout-total" className="text-noir-gold">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div>
    <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-6">{title}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, type = "text", required, testid, full }) => (
  <label className={`block ${full ? "md:col-span-2" : ""}`}>
    <span className="text-[10px] tracking-luxe uppercase text-noir-muted">{label}</span>
    <input
      data-testid={testid}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold py-3 outline-none mt-1"
    />
  </label>
);

const Row = ({ label, v, accent }) => (
  <div className="flex justify-between">
    <span className="text-noir-text2">{label}</span>
    <span className={accent ? "text-noir-gold" : ""}>{v < 0 ? "-" : ""}${Math.abs(v).toFixed(2)}</span>
  </div>
);
