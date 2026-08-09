import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { api, authHeader } from "../../lib/api";

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/admin/stats", { headers: authHeader() }).then((r) => setS(r.data)); }, []);

  if (!s) return <div data-testid="admin-loading" className="text-noir-muted">Loading…</div>;

  const cards = [
    { k: "Total Revenue", v: `$${s.total_revenue.toFixed(2)}` },
    { k: "Today's Revenue", v: `$${s.today_revenue.toFixed(2)}` },
    { k: "Total Orders", v: s.total_orders },
    { k: "Today's Orders", v: s.today_orders },
    { k: "Pending", v: s.pending_orders },
    { k: "Completed", v: s.completed_orders },
    { k: "Avg Order Value", v: `$${s.avg_order_value.toFixed(2)}` },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Overview</div>
      <h1 className="font-serif text-4xl md:text-5xl mb-12">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {cards.map((c) => (
          <div key={c.k} className="border border-noir-border bg-noir-bg2 p-6">
            <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-2">{c.k}</div>
            <div className="font-serif text-3xl text-noir-text">{c.v}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-noir-border bg-noir-bg2 p-6">
          <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-4">Revenue · Last 7 days</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={s.timeline}>
              <CartesianGrid stroke="#2A201A" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8A8071" tick={{ fontSize: 10 }} />
              <YAxis stroke="#8A8071" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#140F0C", border: "1px solid #2A201A" }} />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-noir-border bg-noir-bg2 p-6">
          <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-4">Top products</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={s.top_products}>
              <CartesianGrid stroke="#2A201A" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#8A8071" tick={{ fontSize: 9 }} />
              <YAxis stroke="#8A8071" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#140F0C", border: "1px solid #2A201A" }} />
              <Bar dataKey="quantity" fill="#D4AF37" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
