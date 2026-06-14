"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/orders/admin/dashboard");
        setStats(res.data.data);
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 shimmer-effect rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      trend: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      trend: "+5.2%",
      isPositive: true,
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Verifications",
      value: stats?.pendingVerification || 0,
      trend: "Requires attention",
      isPositive: false,
      icon: Users,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      trend: "+2 new this week",
      isPositive: true,
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trend && (
                  <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                    stat.isPositive ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.trend}
                  </span>
                )}
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-pink-600 font-medium hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order._id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-4 font-medium text-gray-900">{order.orderId}</td>
                      <td className="px-4 py-4 text-gray-600">{order.customer?.name}</td>
                      <td className="px-4 py-4 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                          order.status === "pending_verification" ? "bg-blue-100 text-blue-700" :
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" /> Best Selling Items
            </h2>
          </div>
          <div className="space-y-4">
            {stats?.bestSellers?.length > 0 ? (
              stats.bestSellers.map((item: any, index: number) => (
                <div key={item._id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center font-bold text-pink-600 text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.totalSold} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">No sales data available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
