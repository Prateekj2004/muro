import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingBag, Info, User, Tag } from "lucide-react";
import { toast } from "sonner"; 
import { API } from "@/services/api";

const getFullImageUrl = (path: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http")) return path;
  let cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (!cleanPath.includes("uploads/product")) cleanPath = `uploads/product/${cleanPath}`;
  return `https://muroposter.com/${cleanPath}`;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const res = await API.adminGetProducts(); 
        console.log("result",res)
        const allProducts = Array.isArray(res) ? res : (res?.data?.items || res?.data || []);
        
        const found = allProducts.find((p: any) => String(p.id) === String(id));
        if (found) {
          setCurrentProduct(found);
          setActiveImage(getFullImageUrl(found.main_poster_url || found.defaultImg || found.image_url));
          if(found.size_prices && found.size_prices.length > 0) {
            setSelectedVariant(found.size_prices[0]);
          }
          
          const related = allProducts.filter((p: any) => p.category === found.category && String(p.id) !== String(id)).slice(0, 5);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
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
      const payload = { product_id: currentProduct.id, qty: quantity, size_id: selectedVariant?.size_id };
      const res = await API.addToCart(payload);
      if (res.success !== false) toast.success(`${currentProduct.title} added to cart!`);
      else toast.error(res.message || "Failed to add to cart");
    } catch (error) { toast.error("Network Error. Could not add to cart."); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart", { state: { openCheckout: true } });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const galleryImages = [
    currentProduct.main_poster_url || currentProduct.defaultImg || currentProduct.image_url,
    currentProduct.zoom_in_url || currentProduct.hoverImg,
    currentProduct.wall_poster_url
  ].filter(Boolean).map((path: string) => getFullImageUrl(path));
  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(currentProduct.price);

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      <div className="container mx-auto px-5 py-6">
        <nav className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link to="/">Home</Link><ChevronRight size={12} className="mx-2" />
          <Link to="/products">Products</Link><ChevronRight size={12} className="mx-2" />
          <span className="text-black truncate">{currentProduct.category}</span>
        </nav>
      </div>

      <div className="container mx-auto px-5 pb-16 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 items-start">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 w-full shrink-0 no-scrollbar">
            {galleryImages.map((img: string, idx: number) => (
              <img 
                key={idx} src={img} alt={`Thumbnail ${idx + 1}`}
                onClick={() => setActiveImage(img)} 
                className={`w-16 h-20 md:w-20 md:h-24 object-cover cursor-pointer transition-all duration-200 ${
                  activeImage === img ? 'border-[1.5px] border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                }`} 
              />
            ))}
          </div>

          <div 
            className="w-full aspect-[4/5] bg-[#F9F9F9] border border-gray-100 relative overflow-hidden cursor-crosshair"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={activeImage} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100'}`} 
            />
            {isZooming && (
              <div 
                className="absolute inset-0 bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: backgroundPosition,
                  backgroundSize: "250%",
                }}
              />
            )}
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="lg:sticky lg:top-[100px]">
            <div className="mb-6 border-b border-[#E5E5E5] pb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                {currentProduct.category} {currentProduct.subcategory && `> ${currentProduct.subcategory}`}
              </span>
              <h1 className="font-serif text-4xl font-light mb-4">{currentProduct.title}</h1>
              <p className="text-3xl font-medium">₹{(displayPrice * quantity).toLocaleString()}</p>
              
              {currentProduct.short_description && (
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">{currentProduct.short_description}</p>
              )}
            </div>

            {currentProduct.size_prices && currentProduct.size_prices.length > 0 && (
              <div className="mb-6">
                 <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Select Size</p>
                 <div className="flex flex-wrap gap-3">
                   {currentProduct.size_prices.map((sp: any) => (
                     <button 
                       key={sp.size_id} onClick={() => setSelectedVariant(sp)}
                       className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${selectedVariant?.size_id === sp.size_id ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black'}`}
                     >
                       {sp.sku}
                     </button>
                   ))}
                 </div>
              </div>
            )}

            <div className="flex flex-col gap-4 mt-8">
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
              <button onClick={handleBuyNow} className="w-full h-14 bg-[#222] text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg mt-2">
                Buy It Now
              </button>
            </div>

            <div className="mt-12 space-y-4">
               {currentProduct.full_description && (
                 <div className="bg-gray-50 p-4 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-800 mb-2"><Info size={14}/> About this artwork</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{currentProduct.full_description}</p>
                 </div>
               )}
               <div className="grid grid-cols-2 gap-4">
                 {/* RESOLUTION AND COLOR MODE REMOVED FROM HERE */}
                 {currentProduct.author_name && (
                   <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-1 col-span-2 md:col-span-1">
                     <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest flex items-center gap-1"><User size={10}/> Artist</span>
                     <span className="text-sm font-semibold">{currentProduct.author_name}</span>
                     {currentProduct.author_bio && <span className="text-xs text-gray-500">{currentProduct.author_bio}</span>}
                   </div>
                 )}
               </div>
               {currentProduct.tags && (
                 <div className="flex flex-wrap items-center gap-2 mt-4">
                   <Tag size={14} className="text-gray-400" />
                   {currentProduct.tags.split(',').map((tag: string, i: number) => (
                     <span key={i} className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{tag.trim()}</span>
                   ))}
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-5 py-16 border-t border-gray-100">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group block w-full">
                <div className="relative w-full aspect-[3/4] bg-[#F4F4F4] overflow-hidden mb-3">
                  <img 
                    src={getFullImageUrl(product.wall_poster_url || product.hoverImg || product.main_poster_url || product.image_url)} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0" 
                    alt="Room View" 
                  />
                  <div className="absolute inset-0 z-10 bg-white transition-opacity duration-500 ease-in-out group-hover:opacity-0">
                    <img 
                      src={getFullImageUrl(product.main_poster_url || product.defaultImg || product.image_url)} 
                      className="w-full h-full object-cover" 
                      alt="Poster Print" 
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start px-1">
                  <h3 className="text-[12px] text-[#111] font-normal tracking-wide line-clamp-1 group-hover:text-gray-500 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-[12px] text-[#767676] mt-0.5">From ₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetail;