import React, { useState } from "react";
import PolicyPage from "./PolicyPage";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

// Interface update: 'answer' ab string ya JSX (ReactNode) ho sakta hai
const FAQItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#222222]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-[#2F4F4F] transition-colors group"
      >
        <span className="font-coolvetica uppercase tracking-wider text-sm md:text-base pr-8 group-hover:text-[#2F4F4F]">
          {question}
        </span>
        <div className="text-[#222222]/40 group-hover:text-[#2F4F4F] transition-colors">
            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[#222222]/70 leading-relaxed font-sans text-sm md:text-base">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "1. What does MURO POSTER sell?",
      answer: "MURO POSTER offers physical wall art and intentional wall-based products designed to shape atmosphere and identity. Each piece reflects our belief that the environment influences daily mindset."
    },
    {
      question: "2. What sizes are available?",
      answer: "Available sizes are listed on each product page and may vary by design. Customers are responsible for reviewing dimensions carefully before purchase."
    },
    {
      question: "3. How long does shipping take?",
      answer: "Orders are typically processed within 2–4 business days. Delivery timelines generally range from 5–10 business days after dispatch, depending on carrier operations and location. These timelines are estimates and not guaranteed. Tracking information is provided once available."
    },
    {
      question: "4. Do you accept returns?",
      answer: (
        <>
            <p className="mb-4">Returns or replacements may be considered in cases of verified damage, incorrect item delivery, or confirmed non-delivery. Requests must be submitted within 7 days of receipt and may require supporting evidence. All decisions follow our Cancellation & Refund Policy.</p>
            <p>Customers are encouraged to inspect items promptly upon delivery.</p>
        </>
      )
    },
    {
      question: "5. How can I contact MURO?",
      answer: (
        <div className="space-y-4">
            <p>For questions or support, contact us at:</p>
            
            <div>
                <p className="font-bold text-[#222222]">Email:</p>
                <a href="mailto:helpmuroposter@gmail.com" className="hover:text-[#2F4F4F] underline decoration-1 underline-offset-4">
                    helpmuroposter@gmail.com
                </a>
                <p className="text-xs opacity-70 mt-1">(Response target: 24–48 business hours)</p>
            </div>

            <div>
                <p className="font-bold text-[#222222]">WhatsApp Support:</p>
                <a href="https://wa.me/918059700876" className="hover:text-[#2F4F4F] underline decoration-1 underline-offset-4">
                    +91 80597 00876
                </a>
                <p className="text-xs opacity-70 mt-1">(Available during business hours)</p>
            </div>

            <p className="pt-2 italic border-t border-[#222222]/10 inline-block mt-2">
                We aim to provide timely assistance and fair resolution whenever possible.
            </p>
        </div>
      )
    }
  ];

  return (
    <PolicyPage title="Frequently Asked Questions">
      <section className="space-y-8">
        
        {/* Intro Text - Drop Cap 'T' will be applied automatically by PolicyPage */}
        <div className="mb-10">
          <p className="text-lg italic font-medium text-[#222222]">
            These FAQs are provided for general guidance. All purchases and website use are governed by our official Terms, Shipping, and Cancellation & Refund Policies.
          </p>
        </div>

        {/* FAQ List */}
        <div className="border-t border-[#222222]/10">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Bottom CTA Box - Optional but kept for design balance */}
        <div className="mt-16 p-8 bg-white border border-[#222222]/5 text-center">
            <h3 className="font-coolvetica uppercase mb-4 tracking-wider">Still have questions?</h3>
            <p className="text-sm opacity-70 mb-6 font-sans">
                We are here to help. Reach out to our support team.
            </p>
            <a href="mailto:helpmuroposter@gmail.com" className="inline-block bg-[#222222] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#2F4F4F] transition-colors">
                Contact Support
            </a>
        </div>

      </section>
    </PolicyPage>
  );
};

export default FAQ;