import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { API } from "@/services/api";

export const CATEGORIES = [
  "ALL",
  "MOTIVATIONAL & MINDSET",
  "AESTHETIC & VIBE",
  "LOVE & CONNECTION",
  "KIDS - LEARNING & CONFIDENCE",
  "CALM & INNER BALANCE",
  "FANDOM & PASSION",
  "KITCHEN & Dining",
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
      <div className="pt-16 pb-10 text-center px-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[#111] mb-8 capitalize tracking-wide">
          {selectedCategory === "ALL" ? "Posters & Art Prints" : selectedCategory.toLowerCase()}
        </h1>

        {/* CATEGORY TABS */}
        <div className="container mx-auto max-w-6xl">
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

      {/* PRODUCT GRID SECTION */}
      <div className="container mx-auto px-4 md:px-8 pb-24 max-w-7xl">
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-gray-400">
            <ShoppingBag size={40} className="mb-4 opacity-20" strokeWidth={1.5} />
            <p className="font-serif text-lg text-[#555]">No artworks found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 mt-6">
            {products.map((product, idx) => {
              
              // ==========================================
              // 🔥 STATIC IMAGES FOR HOVER EFFECT (Testing only)
              // We stack them. On hover, Main fades out, Hover fades in.
              //
              // In real app, use: product.image_url (main), product.gallery[0] (hover)
              // ==========================================
              const mainStaticImage = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop";
              const hoverStaticImage = "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=600&auto=format&fit=crop";
              
              const isBestseller = idx % 4 === 0 || product.stock < 10;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  key={product.id} 
                >
                  <Link to={`/product/${product.id}`} className="group block w-full relative">
                    
                    {/* POSTERY STYLE IMAGE CONTAINER (3:4 Ratio) */}
                    {/* We use 'relative' to stack images on top of each other */}
                    <div className="relative w-full aspect-[3/4] bg-[#F7F7F7] overflow-hidden mb-3">
                      
                      {/* MINIMALIST BADGE */}
                      {isBestseller && (
                        <div className="absolute top-3 left-3 z-10 bg-white/95 px-2 py-1 text-[8px] sm:text-[9px] font-bold tracking-widest uppercase text-[#111] shadow-sm">
                          Bestseller
                        </div>
                      )}
                      
                      {/* 🔥 STATIC IMAGE 1 (Main view) */}
                      <img 
                        src={mainStaticImage} 
                        alt={product.title} 
                        // It fades out on group hover (group-hover:opacity-0)
                        className="w-full h-full object-cover object-center transition-all duration-300 ease-out group-hover:scale-105 group-hover:opacity-0" 
                      />

                      {/* 🔥 STATIC IMAGE 2 (Hover view) */}
                      <img 
                        src={hoverStaticImage} 
                        alt={`${product.title} hover view`} 
                        // Position absolute to stack. Fades in on group hover.
                        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 opacity-0 group-hover:opacity-100" 
                      />
                      
                      {/* SLEEK HOVER BUTTON (Circular cart icon) */}
                      <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                        <div className="bg-white p-2.5 rounded-full shadow-lg text-[#111] hover:bg-[#111] hover:text-white transition-colors duration-300">
                          <ShoppingBag size={16} strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* POSTERY STYLE TYPOGRAPHY */}
                    <div className="flex flex-col text-left px-0.5 relative z-10">
                      <h3 className="text-[12px] sm:text-[14px] text-[#111] font-medium tracking-wide line-clamp-1 mb-0.5 group-hover:underline underline-offset-2 transition-all">
                        {product.title}
                      </h3>
                      <p className="text-[11px] sm:text-[13px] text-[#777] font-normal">
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