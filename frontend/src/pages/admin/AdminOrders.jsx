import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, authHeader } from "../../lib/api";

const STATUSES = ["pending", "payment_processing", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/admin/orders", { headers: authHeader() }).then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status }, { headers: authHeader() });
      toast.success("Updated");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div data-testid="admin-orders">
      <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Kitchen</div>
      <h1 className="font-serif text-4xl mb-10">Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <div className="text-noir-muted">No orders yet.</div>}
        {orders.map((o) => (
          <div key={o.id} data-testid={`order-row-${o.order_number}`} className="border border-noir-border bg-noir-bg2 p-6 grid md:grid-cols-4 gap-6 items-center">
            <div>
              <div className="font-serif text-xl">{o.order_number}</div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mt-1">{o.customer.full_name}</div>
              <div className="text-noir-text2 text-xs">{o.customer.email}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Items</div>
              <div className="text-sm text-noir-text2">{o.items.length} item(s)</div>
              <div className="font-serif text-lg text-noir-gold">${o.totals.total.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Payment</div>
              <div className={`text-sm ${o.payment_status === "paid" ? "text-noir-gold" : "text-noir-rust"}`}>{o.payment_status?.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Status</div>
              <select data-testid={`status-${o.order_number}`} value={o.status} onChange={(e) => update(o.id, e.target.value)} className="w-full bg-transparent border border-noir-border py-2 px-2 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
