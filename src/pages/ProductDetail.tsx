import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner"; 
import { API } from "@/services/api";
import { STATIC_PRODUCTS } from "./Products"; 

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    const found = STATIC_PRODUCTS.find((p) => String(p.id) === String(id));
    
    if (found) {
      setCurrentProduct(found);
      setActiveImage(found.defaultImg);
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentProduct) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-serif">Product Not Found</h1></div>;

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const payload = { product_id: currentProduct.id, qty: quantity };
      const res = await API.addToCart(payload);
      
      if (res.success !== false) {
        toast.success(`${currentProduct.title} added to cart!`);
      } else {
        toast.error(res.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Network Error. Could not add to cart.");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart", { state: { openCheckout: true } });
  };

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      <div className="container mx-auto px-5 py-6">
        <nav className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link to="/">Home</Link><ChevronRight size={12} className="mx-2" />
          <Link to="/products">Products</Link><ChevronRight size={12} className="mx-2" />
          <span className="text-black truncate">{currentProduct.category}</span>
        </nav>
      </div>

      <div className="container mx-auto px-5 pb-24 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* IMAGE GALLERY SECTION */}
        <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 items-start">
          
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 w-full shrink-0 no-scrollbar">
            {currentProduct.gallery.map((img: string, idx: number) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Thumbnail ${idx + 1}`}
                onClick={() => setActiveImage(img)} 
                className={`w-16 h-20 md:w-20 md:h-24 object-cover cursor-pointer transition-all duration-200 ${
                  activeImage === img ? 'border-[1.5px] border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                }`} 
                onError={(e) => { e.currentTarget.style.display = 'none' }} 
              />
            ))}
          </div>

          <div className="w-full aspect-[4/5] bg-[#F9F9F9] border border-gray-100">
            <img 
              src={activeImage} 
              className="w-full h-full object-cover transition-opacity duration-300" 
              onError={(e) => { e.currentTarget.src = "https://placehold.co/600x800/EAEAEA/999999?text=Image+Missing" }}
            />
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="lg:w-1/2">
          <div className="lg:sticky lg:top-[100px]">
            <div className="mb-8 border-b border-[#E5E5E5] pb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 block">{currentProduct.category}</span>
              <h1 className="font-serif text-4xl font-light mb-4">{currentProduct.title}</h1>
              <p className="text-2xl font-medium">₹{(Number(currentProduct.price) * quantity).toLocaleString()}</p>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-4">
                
                {/* 🔥 ALIGNMENT FIXED HERE (Added items-center to buttons) */}
                <div className="flex items-center border border-gray-200 h-14 w-32 bg-white">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(q => q - 1)} 
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="flex-1 text-center font-bold">{quantity}</span>
                  <button 
                    onClick={() => quantity < 10 && setQuantity(q => q + 1)} 
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button onClick={handleAddToCart} className="flex-1 h-14 bg-white border border-black text-black font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-gray-50 flex items-center justify-center gap-2">
                  <ShoppingBag size={18} /> Add To Cart
                </button>
              </div>
              <button onClick={handleBuyNow} className="w-full h-14 bg-[#222] text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg mt-2">
                Buy It Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default ProductDetail;