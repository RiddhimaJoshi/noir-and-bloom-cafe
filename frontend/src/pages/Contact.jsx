import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/contact", f);
      setSent(true);
      setF({ name: "", email: "", phone: "", message: "" });
      toast.success("Message received. We'll respond within one business day.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div data-testid="contact-page" className="pt-32 pb-24 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Say hello</div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05]">Let's <span className="italic text-noir-champagne">talk.</span></h1>
          <p className="mt-8 text-noir-text2 max-w-md">Private events, press inquiries, or a simple thank-you note — we read every message.</p>
          <div className="mt-16 space-y-6 text-noir-text2">
            <div><div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Press</div>press@noirandbloom.com</div>
            <div><div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Careers</div>careers@noirandbloom.com</div>
            <div><div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-1">Guest care</div>hello@noirandbloom.com</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-8" data-testid="contact-form">
          <Field label="Name" value={f.name} onChange={upd("name")} required testid="contact-name" />
          <Field label="Email" type="email" value={f.email} onChange={upd("email")} required testid="contact-email" />
          <Field label="Phone" value={f.phone} onChange={upd("phone")} testid="contact-phone" />
          <label className="block">
            <span className="text-[10px] tracking-luxe uppercase text-noir-muted">Message</span>
            <textarea
              data-testid="contact-message"
              value={f.message}
              onChange={upd("message")}
              required
              rows={5}
              className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold py-3 outline-none mt-1 resize-none"
            />
          </label>
          <button
            data-testid="contact-submit"
            type="submit"
            className="bg-noir-gold text-noir-bg px-10 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne"
          >
            {sent ? "Message sent" : "Send message"}
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
