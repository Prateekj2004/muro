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
    <section id={id} className="w-full max-w-5xl mx-auto px-4 py-20 ">
      
      {/* ─── GRAPHIC HEADER (PIXEL-PERFECT IMAGE REPLICA) ─── */}
      <div className="flex justify-center w-full mb-16 pt-8 pb-6">
        <div className="relative inline-flex items-center">

          {/* TOP DECORATION: Line -> 3 Stars -> Line */}
          <div className="absolute -top-[12px] md:-top-[16px] left-[20%] md:left-[26%] flex items-center z-10 w-max">
            <div className="w-[60px] md:w-[130px] h-[1.5px] bg-[#222]"></div>
            <div className="flex gap-[4px] mx-2 md:mx-3 text-[#e63946] text-[10px] md:text-[12px]">
              <span>★</span><span>★</span><span>★</span>
            </div>
            <div className="w-[100px] md:w-[220px] h-[1.5px] bg-[#222]"></div>
          </div>

          {/* MAIN TEXT: "STILL" & Slanted "CURIOUS?" Box */}
          <div className="flex items-center z-0">
            {/* STILL (Straight) */}
            <span 
              className="text-[44px] md:text-[72px] font-black text-[#262626] tracking-tighter leading-none pr-1.5 md:pr-2" 
              style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}
            >
              STILL
            </span>

            {/* CURIOUS? (Slanted left edge ONLY) */}
            <div 
              className="bg-[#57663D] text-white pl-6 pr-4 md:pl-10 md:pr-6 py-1.5 md:py-2 flex items-center justify-center -ml-1"
              style={{ clipPath: 'polygon(28px 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <span 
                className="text-[44px] md:text-[72px] font-black tracking-tighter leading-none pt-1" 
                style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}
              >
                CURIOUS?
              </span>
            </div>
          </div>

          {/* BOTTOM DECORATION: Line -> 9 Stars -> Line */}
          <div className="absolute -bottom-[12px] md:-bottom-[16px] left-[2%] md:left-[5%] flex items-center z-10 w-max">
            <div className="w-[30px] md:w-[60px] h-[1.5px] bg-[#222]"></div>
            <div className="flex gap-[3px] md:gap-[4px] mx-2 md:mx-3 text-[#e63946] text-[9px] md:text-[11px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <div className="w-[80px] md:w-[160px] h-[1.5px] bg-[#222]"></div>
          </div>

        </div>
      </div>

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
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.id}
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
                <h3 className="font-bold text-[14px] md:text-[15px] text-[#222] pr-4">
                  {item.q}
                </h3>
                <span className="text-gray-400 shrink-0">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </div>
              
              <div 
                className={`transition-all duration-300 ease-in-out px-5 md:px-6 ${
                  isOpen ? "max-h-[200px] pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
                }`}
              >
                <p className="text-[13.5px] md:text-[14px] text-gray-600 leading-relaxed">
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