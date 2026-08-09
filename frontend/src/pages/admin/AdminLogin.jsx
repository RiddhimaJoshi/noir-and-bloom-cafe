import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("nb_admin_token")) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin/login", { email, password });
      localStorage.setItem("nb_admin_token", data.token);
      localStorage.setItem("nb_admin_email", data.email);
      toast.success("Welcome back.");
      navigate("/admin");
    } catch {
      toast.error("Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center px-6 py-24">
      <form onSubmit={submit} className="w-full max-w-md border border-noir-border p-10 bg-noir-bg2">
        <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Atelier access</div>
        <h1 className="font-serif text-4xl mb-10">Admin</h1>
        <label className="block mb-6">
          <span className="text-[10px] tracking-luxe uppercase text-noir-muted">Email</span>
          <input data-testid="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold py-3 outline-none mt-1" />
        </label>
        <label className="block mb-10">
          <span className="text-[10px] tracking-luxe uppercase text-noir-muted">Password</span>
          <input data-testid="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold py-3 outline-none mt-1" />
        </label>
        <button data-testid="admin-login-btn" type="submit" disabled={loading} className="w-full bg-noir-gold text-noir-bg py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
