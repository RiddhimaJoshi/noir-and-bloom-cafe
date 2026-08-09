import React from "react";
import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Calendar, MessageSquare } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("nb_admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    localStorage.removeItem("nb_admin_token");
    localStorage.removeItem("nb_admin_email");
    navigate("/admin/login");
  };

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/contacts", label: "Contacts", icon: MessageSquare },
    { to: "/admin/reservations", label: "Reservations", icon: Calendar },
  ];

  return (
    <div data-testid="admin-layout" className="min-h-screen bg-noir-bg pt-20 flex">
      <aside className="w-64 shrink-0 border-r border-noir-border p-6 hidden md:block sticky top-20 h-[calc(100vh-5rem)]">
        <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-8">— Atelier</div>
        <nav className="space-y-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              data-testid={`admin-nav-${l.label.toLowerCase()}`}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors ${isActive ? "bg-noir-bg2 text-noir-gold border-l-2 border-noir-gold" : "text-noir-text2 hover:text-noir-gold"}`}
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </NavLink>
          ))}
          <button data-testid="admin-logout" onClick={logout} className="flex items-center gap-3 px-4 py-3 text-sm text-noir-muted hover:text-noir-rust mt-8">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12"><Outlet /></main>
    </div>
  );
}
