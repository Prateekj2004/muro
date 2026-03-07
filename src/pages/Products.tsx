import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
        
        // 🔥 CONTENT KO 3 TIMES MULTIPLY KIYA HAI YAHAN
        // React duplicate keys par error deta hai isliye IDs mein suffix lagaya hai
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
      <div className="container mx-auto px-4 md:px-8 pb-24 max-w-[1400px]">
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-gray-400">
            <p className="font-serif text-lg text-[#555]">No artworks found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-10 sm:gap-x-4 sm:gap-y-12 mt-6">
            {products.map((product, idx) => {
              
              // BULLETPROOF STATIC IMAGES (Fast Loading)
              const imgFront = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop"; 
              const imgBack = "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=400&auto=format&fit=crop";
              
              const isBestseller = idx % 4 === 0 || product.stock < 10;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: (idx % 12) * 0.05, duration: 0.4 }} // Modulo used so animations don't take forever on 3x content
                  key={product.id} 
                >
                  <Link to={`/product/${product.id.split('_')[0]}`} className="group block w-full">
                    
                    <div className="relative w-full aspect-[3/4] bg-[#F4F4F4] overflow-hidden">
                      
                      {isBestseller && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-white px-2.5 py-1 text-[8px] sm:text-[9px] font-medium tracking-widest uppercase text-[#111] shadow-sm">
                          Bestseller
                        </div>
                      )}

                      {/* 1. BACK IMAGE (Room View) */}
                      <img 
                        src={imgBack} 
                        alt="Room View" 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 z-0" 
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/400x533/EAEAEA/999999?text=Image+Blocked" }}
                      />
                      
                      {/* 2. FRONT IMAGE (Plain Poster) */}
                      <img 
                        src={imgFront} 
                        alt="Plain Poster" 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out group-hover:opacity-0 z-10" 
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/400x533/EAEAEA/999999?text=Image+Blocked" }}
                      />

                    </div>

                    {/* PRODUCT TEXT */}
                    <div className="mt-3 flex flex-col items-start px-0.5">
                      <h3 className="text-[12px] sm:text-[14px] text-[#111] font-normal tracking-wide line-clamp-1 group-hover:text-gray-500 transition-colors duration-300">
                        {product.title}
                      </h3>
                      <p className="text-[11px] sm:text-[13px] text-[#767676] font-normal mt-0.5">
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