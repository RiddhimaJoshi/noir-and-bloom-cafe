import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Lenis from "lenis";
import "./App.css";

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { PaymentSuccess, PaymentCancel } from "./pages/Payment";
import OrderTracking from "./pages/OrderTracking";
import About from "./pages/About";
import Locations from "./pages/Locations";
import Contact from "./pages/Contact";
import Events from "./pages/Events";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import { AdminContacts, AdminReservations } from "./pages/admin/AdminInquiries";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function LenisProvider({ children }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let rafId;
    function raf(time) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);
  return children;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navigation />
      <main className="relative z-10">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <LenisProvider>
          <CustomCursor />
          <Toaster position="top-center" theme="dark" toastOptions={{ style: { background: "#140F0C", color: "#F4EFE6", border: "1px solid #2A201A" } }} />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/menu" element={<PublicLayout><Menu /></PublicLayout>} />
            <Route path="/menu/:slug" element={<PublicLayout><ProductDetails /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/payment/success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
            <Route path="/payment/cancel" element={<PublicLayout><PaymentCancel /></PublicLayout>} />
            <Route path="/track/:orderNumber" element={<PublicLayout><OrderTracking /></PublicLayout>} />
            <Route path="/story" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/locations" element={<PublicLayout><Locations /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />

            <Route path="/admin/login" element={<><Navigation /><AdminLogin /></>} />
            <Route path="/admin" element={<><Navigation /><AdminLayout /></>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="reservations" element={<AdminReservations />} />
            </Route>

            <Route path="*" element={<PublicLayout><div className="pt-40 text-center"><h1 className="font-serif text-6xl">404</h1><p className="mt-4 text-noir-text2">This page has stepped out for espresso.</p></div></PublicLayout>} />
          </Routes>
        </LenisProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
