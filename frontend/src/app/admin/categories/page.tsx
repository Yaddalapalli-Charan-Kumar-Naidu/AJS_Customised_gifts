"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    banner: null as File | null,
    bannerUrl: "",
    image: null as File | null,
    imageUrl: "",
    sortOrder: 0,
    isVisible: true
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/admin/all");
      setCategories(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditingCategory(cat);
      setForm({
        name: cat.name,
        description: cat.description || "",
        banner: null,
        bannerUrl: cat.banner?.url || "",
        image: null,
        imageUrl: cat.image?.url || "",
        sortOrder: cat.sortOrder || 0,
        isVisible: cat.isVisible !== undefined ? cat.isVisible : true
      });
    } else {
      setEditingCategory(null);
      setForm({ name: "", description: "", banner: null, bannerUrl: "", image: null, imageUrl: "", sortOrder: 0, isVisible: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("sortOrder", String(form.sortOrder));
    formData.append("isVisible", String(form.isVisible));
    if (form.banner) formData.append("banner", form.banner);
    if (form.image) formData.append("image", form.image);

    try {
      if (editingCategory) {
        await api.put(`/categories/admin/${editingCategory._id}`, formData);
        toast.success("Category updated! Refresh the homepage to see changes. ✨");
      } else {
        await api.post("/categories/admin", formData);
        toast.success("Category created!");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/admin/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Organize your products into beautiful collections.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-luxury transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Category
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-lg w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((cat: any) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 relative">
                          <Image src={cat.image?.url || cat.banner?.url || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100"} alt={cat.name} fill className="object-cover" />
                        </div>
                        <span className="font-semibold text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cat.sortOrder || 0}</td>
                    <td className="px-6 py-4">
                      {cat.isVisible ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-pink-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-gray-900">{editingCategory ? "Edit Category" : "New Category"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      required 
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all" 
                      placeholder="e.g. Gift Hampers"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all resize-none" 
                      placeholder="Brief description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input 
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all" 
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${form.isVisible ? "bg-pink-600" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.isVisible ? "left-5.5" : "left-0.5"}`} />
                    </button>
                    <span className="text-sm text-gray-600">Visible</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Square Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Category Image (Square)</label>
                    <label className="block aspect-square relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-pink-300 transition-colors cursor-pointer group">
                      {form.imageUrl || form.image ? (
                        <Image src={form.image ? URL.createObjectURL(form.image) : form.imageUrl} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <Upload className="w-8 h-8 text-gray-300 group-hover:text-pink-400 transition-colors mb-2" />
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Upload Square</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
                    </label>
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Banner Image (Wide)</label>
                    <label className="block aspect-square relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-pink-300 transition-colors cursor-pointer group">
                      {form.bannerUrl || form.banner ? (
                        <Image src={form.banner ? URL.createObjectURL(form.banner) : form.bannerUrl} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-pink-400 transition-colors mb-2" />
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Upload Banner</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setForm({ ...form, banner: e.target.files?.[0] || null })} />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-all shadow-luxury"
                  >
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
