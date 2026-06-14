"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Image as ImageIcon, Upload, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    image: null as File | null,
    isVisible: true
  });

  const fetchGallery = async () => {
    try {
      const res = await api.get("/site/gallery");
      setImages(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("image", form.image);
    formData.append("isVisible", String(form.isVisible));

    try {
      await api.post("/site/gallery/admin", formData);
      toast.success("Image uploaded to gallery! ✨");
      setIsModalOpen(false);
      setForm({ title: "", image: null, isVisible: true });
      fetchGallery();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from gallery?")) return;
    try {
      await api.delete(`/site/gallery/admin/${id}`);
      toast.success("Image removed");
      fetchGallery();
    } catch (err) {
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Gallery Portfolio</h1>
          <p className="text-gray-500">Showcase your customized creations to build customer trust.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-luxury transition-all"
        >
          <Plus className="w-5 h-5" /> Add Gallery Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse" />
          ))
        ) : images.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">Gallery is empty. Start by uploading your work!</p>
          </div>
        ) : (
          images.map((img: any) => (
            <motion.div 
              layout
              key={img._id}
              className="group relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
            >
              <Image src={img.url} alt={img.title || "Gallery Item"} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium truncate mb-2">{img.title || "Untitled Work"}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(img._id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500 backdrop-blur-md text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1" />
                  <div className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg">
                    {img.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-gray-900">Upload to Gallery</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title / Caption</label>
                  <input 
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-400 transition-all" 
                    placeholder="e.g. Wedding Gift Set"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
                  <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group">
                    {form.image ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-2">
                          <Image src={URL.createObjectURL(form.image)} alt="Preview" fill className="object-cover" />
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{form.image.name}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-gray-300 mb-2 group-hover:text-pink-400 transition-colors" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.isVisible ? "bg-pink-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.isVisible ? "left-5.5" : "left-0.5"}`} />
                  </button>
                  <span className="text-sm text-gray-600">Visible on portfolio page</span>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isUploading || !form.image}
                    className="flex-1 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-all shadow-luxury disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Add to Gallery"}
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
