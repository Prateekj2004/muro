import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RefreshCw, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner"; 

const STATIC_PRODUCTS = [
  { id: 1, title: "Abstract Serenity", price: 899, category: "Aesthetic & Vibe", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80" },
  { id: 2, title: "Minimalist Horizon", price: 749, category: "Calm & Inner Balance", image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80" },
  { id: 3, title: "Golden Mindset", price: 999, category: "Motivational & Mindset", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80" },
  { id: 4, title: "Vintage Connection", price: 1200, category: "Love & Connection", image: "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&q=80" },
  { id: 5, title: "Urban Vibe", price: 699, category: "Aesthetic & Vibe", image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80" },
  { id: 6, title: "Zen Garden", price: 850, category: "Calm & Inner Balance", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80" },
  { id: 7, title: "Cyber Neon", price: 1100, category: "Fandom & Passion", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80" },
  { id: 8, title: "Nordic Kitchen", price: 599, category: "Kitchen & Dining", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80" },
  { id: 9, title: "Custom Legacy", price: 1500, category: "Customization", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80" },
];

const SIZE_PRICING = { "A4 (8x12\")": 0, "A3 (12x18\")": 400, "A2 (18x24\")": 900 };
const FRAME_PRICING = { "No Frame": 0, "Black Frame": 500, "White Frame": 500, "Natural Wood": 600 };

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentProduct = STATIC_PRODUCTS.find(p => p.id === Number(id)) || STATIC_PRODUCTS[0];

  const [activeImage, setActiveImage] = useState<string>(currentProduct.image);
  const [selectedSize, setSelectedSize] = useState<keyof typeof SIZE_PRICING>("A3 (12x18\")");
  const [selectedFrame, setSelectedFrame] = useState<keyof typeof FRAME_PRICING>("Black Frame");
  const [quantity, setQuantity] = useState<number>(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const finalPricePerItem = currentProduct.price + SIZE_PRICING[selectedSize] + FRAME_PRICING[selectedFrame];
  const totalDisplayPrice = finalPricePerItem * quantity;

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem("muro_cart") || "[]");
    const cartItem = {
      product_id: currentProduct.id,
      title: currentProduct.title,
      variant: `${selectedSize} | ${selectedFrame}`,
      price: finalPricePerItem.toFixed(2),
      qty: quantity,
      line_total: totalDisplayPrice.toFixed(2),
      image_url: currentProduct.image
    };

    existingCart.push(cartItem);
    localStorage.setItem("muro_cart", JSON.stringify(existingCart));
    toast.success(`${currentProduct.title} added to cart!`);
    window.dispatchEvent(new Event("storage")); 
  };

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      <div className="container mx-auto px-5 py-6">
        <nav className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link to="/">Home</Link><ChevronRight size={12} className="mx-2" />
          <Link to="/products">Products</Link><ChevronRight size={12} className="mx-2" />
          <span className="text-black">{currentProduct.category}</span>
        </nav>
      </div>

      <div className="container mx-auto px-5 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* IMAGE - MATCHED WITH SHOP CARD ASPECT RATIO */}
          <div className="lg:w-1/2 flex flex-col md:flex-row-reverse gap-4 items-start">
            <div className="w-full md:w-[450px] aspect-[4/5] relative overflow-hidden shadow-sm border border-gray-100 bg-[#F9F9F9]">
              <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeImage} className="w-full h-full object-cover" />
            </div>
            <div className="flex md:flex-col gap-4 overflow-x-auto">
              {[currentProduct.image, currentProduct.image].map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(img)} className={`w-20 aspect-[4/5] border-2 transition-all ${activeImage === img ? 'border-black' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" /></button>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="lg:sticky lg:top-[100px]">
              <div className="mb-8 border-b border-[#E5E5E5] pb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 block">{currentProduct.category}</span>
                <h1 className="font-serif text-4xl lg:text-5xl font-light mb-4">{currentProduct.title}</h1>
                <p className="text-2xl font-medium">₹{totalDisplayPrice.toLocaleString()}</p>
              </div>

              {/* SELECTIONS */}
              <div className="space-y-8 mb-10">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Size</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(SIZE_PRICING).map(size => (
                      <button key={size} onClick={() => setSelectedSize(size as any)} className={`py-3 text-[10px] font-bold uppercase border tracking-widest transition-all ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>{size}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Frame</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(FRAME_PRICING).map(frame => (
                      <button key={frame} onClick={() => setSelectedFrame(frame as any)} className={`py-3 px-4 text-[10px] font-bold uppercase border tracking-widest flex items-center gap-3 ${selectedFrame === frame ? 'border-black' : 'border-gray-200'}`}>
                        <div className={`w-3 h-3 border rounded-full ${selectedFrame === frame ? 'bg-black border-black' : 'border-gray-300'}`} />
                        {frame}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 h-14 w-32 bg-white">
                    <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50"><Minus size={16} /></button>
                    <span className="flex-1 text-center font-bold">{quantity}</span>
                    <button onClick={() => quantity < 10 && setQuantity(q => q + 1)} className="w-10 h-full flex items-center justify-center hover:bg-gray-50"><Plus size={16} /></button>
                  </div>
                  <button onClick={handleAddToCart} className="flex-1 h-14 bg-white border border-black text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ShoppingBag size={18} /> Add To Cart
                  </button>
                </div>
                <button onClick={() => { handleAddToCart(); navigate("/cart"); }} className="w-full h-14 bg-black text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#222] transition-all shadow-lg">Buy It Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const Accordion = ({ title, children, isOpen, onClick }: any) => (
  <div className="border-t border-gray-200">
    <button onClick={onClick} className="w-full flex items-center justify-between py-5 group"><span className="text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-gray-500">{title}</span><ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>
    <AnimatePresence>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="pb-6 text-[13px] text-gray-500 leading-relaxed">{children}</div></motion.div>}</AnimatePresence>
  </div>
);

export default ProductDetail;