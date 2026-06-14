"use client";

import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function AdminHamperRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/hampers/admin/all");
      setRequests(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch hamper requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r: any) => 
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.requestId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Hamper Requests</h1>
          <p className="text-gray-500">Manage customized hamper requests from customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or Request ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Occasion</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
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
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-pink-600">{req.requestId}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{req.customerName}</div>
                      <div className="text-xs text-gray-500">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.occasion}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">₹{req.budgetMin} - ₹{req.budgetMax}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        req.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          const productNames = req.selectedProducts && req.selectedProducts.length > 0 
                            ? req.selectedProducts.map((p: any) => p.name || p).join('\n- ')
                            : 'None';
                            
                          const details = `
Request ID: ${req.requestId}
Customer: ${req.customerName} (${req.phone})
Email: ${req.email}
Address: ${req.deliveryAddress}

Gender: ${req.targetGender || 'Not specified'}
Occasion: ${req.occasion}
Budget: ₹${req.budgetMin} - ₹${req.budgetMax}

Selected Items:
- ${productNames}

Theme: ${req.preferredTheme || 'Not specified'}
Any Other Requirements: ${req.requiredItems || 'Not specified'}
Photo Frame Required: ${req.needsPhotoFrame ? 'Yes' : 'No'}
${req.needsPhotoFrame && req.frameImages && req.frameImages.length > 0 ? `Photo Frame Images: ${req.frameImages.map((img: any) => img.url).join(', ')}` : ''}
Special Message: ${req.specialMessage || 'None'}
Notes: ${req.additionalNotes || 'None'}
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
