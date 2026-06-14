"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I place a customized order?",
    a: "You can place a customized order by visiting our 'Custom Hampers' page. Fill in the form with your preferences, budget, and occasion details. Our team will get back to you within 24 hours!",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all UPI payments including Google Pay, PhonePe, Paytm, and standard UPI. We use QR code-based payment for security. No cash on delivery is available at this time.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3-5 business days. For urgent orders, please contact us on WhatsApp and we'll try our best to accommodate rush delivery.",
  },
  {
    q: "Can I track my order?",
    a: "Absolutely! Once your order is confirmed and shipped, you can track it using your Order ID on our 'Track Order' page. You'll also receive updates via email.",
  },
  {
    q: "Do you offer bulk/corporate gifting?",
    a: "Yes! We love helping with corporate gifting and bulk orders. Reach out to us via email or WhatsApp for special pricing and customization options.",
  },
  {
    q: "Can I add a personalized message to my gift?",
    a: "Of course! Every order includes an option to add a personal message or special note. You can add it during checkout in the 'Special Instructions' field.",
  },
  {
    q: "What if my gift arrives damaged?",
    a: "We pack every gift with utmost care. However, if your product arrives damaged, please contact us within 24 hours of delivery with photos, and we'll resolve it immediately!",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl overflow-hidden border border-pink-100 bg-white/60 backdrop-blur-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-pink-50/50 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm sm:text-base pr-4">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-pink-400 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-pink-100 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(180deg, #FDF6EC 0%, #FFE4F0 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-script text-2xl text-pink-400 mb-2">Got Questions?</p>
          <h2 className="section-heading text-4xl sm:text-5xl font-bold font-display">
            We Have Answers ✨
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 p-6 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(244,167,185,0.3)" }}
        >
          <p className="text-gray-600 mb-4">Still have questions? We&apos;d love to help! 💕</p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-luxury px-6 py-3 text-sm"
          >
            💬 Chat with Us on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
