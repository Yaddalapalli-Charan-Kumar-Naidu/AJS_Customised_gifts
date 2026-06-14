"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Truck, Bell, Globe, Percent, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSiteConfigStore } from "@/store/siteConfigStore";

export default function AdminSettingsPage() {
  const { config, fetchConfig, updateConfig, loading } = useSiteConfigStore();
  const [form, setForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setForm({
        ...config,
        state_rates: config.state_rates || []
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig(form);
      toast.success("Settings updated successfully! ✨");
    } catch (err) {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const addStateRate = () => {
    setForm({
      ...form,
      state_rates: [...(form.state_rates || []), { state: "", rate: 99 }]
    });
  };

  const removeStateRate = (index: number) => {
    const updated = [...form.state_rates];
    updated.splice(index, 1);
    setForm({ ...form, state_rates: updated });
  };

  const updateStateRate = (index: number, field: string, value: any) => {
    const updated = [...form.state_rates];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, state_rates: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 mt-1">Manage delivery charges, announcements, and global rules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-luxury transition-all disabled:opacity-50"
        >
          {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-semibold text-left">
            <Truck className="w-5 h-5" />
            Delivery Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 text-left">
            <Bell className="w-5 h-5" />
            Announcements
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 text-left">
            <Globe className="w-5 h-5" />
            General Info
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Delivery Section */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Configuration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={form.delivery_charge || ""}
                  onChange={(e) => setForm({ ...form, delivery_charge: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Delivery Feature</label>
                <div className="flex items-center gap-3 h-[46px]">
                  <button
                    onClick={() => setForm({ ...form, is_free_delivery_active: !form.is_free_delivery_active })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${form.is_free_delivery_active ? "bg-pink-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_free_delivery_active ? "left-7" : "left-1"}`} />
                  </button>
                  <span className="text-sm text-gray-600">{form.is_free_delivery_active ? "Enabled" : "Disabled"}</span>
                </div>
              </div>

              {form.is_free_delivery_active && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={form.free_delivery_above || ""}
                    onChange={(e) => setForm({ ...form, free_delivery_above: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                </motion.div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Custom State Rates (DTDC Variation)</h3>
                <button
                  onClick={addStateRate}
                  className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add State
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Add specific delivery charges for different states. Default charge applies to all other states.</p>
              
              <div className="space-y-3">
                {form.state_rates?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      placeholder="State Name (e.g. Kerala)"
                      value={item.state}
                      onChange={(e) => updateStateRate(index, "state", e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateStateRate(index, "rate", Number(e.target.value))}
                      className="w-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={() => removeStateRate(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!form.state_rates || form.state_rates.length === 0) && (
                  <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">No custom state rates defined.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Announcement Section */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Announcement Bar</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Text</label>
                <input
                  type="text"
                  value={form.announcement_text || ""}
                  onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm({ ...form, announcement_active: !form.announcement_active })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.announcement_active ? "bg-purple-600" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.announcement_active ? "left-7" : "left-1"}`} />
                </button>
                <span className="text-sm text-gray-600">Visible on website</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
