import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

// ─── FAQ DATA (ONLY 3 TABS) ───────────────────────────
const faqData = {
  "Product Info": [
    { q: "What paper quality do you use for posters?", a: "We use 300 GSM matte paper for rich colors and a premium feel." },
    { q: "Are your posters waterproof or laminated?", a: "No, our posters are not laminated or waterproof — they are matte-finished for indoor use." },
    { q: "Do the posters come framed?", a: "No, all posters are delivered unframed but if you want frame the we also provide framed posters." },
    { q: "What sizes are available?", a: "A5 (small), A4 (medium), and A3 (large) are available in all product types." },
    { q: "Are the colors true to what I see online?", a: "We print using OEKO-TEX® fade-proof inks. Slight color variation may happen due to screen brightness." },
    { q: "Is wall adhesive included?", a: "Yes! Free adhesive strips are included for easy, damage-free mounting." },
    { q: "Are your prints eco-friendly?", a: "Yes, we use non-toxic inks and eco-conscious paper and packaging." },
    { q: "Can I request a specific theme or design?", a: "You can contact us on WhatsApp for special requests or suggest designs for future collections." },
  ],
  "Shipping": [
    { q: "How long does delivery take?", a: "We usually ship your order within 24 hours. Delivery takes 3–7 working days based on your location." },
    { q: "Do you deliver across India?", a: "Yes, we ship pan-India through trusted courier partners like DTDC, Bluedart, Xpressbees, Ekart and many more." },
    { q: "Can I track my order after it's shipped?", a: "Absolutely! You'll get a WhatsApp or email with the tracking link once your order is dispatched." },
    { q: "How do I update my delivery address?", a: "If your order hasn't been shipped yet, contact us via WhatsApp or email to update your address." },
    { q: "What should I do if my package is delayed?", a: "We'll keep you updated via SMS/WhatsApp. You can also raise a support request if it's delayed beyond 8 days." },
    { q: "Do you offer express or fast shipping?", a: "Yes We Offer Fast Shipping." },
    { q: "What if I missed the delivery?", a: "The courier partner will attempt 3 re-delivery. If undelivered, it may return to us and we'll reach out." },
    { q: "Do you charge for shipping?", a: "No we don't charge shipping for prepaid orders. we only charge small fees for COD orders." },
  ],
  "Payments": [
    { q: "What payment methods do you accept?", a: "We accept UPI, Cards, Net Banking, Wallets, and Cash on Delivery (COD)." },
    { q: "Is Cash on Delivery available?", a: "Yes, Cash On Delivery is available." },
    { q: "Do you offer any discounts or deals?", a: "Yes! Check our homepage banners for combo offers like Buy 2 Get 1 Free, Buy 5 Get 3 Free, Buy 10 Get 5 Free etc." },
    { q: "Do I need to apply a coupon code for offers?", a: "No code needed. Offers are automatically applied in the cart once eligible." },
    { q: "Is there a minimum order value?", a: "Yes, the minimum order value is ₹199." },
    { q: "How do I apply a discount code?", a: "You can enter a promo code at checkout if you have one during special sales." },
    { q: "Can I use multiple offers together?", a: "Yes, you can use some of the multiple offers together. Combo deals can be stacked with some coupon codes." },
    { q: "What happens if my payment fails?", a: "You can try another method or contact us via WhatsApp. If deducted, we'll auto-refund in 2–3 days." },
  ]
};

const tabs = [
  { id: "Product Info", icon: "🖼️" },
  { id: "Shipping", icon: "📦" },
  { id: "Payments", icon: "💰" },
];

const FAQSection = ({ id }) => {
  const [activeTab, setActiveTab] = useState("Product Info");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id={id} className="w-full max-w-5xl mx-auto px-4 py-20 -mt-10 ">
      
      {/* ─── GRAPHIC HEADER (PIXEL-PERFECT IMAGE REPLICA) ─── */}
<div className="w-full flex justify-center ">
  <div className="flex items-center gap-4">




  </div>
</div>
      <h2 className="text-center text-[56px] tracking-wide mb-10 text-[#1c1c1c]">
        STILL <span className="font-extrabold text-[#1c1c1c]">CURIOUS?</span>
      </h2>

      {/* ─── CATEGORY TABS ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setOpenIndex(0); 
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-[#222] text-white shadow-md"
                : "bg-[#f4f5f6] text-[#555] hover:bg-[#e2e4e6]"
            }`}
          >
            <span className="text-[14px] leading-none">{tab.icon}</span>
            <p>{tab.id}</p>
          </button>
        ))}
      </div>

      {/* ─── ACCORDION LIST ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {faqData[activeTab as keyof typeof faqData]?.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${
                isOpen ? "bg-[#f4f5f6]" : "bg-[#f9f9f9] hover:bg-[#f4f5f6]"
              }`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center justify-between p-5 md:px-6 md:py-5">
                <p className="font-bold text-[14px] md:text-[14.5px] text-[#222] pr-4">
                  {item.q}
                </p>
                <span className="text-gray-400 shrink-0">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </div>
              
              <div 
                className={`transition-all duration-300 ease-in-out px-5 md:px-6 ${
                  isOpen ? "max-h-[200px] pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
                }`}
              >
                <p className="text-[12.5px] md:text-[14px] text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
    </section>
  );
};

export default FAQSection;