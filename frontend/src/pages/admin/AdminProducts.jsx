import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { api, authHeader } from "../../lib/api";

const empty = {
  name: "", category: "coffee", price: 0, description: "",
  ingredients: [], allergens: [], calories: null, dietary: [],
  image: "", gallery: [], featured: false, active: true,
};

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/products").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...editing,
      price: parseFloat(editing.price),
      calories: editing.calories ? parseInt(editing.calories) : null,
      ingredients: typeof editing.ingredients === "string" ? editing.ingredients.split(",").map((x) => x.trim()).filter(Boolean) : editing.ingredients,
      allergens: typeof editing.allergens === "string" ? editing.allergens.split(",").map((x) => x.trim()).filter(Boolean) : editing.allergens,
      dietary: typeof editing.dietary === "string" ? editing.dietary.split(",").map((x) => x.trim()).filter(Boolean) : editing.dietary,
    };
    try {
      if (editing.id) {
        await api.put(`/admin/products/${editing.id}`, body, { headers: authHeader() });
      } else {
        await api.post("/admin/products", body, { headers: authHeader() });
      }
      toast.success("Saved");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await api.delete(`/admin/products/${id}`, { headers: authHeader() });
    load();
  };

  return (
    <div data-testid="admin-products">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[10px] tracking-luxe uppercase text-noir-gold mb-4">— Menu</div>
          <h1 className="font-serif text-4xl">Products</h1>
        </div>
        <button data-testid="admin-add-product" onClick={() => setEditing({ ...empty })} className="bg-noir-gold text-noir-bg px-6 py-3 text-[10px] tracking-luxe uppercase inline-flex items-center gap-2 hover:bg-noir-champagne">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <div className="border border-noir-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-noir-bg2 text-[10px] tracking-luxe uppercase text-noir-muted">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Featured</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} data-testid={`admin-product-row-${p.slug}`} className="border-t border-noir-border">
                <td className="p-4 flex items-center gap-4">
                  <img src={p.image} alt={p.name} className="w-14 h-14 object-cover" />
                  <span className="font-serif text-lg">{p.name}</span>
                </td>
                <td className="p-4 text-noir-text2">{p.category}</td>
                <td className="p-4 text-noir-gold">${p.price.toFixed(2)}</td>
                <td className="p-4 text-noir-text2">{p.featured ? "Yes" : "—"}</td>
                <td className="p-4 flex gap-3 justify-end">
                  <button data-testid={`edit-${p.slug}`} onClick={() => setEditing({ ...p, ingredients: p.ingredients.join(", "), allergens: p.allergens.join(", "), dietary: p.dietary.join(", ") })} className="text-noir-text2 hover:text-noir-gold"><Pencil className="w-4 h-4" /></button>
                  <button data-testid={`delete-${p.slug}`} onClick={() => del(p.id)} className="text-noir-text2 hover:text-noir-rust"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-noir-bg/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={save} className="bg-noir-bg2 border border-noir-border p-8 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-8">
              <div className="font-serif text-2xl">{editing.id ? "Edit" : "Add"} product</div>
              <button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <F label="Name" v={editing.name} on={(v) => setEditing({ ...editing, name: v })} required />
              <label className="block">
                <span className="text-[10px] tracking-luxe uppercase text-noir-muted">Category</span>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full bg-transparent border-b border-noir-border py-3 outline-none mt-1">
                  {["coffee","brunch","desserts","cold_drinks","signature"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <F label="Price" type="number" step="0.01" v={editing.price} on={(v) => setEditing({ ...editing, price: v })} required />
              <F label="Calories" type="number" v={editing.calories || ""} on={(v) => setEditing({ ...editing, calories: v })} />
              <F label="Image URL" v={editing.image} on={(v) => setEditing({ ...editing, image: v })} required full />
              <F label="Description" v={editing.description} on={(v) => setEditing({ ...editing, description: v })} required full />
              <F label="Ingredients (comma-separated)" v={editing.ingredients} on={(v) => setEditing({ ...editing, ingredients: v })} full />
              <F label="Allergens (comma-separated)" v={editing.allergens} on={(v) => setEditing({ ...editing, allergens: v })} full />
              <F label="Dietary tags" v={editing.dietary} on={(v) => setEditing({ ...editing, dietary: v })} full />
              <label className="flex items-center gap-3 col-span-2">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                <span className="text-sm">Featured on homepage</span>
              </label>
            </div>
            <button data-testid="admin-save-product" type="submit" className="mt-8 w-full bg-noir-gold text-noir-bg py-4 text-[11px] tracking-luxe uppercase hover:bg-noir-champagne">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}

const F = ({ label, v, on, type = "text", step, required, full }) => (
  <label className={`block ${full ? "col-span-2" : ""}`}>
    <span className="text-[10px] tracking-luxe uppercase text-noir-muted">{label}</span>
    <input type={type} step={step} value={v ?? ""} onChange={(e) => on(e.target.value)} required={required} className="w-full bg-transparent border-b border-noir-border focus:border-noir-gold py-3 outline-none mt-1" />
  </label>
);
