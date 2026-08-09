import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { api } from "../lib/api";

const STAGES = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = () => api.get(`/orders/${orderNumber}`).then((r) => setOrder(r.data)).catch(() => setOrder(false));
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [orderNumber]);

  if (order === false) return <div className="pt-40 text-center text-noir-muted">Order not found.</div>;
  if (!order) return <div className="pt-40 text-center text-noir-muted">Loading…</div>;

  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === order.status));

  return (
    <div data-testid="tracking-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Order tracking</div>
        <div className="flex justify-between items-end mb-4">
          <h1 data-testid="order-number" className="font-serif text-5xl md:text-7xl">{order.order_number}</h1>
          <div className="text-right">
            <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Payment</div>
            <div className={`text-sm ${order.payment_status === "paid" ? "text-noir-gold" : "text-noir-rust"}`}>
              {order.payment_status?.toUpperCase()}
            </div>
          </div>
        </div>
        <p className="text-noir-text2">Estimated: {order.delivery?.type === "pickup" ? "20 minutes" : "45 minutes"}</p>

        <div className="mt-16 border border-noir-border p-8 md:p-12 bg-noir-bg2">
          <div className="space-y-8">
            {STAGES.map((s, i) => {
              const done = i <= currentIdx && order.payment_status === "paid";
              const active = i === currentIdx && order.payment_status === "paid";
              return (
                <div key={s.key} data-testid={`stage-${s.key}`} className="flex items-center gap-6">
                  <div className={`w-10 h-10 flex items-center justify-center border ${done ? "bg-noir-gold border-noir-gold text-noir-bg" : "border-noir-border text-noir-muted"}`}>
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className={`font-serif text-2xl ${done ? "text-noir-text" : "text-noir-muted"} ${active ? "text-noir-gold" : ""}`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="border border-noir-border p-6">
            <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-4">Items</div>
            {order.items.map((i, k) => (
              <div key={k} className="flex justify-between text-sm py-2">
                <span>{i.name} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-noir-border flex justify-between font-serif text-xl">
              <span>Total</span>
              <span className="text-noir-gold">${order.totals.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="border border-noir-border p-6">
            <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-4">Customer</div>
            <div className="text-sm space-y-1">
              <div>{order.customer.full_name}</div>
              <div className="text-noir-text2">{order.customer.email}</div>
              <div className="text-noir-text2">{order.customer.phone}</div>
              {order.delivery.address && <div className="text-noir-text2 mt-4">{order.delivery.address}, {order.delivery.city}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
