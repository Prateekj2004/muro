import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RefreshCw, ChevronDown, Check } from "lucide-react";
import { useCart } from "@/lib/cart"; 
import { toast } from "sonner"; 

// --- Types ---
interface ProductDetails {
  id: string;
  title: string;
  basePrice: number;
  category: string;
  description: string;
  images: string[];
}

// --- Pricing Logic Multipliers ---
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { addItem } = useCart(); // Uncomment this later

  // --- States ---
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<keyof typeof SIZE_PRICING>("A3 (12x18 inches)");
  const [selectedFrame, setSelectedFrame] = useState<keyof typeof FRAME_PRICING>("Black Frame");
  const [quantity, setQuantity] = useState<number>(1);
  
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  // --- Mock API Fetch ---
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        const mockData: ProductDetails = {
          id: id || "1",
          title: "Abstract Serenity Canvas",
          basePrice: 899,
          category: "Aesthetic & Vibe",
          description: "Transform your space with this stunning abstract art piece. Designed to bring a sense of calm and modern elegance to any room. Printed on museum-quality 250gsm matte paper using archival inks that won't fade over time.",
          images: [
            "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1200"
          ]
        };

        setProduct(mockData);
        setActiveImage(mockData.images[0]);

      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const finalPrice = product 
    ? (product.basePrice + SIZE_PRICING[selectedSize] + FRAME_PRICING[selectedFrame]) * quantity 
    : 0;

  const handleQuantity = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(prev => prev - 1);
    if (type === "inc" && quantity < 10) setQuantity(prev => prev + 1);
  };

  const handleAddToCart = () => {
    toast.success(`${product?.title} added to your cart.`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center px-4">
        <h2 className="font-serif text-3xl text-[#222222] mb-4">Product Not Found</h2>
        <Link to="/products" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1">Return to Shop</Link>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      
      {/* Premium Breadcrumbs */}
      <div className="container mx-auto px-5 md:px-8 py-6">
        <nav className="flex items-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <Link to="/products" className="hover:text-black transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-black">{product.category}</span>
        </nav>
      </div>

      <div className="container mx-auto px-5 md:px-8 pb-24">
        {/* Changed lg:gap-20 to lg:gap-16 and widths to lg:w-1/2 for perfect balance */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* --- LEFT: IMAGE GALLERY --- */}
          {/* Constrained the max-width so it looks exactly like the trending cards */}
          <div className="lg:w-1/2 flex flex-col md:flex-row-reverse gap-4 md:gap-6 lg:justify-end items-start">
            
            {/* Main Image - Now exactly aspect-[4/5] with a max-width limit */}
            <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 bg-[#F4F4F4] aspect-[4/5] relative overflow-hidden shadow-sm">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                src={activeImage} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="w-full md:w-20 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 aspect-[4/5] bg-[#F4F4F4] border-2 transition-all ${activeImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: PRODUCT DETAILS (Sticky) --- */}
          <div className="lg:w-1/2 relative">
            <div className="lg:sticky lg:top-[100px] lg:pl-8">
              
              {/* Title & Price */}
              <div className="mb-8 border-b border-[#E5E5E5] pb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 block">{product.category}</span>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#222222] leading-tight mb-4">
                  {product.title}
                </h1>
                <p className="text-2xl font-medium tracking-wide text-[#222222]">
                  ₹{finalPrice.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Inclusive of all taxes</p>
              </div>

              {/* Options: Size */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222]">Select Size</h3>
                  <button className="text-[10px] text-gray-400 underline uppercase tracking-widest hover:text-black">Size Guide</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(Object.keys(SIZE_PRICING) as Array<keyof typeof SIZE_PRICING>).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 text-[11px] font-bold uppercase tracking-widest border transition-all ${
                        selectedSize === size 
                          ? 'border-black bg-black text-white shadow-md' 
                          : 'border-[#E5E5E5] bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {size.split(" ")[0]} <span className="block text-[8px] font-normal opacity-70 mt-1">{size.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options: Frame */}
              <div className="mb-10">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] mb-4">Select Frame</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(FRAME_PRICING) as Array<keyof typeof FRAME_PRICING>).map((frame) => (
                    <button
                      key={frame}
                      onClick={() => setSelectedFrame(frame)}
                      className={`py-3 px-4 flex items-center gap-3 border transition-all ${
                        selectedFrame === frame 
                          ? 'border-black bg-[#F9F9F9]' 
                          : 'border-[#E5E5E5] bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 border flex items-center justify-center ${selectedFrame === frame ? 'border-black bg-black' : 'border-gray-300'}`}>
                         {selectedFrame === frame && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${selectedFrame === frame ? 'text-black' : 'text-gray-600'}`}>
                        {frame}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Area */}
              <div className="flex flex-col gap-4 mb-10">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#E5E5E5] bg-white h-14 w-32">
                    <button onClick={() => handleQuantity("dec")} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="flex-1 text-center text-[13px] font-bold">{quantity}</span>
                    <button onClick={() => handleQuantity("inc")} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 h-14 bg-white border border-black text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add To Cart
                  </button>
                </div>

                {/* Buy It Now Button */}
                <button 
                  onClick={handleBuyNow}
                  className="w-full h-14 bg-[#222222] text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#2F4F4F] transition-all shadow-lg hover:shadow-xl"
                >
                  Buy It Now
                </button>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-3 gap-2 py-6 border-y border-[#E5E5E5] mb-8">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Secure Checkout</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RefreshCw className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">7-Day Returns</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="border-b border-[#E5E5E5]">
                <Accordion 
                  title="Description" 
                  isOpen={openAccordion === "description"} 
                  onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
                >
                  <p className="text-[13px] leading-relaxed text-gray-600 font-light">{product.description}</p>
                </Accordion>
                <Accordion 
                  title="Material & Quality" 
                  isOpen={openAccordion === "material"} 
                  onClick={() => setOpenAccordion(openAccordion === "material" ? null : "material")}
                >
                  <ul className="text-[13px] leading-relaxed text-gray-600 font-light list-disc pl-4 space-y-2">
                    <li>250 GSM Premium Matte Paper.</li>
                    <li>Archival inks to guarantee that they don't fade.</li>
                    <li>Frames made from lightweight, high-quality synthetic wood.</li>
                    <li>Acrylic glass shield to protect your artwork.</li>
                  </ul>
                </Accordion>
                <Accordion 
                  title="Shipping & Returns" 
                  isOpen={openAccordion === "shipping"} 
                  onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                >
                  <p className="text-[13px] leading-relaxed text-gray-600 font-light mb-2">
                    Orders are processed within 24-48 hours. Expected delivery within 5-7 business days across India.
                  </p>
                  <p className="text-[13px] leading-relaxed text-gray-600 font-light">
                    Hassle-free 7 days replacement in case of transit damage.
                  </p>
                </Accordion>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Reusable Premium Accordion Component
const Accordion = ({ title, children, isOpen, onClick }: { title: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => (
  <div className="border-t border-[#E5E5E5]">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between py-5 group"
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] group-hover:text-[#2F4F4F] transition-colors">{title}</span>
      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: "auto", opacity: 1 }} 
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="pb-6 pr-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default ProductDetail;