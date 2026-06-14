"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Filter, CheckCircle2, XCircle, FileImage, Truck, Package } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import { formatPrice, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  
  const { token } = useAuthStore();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/admin/all");
      setOrders(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const updateOrderStatus = async (status: string, additionalData: any = {}) => {
    setIsUpdating(true);
    try {
      const payload = { status, ...additionalData };
      await api.patch(`/orders/admin/${selectedOrder._id}/status`, payload);
      toast.success(`Order marked as ${status.replace("_", " ")}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Phone" 
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-pink-300 outline-none w-full sm:w-64"
            />
          </div>
          <button className="bg-white border border-gray-200 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Order Info</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">#{order.orderId}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{order.customer.name}</p>
                      <p className="text-xs text-gray-500">{order.customer.phone}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        order.status === "pending_payment" ? "bg-amber-50 text-amber-600" :
                        order.status === "pending_verification" ? "bg-purple-50 text-purple-600 border border-purple-200" :
                        order.status === "accepted" ? "bg-blue-50 text-blue-600" :
                        order.status === "shipped" ? "bg-indigo-50 text-indigo-600" :
                        order.status === "delivered" ? "bg-green-50 text-green-600" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {order.status === "pending_verification" && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { setSelectedOrder(order); setTrackingNumber(order.trackingNumber || ""); }}
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-800 font-medium text-xs bg-pink-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View / Action
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => !isUpdating && setSelectedOrder(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-10"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderId}</h2>
                  <p className="text-sm text-gray-500">Placed {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button onClick={() => !isUpdating && setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                {/* Left Col: Details */}
                <div className="flex-1 space-y-6">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Items ({selectedOrder.items.length})</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any) => (
                        <div key={item._id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} {item.variant && `| Variant: ${item.variant}`}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-sm text-gray-800 font-medium">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Delivery Address</p>
                      <p className="text-sm text-gray-800">{selectedOrder.deliveryAddress.street}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.pincode}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  {selectedOrder.specialInstructions && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Special Instructions</p>
                      <p className="text-sm text-gray-800">{selectedOrder.specialInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Right Col: Payment & Actions */}
                <div className="w-full lg:w-80 space-y-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Details</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatPrice(selectedOrder.deliveryCharge)}</span></div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total Paid</span><span className="text-pink-600">{formatPrice(selectedOrder.total)}</span></div>
                    </div>

                    {selectedOrder.payment?.screenshotUrl && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <FileImage className="w-3.5 h-3.5" /> Payment Proof
                        </p>
                        <a href={selectedOrder.payment.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                          <Image src={selectedOrder.payment.screenshotUrl} alt="Payment Proof" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium px-3 py-1 bg-black/50 rounded-full">View Full Image</span>
                          </div>
                        </a>
                        {selectedOrder.payment.utrNumber && (
                          <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded border border-gray-200">UTR: <span className="font-mono">{selectedOrder.payment.utrNumber}</span></p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Take Action</h3>
                    
                    {selectedOrder.status === "pending_verification" && (
                      <div className="flex gap-2">
                        <button onClick={() => updateOrderStatus("accepted")} disabled={isUpdating} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => updateOrderStatus("rejected")} disabled={isUpdating} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === "accepted" && (
                      <div className="space-y-2 border border-blue-100 bg-blue-50 p-4 rounded-xl">
                        <label className="text-xs font-semibold text-blue-800">Enter Tracking Number</label>
                        <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. DTDC1234567" className="w-full text-sm p-2 rounded border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400" />
                        <button onClick={() => updateOrderStatus("shipped", { trackingNumber })} disabled={isUpdating || !trackingNumber} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-50 mt-2">
                          <Truck className="w-4 h-4" /> Mark as Shipped
                        </button>
                      </div>
                    )}

                    {selectedOrder.status === "shipped" && (
                      <button onClick={() => updateOrderStatus("delivered")} disabled={isUpdating} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1">
                        <Package className="w-4 h-4" /> Mark as Delivered
                      </button>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-400 text-center">Note: Approving/Shipping automatically sends an email update to the customer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
