import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Square, LayoutGrid } from "lucide-react";
import { API } from "@/services/api";

export const CATEGORIES = [
  "ALL",
  "MOTIVATIONAL & MINDSET",
  "AESTHETIC & VIBE",
  "LOVE & CONNECTION",
  "KIDS - LEARNING & CONFIDENCE",
  "CALM & INNER BALANCE",
  "FANDOM & PASSION",
  "KITCHEN & DINING",
  "CUSTOMIZATION"
];

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("cat")?.toUpperCase() || "ALL";

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);

  useEffect(() => {
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await API.getProducts();
        const data = Array.isArray(res) ? res : (res?.data?.items || res?.data || []);
        
        // Multiply content by 3 for a filled grid
        const tripledData = [
          ...data.map((p: any) => ({ ...p, id: `${p.id}_1` })),
          ...data.map((p: any) => ({ ...p, id: `${p.id}_2` })),
          ...data.map((p: any) => ({ ...p, id: `${p.id}_3` }))
        ];

        setAllProducts(tripledData);
      } catch (error) { 
        console.error("Failed to fetch products", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (selectedCategory === "ALL") {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.category?.toUpperCase() === selectedCategory);
      setProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  return (
    <main className="bg-white min-h-screen font-sans text-[#111111]">
      
      {/* HEADER SECTION */}
      <div className="pt-16 pb-8 text-center px-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[#111] mb-8 capitalize tracking-wide">
          {selectedCategory === "ALL" ? "Posters & Art Prints" : selectedCategory.toLowerCase()}
        </h1>

        {/* CATEGORY TABS */}
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-2 px-2 sm:px-4">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${
                    isActive 
                      ? "bg-[#111] text-white" 
                      : "bg-[#F5F5F5] text-[#555] hover:bg-[#EBEBEB]" 
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔥 POSTERY SECONDARY FILTER BAR (HARDCODED) */}
      <div className="border-t border-b border-[#F0F0F0] py-4 mb-6 sticky top-0 bg-white z-40">
        <div className="container mx-auto px-4 md:px-8 max-w-[1600px] flex items-center justify-between">
          
          {/* Left Side: Dropdown Filters */}
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
            {["SELECT SIZE", "THEME", "COLOR", "ARTISTS", "STYLE", "ORIENTATION"].map(filter => (
              <button key={filter} className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.15em] text-[#333] whitespace-nowrap hover:opacity-70 transition-opacity">
                {filter} <ChevronDown size={14} className="text-[#888] stroke-[2px]" />
              </button>
            ))}
          </div>

          {/* Right Side: View Toggles (Hidden on very small mobile screens for neatness) */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em]">
              <button className="text-[#111] border-b-[1.5px] border-[#111] pb-1">Product</button>
              <button className="text-[#888] hover:text-[#111] pb-1 border-b-[1.5px] border-transparent transition-colors">Inspiration</button>
            </div>
            
            <div className="flex items-center gap-3 pl-2">
              <button className="text-[#888] hover:text-[#111] transition-colors">
                <Square size={20} strokeWidth={1.5} />
              </button>
              <button className="text-[#E58888] hover:opacity-80 transition-opacity">
                {/* Active grid icon matching the red/pink highlight from Postery */}
                <LayoutGrid size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PRODUCT GRID SECTION */}
      <div className="container mx-auto px-4 md:px-8 pb-24 max-w-[1600px]">
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-gray-400">
            <p className="font-serif text-lg text-[#555]">No artworks found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 mt-2">
            {products.map((product, idx) => {
              
              const imgFront = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop"; 
              const imgBack = "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=400&auto=format&fit=crop";
              
              const isBestseller = idx % 4 === 0 || product.stock < 10;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: (idx % 12) * 0.05, duration: 0.4 }}
                  key={product.id} 
                >
                  <Link to={`/product/${product.id.split('_')[0]}`} className="group block w-full">
                    
                    {/* BIG CONTAINER EFFECT */}
                    <div className="relative w-full aspect-[3/4] bg-[#F4F4F4] overflow-hidden">
                      
                      {/* BESTSELLER BADGE */}
                      {isBestseller && (
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 bg-white px-2.5 py-1 text-[8px] sm:text-[9px] font-medium tracking-widest uppercase text-[#111] shadow-sm">
                          Bestseller
                        </div>
                      )}

                      {/* 1. HOVER VIEW (Room Context) */}
                      <img 
                        src={imgBack} 
                        alt="Room View" 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 z-0" 
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/400x533/EAEAEA/999999?text=Image+Blocked" }}
                      />
                      
                      {/* 2. FRONT VIEW (Postery Style Grey Canvas) */}
                      <div className="absolute inset-0 z-10 flex items-center justify-center p-8 sm:p-14 bg-[#F5F5F5] transition-opacity duration-500 ease-in-out group-hover:opacity-0">
                        <img 
                          src={imgFront} 
                          alt="Plain Poster" 
                          loading="lazy"
                          className="w-full h-full object-contain shadow-[0_4px_20px_rgba(0,0,0,0.08)]" 
                          onError={(e) => { e.currentTarget.src = "https://placehold.co/400x533/EAEAEA/999999?text=Image+Blocked" }}
                        />
                      </div>

                    </div>

                    {/* PRODUCT TEXT */}
                    <div className="mt-4 flex flex-col items-start px-1">
                      <h3 className="text-[13px] sm:text-[15px] text-[#111] font-normal tracking-wide line-clamp-1 group-hover:text-gray-500 transition-colors duration-300">
                        {product.title}
                      </h3>
                      <p className="text-[12px] sm:text-[13px] text-[#767676] font-normal mt-1">
                        From ₹{product.price}
                      </p>
                    </div>
                    
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Products;