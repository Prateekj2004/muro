import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RefreshCw, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner"; 

// --- STATIC PRODUCT DATA ---
const STATIC_PRODUCT = {
  id: 1,
  title: "Premium Aesthetic Poster",
  basePrice: 899,
  category: "Aesthetic & Vibe",
  description: "This is a premium high-quality print on 250 GSM matte paper. Archival inks ensure vibrant colors that don't fade over time. Perfect for modern home or office decor.",
  images: [
    "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80",
  ]
};

const SIZE_PRICING = {
  "A4 (8x12 inches)": 0,       
  "A3 (12x18 inches)": 400,    
  "A2 (18x24 inches)": 900,    
};

const FRAME_PRICING = {
  "No Frame (Rolled)": 0,
  "Black Frame": 500,
  "White Frame": 500,
  "Natural Wood": 600,
};

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();

  // No loading needed for static data
  const [activeImage, setActiveImage] = useState<string>(STATIC_PRODUCT.images[0]);
  const [selectedSize, setSelectedSize] = useState<keyof typeof SIZE_PRICING>("A3 (12x18 inches)");
  const [selectedFrame, setSelectedFrame] = useState<keyof typeof FRAME_PRICING>("Black Frame");
  const [quantity, setQuantity] = useState<number>(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const finalPrice = (STATIC_PRODUCT.basePrice + SIZE_PRICING[selectedSize] + FRAME_PRICING[selectedFrame]) * quantity;

  // ==========================================
  // ADD TO CART (Local Persistence Logic)
  // ==========================================
  const handleAddToCart = () => {
    // 1. Existing Cart nikalo localStorage se
    const existingCart = JSON.parse(localStorage.getItem("muro_cart") || "[]");

    // 2. Naya item object banao
    const cartItem = {
      product_id: STATIC_PRODUCT.id,
      title: STATIC_PRODUCT.title,
      price: (STATIC_PRODUCT.basePrice + SIZE_PRICING[selectedSize] + FRAME_PRICING[selectedFrame]).toFixed(2),
      qty: quantity,
      line_total: finalPrice.toFixed(2),
      image_url: STATIC_PRODUCT.images[0]
    };

    // 3. Check karo agar wahi product pehle se hai (bas qty badha do)
    const existingItemIndex = existingCart.findIndex((item: any) => item.product_id === STATIC_PRODUCT.id);

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].qty += quantity;
      existingCart[existingItemIndex].line_total = (parseFloat(existingCart[existingItemIndex].price) * existingCart[existingItemIndex].qty).toFixed(2);
    } else {
      existingCart.push(cartItem);
    }

    // 4. Save back to localStorage
    localStorage.setItem("muro_cart", JSON.stringify(existingCart));

    // 5. Success Message & Event Trigger
    toast.success(`${STATIC_PRODUCT.title} added to cart!`);
    window.dispatchEvent(new Event("storage")); // Navbar update karne ke liye
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      <div className="container mx-auto px-5 md:px-8 py-6">
        <nav className="flex items-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link to="/products" className="hover:text-black">Products</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-black">{STATIC_PRODUCT.category}</span>
        </nav>
      </div>

      <div className="container mx-auto px-5 md:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="lg:w-1/2 flex flex-col md:flex-row-reverse gap-4 md:gap-6 lg:justify-end items-start">
            <div className="w-full md:w-[400px] lg:w-[450px] aspect-[4/5] relative overflow-hidden shadow-sm border border-[#E5E5E5] bg-[#F9F9F9]">
              <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeImage} alt={STATIC_PRODUCT.title} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-20 flex flex-row md:flex-col gap-4 overflow-x-auto no-scrollbar">
              {STATIC_PRODUCT.images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(img)} className={`flex-shrink-0 w-20 aspect-[4/5] bg-[#F4F4F4] border-2 transition-all ${activeImage === img ? 'border-black' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" /></button>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="lg:sticky lg:top-[100px] lg:pl-8">
              <div className="mb-8 border-b border-[#E5E5E5] pb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 block">{STATIC_PRODUCT.category}</span>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#222222] leading-tight mb-4">{STATIC_PRODUCT.title}</h1>
                <p className="text-2xl font-medium tracking-wide">₹{finalPrice.toLocaleString()}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Select Size</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.keys(SIZE_PRICING).map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size as any)} className={`py-3 px-4 text-[11px] font-bold uppercase tracking-widest border transition-all ${selectedSize === size ? 'border-black bg-black text-white' : 'border-[#E5E5E5] bg-white text-gray-600'}`}>{size.split(" ")[0]}</button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Select Frame</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(FRAME_PRICING).map((frame) => (
                    <button key={frame} onClick={() => setSelectedFrame(frame as any)} className={`py-3 px-4 flex items-center gap-3 border transition-all ${selectedFrame === frame ? 'border-black bg-[#F9F9F9]' : 'border-[#E5E5E5] bg-white text-gray-600'}`}>
                      <div className={`w-3 h-3 border rounded-full ${selectedFrame === frame ? 'bg-black' : ''}`} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{frame}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[#E5E5E5] bg-white h-14 w-32">
                    <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black"><Minus size={16} /></button>
                    <span className="flex-1 text-center text-[13px] font-bold">{quantity}</span>
                    <button onClick={() => quantity < 10 && setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black"><Plus size={16} /></button>
                  </div>
                  <button onClick={handleAddToCart} className="flex-1 h-14 bg-white border border-black text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Add To Cart
                  </button>
                </div>
                <button onClick={handleBuyNow} className="w-full h-14 bg-[#222222] text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#2F4F4F] transition-all">Buy It Now</button>
              </div>

              <div className="border-b border-[#E5E5E5]">
                <Accordion title="Description" isOpen={openAccordion === "description"} onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}>
                  <p className="text-[13px] leading-relaxed text-gray-600">{STATIC_PRODUCT.description}</p>
                </Accordion>
                <Accordion title="Shipping" isOpen={openAccordion === "shipping"} onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}>
                  <p className="text-[13px] leading-relaxed text-gray-600">Expected delivery: 5-7 business days across India.</p>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const Accordion = ({ title, children, isOpen, onClick }: any) => (
  <div className="border-t border-[#E5E5E5]">
    <button onClick={onClick} className="w-full flex items-center justify-between py-5 group text-left">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-[#2F4F4F]">{title}</span>
      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="pb-6 pr-4">{children}</div></motion.div>}</AnimatePresence>
  </div>
);

export default ProductDetail;