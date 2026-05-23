import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

type FAQItem = {
  q: string;
  a: string;
};

type FAQSectionProps = {
  id?: string;
};

const faqData: FAQItem[] = [
  {
    q: "What paper quality do you use for posters?",
    a: "We use 300 GSM matte paper for rich colors and a premium feel.",
  },
  {
    q: "Are your posters waterproof or laminated?",
    a: "No, our posters are not laminated or waterproof — they are matte-finished for indoor use.",
  },
  {
    q: "Do the posters come framed?",
    a: "No, all posters are delivered unframed. If you want frames, we also provide framed posters.",
  },
  {
    q: "What sizes are available?",
    a: "A5, A4, and A3 sizes are available in all product types.",
  },
  {
    q: "Are the colors true to what I see online?",
    a: "We print using fade-proof inks. Slight color variation may happen because of screen brightness and display settings.",
  },
  {
    q: "Is wall adhesive included?",
    a: "Yes, free adhesive strips are included for easy and damage-free mounting.",
  },
  {
    q: "How long does delivery take?",
    a: "We usually ship your order within 24 hours. Delivery takes 3–7 working days based on your location.",
  },
  {
    q: "Do you deliver across India?",
    a: "Yes, we ship pan-India through trusted courier partners.",
  },
  {
    q: "Can I track my order after it is shipped?",
    a: "Yes, you will receive a tracking link through WhatsApp or email once your order is dispatched.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, cards, net banking, wallets, and Cash on Delivery.",
  },
];

const FAQSection: React.FC<FAQSectionProps> = ({ id }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id={id} className="w-full">
      <div className="rounded-[22px] bg-white/70 border border-[#1C1C1C]/10 overflow-hidden">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.q}
              className={`transition-all duration-300 ${
                index !== 0 ? "border-t border-[#1C1C1C]/10" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between gap-5 px-5 md:px-7 py-5 text-left hover:bg-white/60 transition-colors"
              >
                <span className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C] leading-snug">
                  {item.q}
                </span>

                <span className="shrink-0 text-[#1C1C1C]/45">
                  {isOpen ? (
                    <Minus className="w-4 h-4" strokeWidth={1.8} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[220px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 md:px-7 pb-5 md:pb-6">
                  <p className="text-[14px] md:text-[15px] leading-relaxed text-[#1C1C1C]/65 max-w-[900px]">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;