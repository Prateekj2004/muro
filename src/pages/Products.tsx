import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { API } from "@/services/api";

// Exact categories matching your requirements
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
        setAllProducts(data);
      } catch (error) { 
        console.error("Failed to fetch products", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCatalog();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (selectedCategory === "ALL") {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.category?.toUpperCase() === selectedCategory);
      setProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  return (
    <main className="bg-[#FCFCFA] min-h-screen font-sans text-[#222222]">
      
      {/* HEADER SECTION */}
      <div className="pt-16 pb-8 text-center px-4">
        <h1 className="font-serif text-3xl md:text-5xl text-[#222] mb-10 capitalize">
          {selectedCategory === "ALL" ? "Shop All" : selectedCategory.toLowerCase()}
        </h1>

        {/* 🔥 FIX 1: CATEGORIES WRAP 
          'flex-nowrap' aur 'overflow' hata kar 'flex-wrap' lagaya hai 
        */}
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-4 px-2 sm:px-4">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? "bg-[#515D43] text-white" 
                      : "bg-[#F0EEE9] text-[#555] hover:bg-[#E5E2DB]" 
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PRODUCT GRID SECTION */}
      <div className="container mx-auto px-4 md:px-8 pb-24 max-w-7xl">
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#515D43] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-gray-400">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p className="font-serif text-lg">No artworks found in this category.</p>
          </div>
        ) : (
          /* 🔥 FIX 2: MOBILE GRID (2 items per row)
            grid-cols-2 by default (for mobile), and gap adjusted
          */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 mt-4 sm:mt-8">
            {products.map((product, idx) => {
              const imgPath = product.image_url || product.image || "https://images.unsplash.com/photo-1549490349-8643362247b5";
              const isBestseller = idx % 4 === 0 || product.stock < 10;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  key={product.id} 
                  className="group cursor-pointer flex flex-col"
                >
                  {/* IMAGE CONTAINER */}
                  <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] bg-white mb-3 sm:mb-5 overflow-hidden">
                    {/* BESTSELLER BADGE (Scaled for mobile) */}
                    {isBestseller && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#515D43] text-white text-[7px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-1 z-10 shadow-sm">
                        Bestseller
                      </span>
                    )}
                    
                    <img 
                      src={imgPath} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    {/* HOVER ADD TO CART OVERLAY (Scaled text for mobile) */}
                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out">
                      <button className="w-full bg-white/90 backdrop-blur-sm text-black py-2 sm:py-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-black hover:text-white transition-colors">
                        <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]" /> View Art
                      </button>
                    </div>
                  </Link>

                  {/* PRODUCT INFO (Font sizes adjusted for 2-column mobile layout) */}
                  <div className="text-left px-1">
                    <h4 className="font-serif text-[13px] sm:text-[17px] text-[#222] mb-1 sm:mb-1.5 group-hover:text-[#515D43] transition-colors line-clamp-1">
                      {product.title}
                    </h4>
                    <p className="text-[11px] sm:text-[13px] text-[#666]">
                      From ₹{product.price}
                    </p>
                  </div>
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