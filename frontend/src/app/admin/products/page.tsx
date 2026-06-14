"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit, Trash2, X, Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { token } = useAuthStore();

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products?limit=100"),
        api.get("/categories/admin/all")
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/admin/${id}`);
      toast.success("Product deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleOpenModal = (product: any = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden relative border border-gray-100 bg-gray-50">
                          {product.images?.[0]?.url ? (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 absolute inset-0 m-auto text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 max-w-[200px] truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{formatPrice(product.discountPrice || product.price)}</div>
                      {product.discountPrice && <div className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {product.isOutOfStock ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Out of Stock</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
        categories={categories}
        refreshData={fetchData}
        token={token}
      />
    </div>
  );
}

// Product Modal Component
function ProductModal({ isOpen, onClose, product, categories, refreshData, token }: any) {
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", discountPrice: "", category: "",
    isFeatured: false, isTrending: false, isBestSeller: false, isOutOfStock: false
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name, description: product.description, price: product.price,
        discountPrice: product.discountPrice || "", category: product.category?._id || "",
        isFeatured: product.isFeatured || false, isTrending: product.isTrending || false,
        isBestSeller: product.isBestSeller || false, isOutOfStock: product.isOutOfStock || false
      });
    } else {
      setFormData({
        name: "", description: "", price: "", discountPrice: "", category: categories[0]?._id || "",
        isFeatured: false, isTrending: false, isBestSeller: false, isOutOfStock: false
      });
    }
    setImages([]);
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "") data.append(key, String(value));
    });
    images.forEach(img => data.append("images", img));

    try {
      if (product) {
        await api.put(`/products/admin/${product._id}`, data);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products/admin", data);
        toast.success("Product created successfully");
      }
      refreshData();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-300" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-300" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) *</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-300" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
              <input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-300" required>
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => {
                if (e.target.files) setImages(Array.from(e.target.files));
              }} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 border border-gray-200 rounded-lg p-1.5" />
              {product && product.images?.length > 0 && images.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">Currently has {product.images.length} images. Uploading new ones will replace them.</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Product Badges & Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="rounded text-pink-600 focus:ring-pink-500" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} className="rounded text-pink-600 focus:ring-pink-500" />
                Trending
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="rounded text-pink-600 focus:ring-pink-500" />
                Best Seller
              </label>
              <label className="flex items-center gap-2 text-sm text-red-600 font-medium cursor-pointer">
                <input type="checkbox" checked={formData.isOutOfStock} onChange={e => setFormData({...formData, isOutOfStock: e.target.checked})} className="rounded text-red-600 focus:ring-red-500" />
                Out of Stock
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
