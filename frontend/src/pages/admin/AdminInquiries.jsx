import React, { useEffect, useState } from "react";
import { api, authHeader } from "../../lib/api";

export function AdminContacts() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/contacts", { headers: authHeader() }).then((r) => setRows(r.data)); }, []);
  return (
    <div data-testid="admin-contacts">
      <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Inbox</div>
      <h1 className="font-serif text-4xl mb-10">Contact inquiries</h1>
      <div className="space-y-4">
        {rows.length === 0 && <div className="text-noir-muted">No inquiries yet.</div>}
        {rows.map((c) => (
          <div key={c.id} className="border border-noir-border bg-noir-bg2 p-6">
            <div className="flex justify-between mb-2">
              <div className="font-serif text-xl">{c.name}</div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted">{new Date(c.created_at).toLocaleString()}</div>
            </div>
            <div className="text-noir-text2 text-sm mb-3">{c.email} · {c.phone || "—"}</div>
            <p className="text-noir-text2">{c.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReservations() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/reservations", { headers: authHeader() }).then((r) => setRows(r.data)); }, []);
  return (
    <div data-testid="admin-reservations">
      <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Book</div>
      <h1 className="font-serif text-4xl mb-10">Reservations</h1>
      <div className="space-y-4">
        {rows.length === 0 && <div className="text-noir-muted">No reservations yet.</div>}
        {rows.map((r) => (
          <div key={r.id} className="border border-noir-border bg-noir-bg2 p-6 grid md:grid-cols-4 gap-4">
            <div>
              <div className="font-serif text-xl">{r.name}</div>
              <div className="text-noir-text2 text-xs">{r.email}</div>
              <div className="text-noir-text2 text-xs">{r.phone}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Date · Time</div>
              <div className="text-sm">{r.date} · {r.time}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Guests</div>
              <div className="text-sm">{r.guests}</div>
              <div className="text-noir-text2 text-xs mt-1">{r.occasion}</div>
            </div>
            <div className="text-noir-text2 text-sm">{r.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
