"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Upload, Check, ImageIcon, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function AdminPaymentsPage() {
  const [qrcodes, setQrcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQR, setEditingQR] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    paymentMethod: "upi",
    upiId: "",
    description: "",
    image: null as File | null,
    imageUrl: "",
    isActive: true,
    sortOrder: 0
  });

  const fetchQRCodes = async () => {
    try {
      const res = await api.get("/qrcodes/admin/all");
      setQrcodes(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleOpenModal = (qr: any = null) => {
    if (qr) {
      setEditingQR(qr);
      setForm({
        name: qr.name,
        paymentMethod: qr.paymentMethod,
        upiId: qr.upiId || "",
        description: qr.description || "",
        image: null,
        imageUrl: qr.image?.url || "",
        isActive: qr.isActive,
        sortOrder: qr.sortOrder || 0
      });
    } else {
      setEditingQR(null);
      setForm({
        name: "",
        paymentMethod: "upi",
        upiId: "",
        description: "",
        image: null,
        imageUrl: "",
        isActive: true,
        sortOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("paymentMethod", form.paymentMethod);
    formData.append("upiId", form.upiId);
    formData.append("description", form.description);
    formData.append("isActive", String(form.isActive));
    formData.append("sortOrder", String(form.sortOrder));
    if (form.image) formData.append("image", form.image);

    try {
      if (editingQR) {
        await api.put(`/qrcodes/admin/${editingQR._id}`, formData);
        toast.success("QR Code updated! 🚀");
      } else {
        await api.post("/qrcodes/admin", formData);
        toast.success("New QR Code added!");
      }
      setIsModalOpen(false);
      fetchQRCodes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove this payment method.")) return;
    try {
      await api.delete(`/qrcodes/admin/${id}`);
      toast.success("QR Code deleted");
      fetchQRCodes();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/qrcodes/admin/${id}/toggle`);
      fetchQRCodes();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const filtered = qrcodes.filter((q: any) => 
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Payment QR Codes</h1>
          <p className="text-gray-500">Manage the QR codes shown to customers during checkout.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-luxury transition-all"
        >
          <Plus className="w-5 h-5" /> Add Payment Method
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search payment methods..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">UPI ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-12 bg-gray-100 rounded-lg w-40" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No QR codes configured.</td>
                </tr>
              ) : (
                filtered.map((qr: any) => (
                  <tr key={qr._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative group-hover:scale-110 transition-transform">
                          <Image src={qr.image?.url || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example"} alt={qr.name} fill className="object-contain p-1" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{qr.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{qr.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{qr.upiId || "N/A"}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(qr._id)}
                        className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium transition-colors ${
                          qr.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${qr.isActive ? "bg-green-600" : "bg-gray-400"}`} />
                        {qr.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{qr.sortOrder || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(qr)} className="p-2 text-gray-400 hover:text-pink-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(qr._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                      <QrCode className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-display font-bold text-gray-900">{editingQR ? "Edit QR Code" : "Add QR Code"}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input 
                      required 
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all" 
                      placeholder="e.g. Google Pay (AJS Gifts)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method Type</label>
                    <select 
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all bg-white"
                    >
                      <option value="upi">Generic UPI</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="googlepay">Google Pay</option>
                      <option value="paytm">PayTM</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input 
                      value={form.upiId}
                      onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all font-mono" 
                      placeholder="e.g. name@upi"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (shown to customer)</label>
                    <textarea 
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all resize-none" 
                      placeholder="e.g. Scan to pay via any UPI app"
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
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-green-600" : "bg-gray-200"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.isActive ? "left-5.5" : "left-0.5"}`} />
                    </button>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Image</label>
                  <label className="block relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-pink-300 transition-colors cursor-pointer group bg-gray-50">
                    {form.imageUrl || form.image ? (
                      <div className="relative aspect-square max-w-[200px] mx-auto my-4 rounded-xl overflow-hidden shadow-lg border border-white">
                        <Image src={form.image ? URL.createObjectURL(form.image) : form.imageUrl} alt="QR Preview" fill className="object-contain p-2 bg-white" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <ImageIcon className="w-12 h-12 text-gray-300 group-hover:text-pink-400 transition-colors mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload QR Code image</p>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Supports JPG, PNG, WEBP</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
                  </label>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-all shadow-luxury"
                  >
                    {editingQR ? "Update QR Code" : "Create QR Code"}
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
