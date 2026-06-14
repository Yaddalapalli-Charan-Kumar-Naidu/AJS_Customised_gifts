"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import api from "@/lib/api";

const defaultTestimonials = [
  { _id: "1", name: "Priya Sharma", rating: 5, review: "Absolutely loved my customized hamper! The packaging was so beautiful and the quality exceeded my expectations. Will definitely order again! 💕", occasion: "Birthday Gift", location: "Mumbai" },
  { _id: "2", name: "Ananya Reddy", rating: 5, review: "Ordered a personalized jewelry box for my best friend and she was in tears! AJS Gifts truly makes every gift feel magical. 🌸", occasion: "Friendship Day", location: "Hyderabad" },
  { _id: "3", name: "Kavya Nair", rating: 5, review: "The delivery was super fast and the packaging is Instagram-worthy! My sister loved her anniversary hamper. Highly recommend! ✨", occasion: "Anniversary", location: "Bangalore" },
  { _id: "4", name: "Shreya Patel", rating: 4, review: "Such a premium gifting experience! The attention to detail in every product is remarkable. Will keep coming back for all my gifting needs.", occasion: "Valentine's Day", location: "Ahmedabad" },
];

const AVATAR_COLORS = ["from-pink-400 to-rose-500", "from-purple-400 to-indigo-500", "from-amber-400 to-rose-400", "from-teal-400 to-cyan-500"];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api.get("/site/testimonials").then((res) => {
      if (res.data?.data?.length > 0) setTestimonials(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(135deg, #FDF6EC 0%, #E8DEFF 50%, #FDF6EC 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-script text-2xl text-pink-400 mb-2">What Our Customers Say</p>
          <h2 className="section-heading text-4xl sm:text-5xl font-bold font-display">
            Love from Our Community
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative p-6 rounded-3xl transition-all duration-300 cursor-pointer ${
                active === index
                  ? "shadow-glass-lg scale-105"
                  : "hover:scale-102"
              }`}
              style={{
                background: active === index
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.6)",
                border: active === index
                  ? "1px solid rgba(232,116,138,0.4)"
                  : "1px solid rgba(255,200,220,0.3)",
                backdropFilter: "blur(12px)",
              }}
              onClick={() => setActive(index)}
            >
              <Quote className="w-8 h-8 text-pink-200 mb-3" />
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{(t as any).occasion} · {(t as any).location}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              {active === index && (
                <motion.div layoutId="active-indicator"
                  className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #E8748A, #9B72CF)" }} />
              )}
            </motion.div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${
                active === i ? "w-8 h-2 bg-pink-500" : "w-2 h-2 bg-pink-200"
              }`} />
          ))}
        </div>
      </div>
    </section>
  );
}
