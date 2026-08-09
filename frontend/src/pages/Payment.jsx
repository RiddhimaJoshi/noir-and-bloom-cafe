import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const sid = params.get("session_id");
  const [status, setStatus] = useState("polling");
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    if (!sid) return;
    let tries = 0;
    let timer;
    const poll = async () => {
      tries++;
      try {
        const { data } = await api.get(`/payments/status/${sid}`);
        if (data.payment_status === "paid") {
          setStatus("paid");
          setOrderNumber(data.order_number || localStorage.getItem("nb_last_order"));
          return;
        }
        if (data.payment_status === "failed" || data.payment_status === "expired") {
          setStatus("failed");
          return;
        }
        if (tries >= 10) { setStatus("timeout"); return; }
        timer = setTimeout(poll, 2000);
      } catch {
        if (tries >= 10) setStatus("timeout");
        else timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [sid]);

  return (
    <div data-testid="payment-success-page" className="min-h-screen pt-40 pb-24 px-6 flex flex-col items-center justify-center text-center">
      {status === "polling" && (
        <>
          <Loader2 className="w-12 h-12 text-noir-gold animate-spin mb-8" />
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Confirming your payment</div>
          <h1 className="font-serif text-4xl md:text-6xl">One moment, please.</h1>
        </>
      )}
      {status === "paid" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-noir-gold mb-8" />
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Confirmed</div>
          <h1 className="font-serif text-5xl md:text-7xl">Thank you.</h1>
          <p className="mt-6 text-noir-text2 max-w-md">Your ritual is being prepared. We've sent a confirmation to your email.</p>
          {orderNumber && (
            <div className="mt-8">
              <div className="text-[10px] tracking-luxe uppercase text-noir-muted mb-2">Order number</div>
              <div data-testid="success-order-number" className="font-serif text-3xl text-noir-champagne">{orderNumber}</div>
            </div>
          )}
          <div className="mt-10 flex gap-4">
            {orderNumber && (
              <Link to={`/track/${orderNumber}`} data-testid="track-order-btn" className="bg-noir-gold text-noir-bg px-8 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne">Track order</Link>
            )}
            <Link to="/menu" className="border border-noir-border px-8 py-4 text-[11px] tracking-luxe uppercase hover:border-noir-gold hover:text-noir-gold">Order again</Link>
          </div>
        </>
      )}
      {(status === "failed" || status === "timeout") && (
        <>
          <XCircle className="w-16 h-16 text-noir-rust mb-8" />
          <h1 className="font-serif text-5xl">{status === "failed" ? "Payment could not be completed." : "Still waiting on confirmation."}</h1>
          <Link to="/cart" className="mt-8 border border-noir-border px-8 py-4 text-[11px] tracking-luxe uppercase hover:border-noir-gold">Return to cart</Link>
        </>
      )}
    </div>
  );
}

export function PaymentCancel() {
  return (
    <div data-testid="payment-cancel-page" className="min-h-screen pt-40 pb-24 px-6 flex flex-col items-center justify-center text-center">
      <XCircle className="w-16 h-16 text-noir-rust mb-8" />
      <h1 className="font-serif text-5xl md:text-7xl">Payment cancelled.</h1>
      <p className="mt-6 text-noir-text2 max-w-md">Your bag is still waiting — nothing has been charged.</p>
      <Link to="/cart" className="mt-10 bg-noir-gold text-noir-bg px-10 py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne">Return to cart</Link>
    </div>
  );
}
