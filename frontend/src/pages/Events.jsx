import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";

export default function Events() {
  const [f, setF] = useState({
    name: "", email: "", phone: "", date: "", time: "19:00",
    guests: 2, occasion: "", notes: "",
  });
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reservations", { ...f, guests: Number(f.guests) });
      toast.success("Reservation received. We'll confirm shortly.");
      setF({ name: "", email: "", phone: "", date: "", time: "19:00", guests: 2, occasion: "", notes: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Please review your details.");
    }
  };

  return (
    <div data-testid="events-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Reserve</div>
          <h1 className="font-serif text-5xl md:text-7xl">A quiet <span className="italic text-noir-champagne">table.</span></h1>
          <p className="mt-8 text-noir-text2 max-w-md">Private tastings, seasonal events, or a corner just for the two of you. Tell us the occasion.</p>
          <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=85" alt="Table" className="mt-12 aspect-[4/5] object-cover w-full" />
        </div>
        <form onSubmit={submit} className="space-y-8" data-testid="reservation-form">
          <Field label="Full name" value={f.name} onChange={upd("name")} required testid="res-name" />
          <Field label="Email" type="email" value={f.email} onChange={upd("email")} required testid="res-email" />
          <Field label="Phone" value={f.phone} onChange={upd("phone")} required testid="res-phone" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Date" type="date" value={f.date} onChange={upd("date")} required testid="res-date" />
            <Field label="Time" type="time" value={f.time} onChange={upd("time")} required testid="res-time" />
            <Field label="Guests" type="number" value={f.guests} onChange={upd("guests")} required testid="res-guests" />
          </div>
          <Field label="Occasion (optional)" value={f.occasion} onChange={upd("occasion")} testid="res-occasion" />
          <label className="block">
            <span className="text-[10px] tracking-luxe uppercase text-noir-muted">Notes</span>
            <textarea
              data-testid="res-notes"
              value={f.notes}
              onChange={upd("notes")}
              rows={4}
              className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold py-3 outline-none mt-1 resize-none"
            />
          </label>
          <button data-testid="res-submit" type="submit" className="bg-noir-gold text-noir-bg px-10 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne">
            Reserve
          </button>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, type = "text", required, testid }) => (
  <label className="block">
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
