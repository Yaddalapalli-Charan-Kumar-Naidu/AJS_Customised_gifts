"use client";

import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function AdminBouquetRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/bouquets/admin/all");
      setRequests(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch bouquet requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/bouquets/admin/${id}/status`, { status: newStatus });
      toast.success("Status updated!");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'contacted': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'accepted': return 'badge-accepted';
      case 'rejected': return 'badge-rejected';
      case 'completed': return 'badge-delivered';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRequests = requests.filter((req: any) => 
    req.customerName.toLowerCase().includes(search.toLowerCase()) ||
    req.email.toLowerCase().includes(search.toLowerCase()) ||
    req.phone.includes(search)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Bouquet Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track custom bouquet inquiries</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search requests..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none text-sm"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden bg-white/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Colour</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-10" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((req: any) => (
                  <tr key={req._id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{req.customerName}</div>
                      <div className="text-xs text-gray-500">{req.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.colour}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.numberOfFlowers}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">{req.type}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold outline-none cursor-pointer ${getStatusColor(req.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          const details = `
Customer: ${req.customerName} (${req.phone})
Email: ${req.email}
Address: ${req.deliveryAddress}

Bouquet Details:
- Colour: ${req.colour}
- Quantity: ${req.numberOfFlowers}
- Type: ${req.type}
- Notes: ${req.notes || 'None'}
                          `;
                          alert(details);
                        }}
                        className="text-pink-600 hover:text-pink-800 p-2 rounded-full hover:bg-pink-50 transition-colors inline-flex items-center gap-1 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
