import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { API } from "@/services/api";

const getFullImageUrl = (path: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http")) return path;
  let cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (!cleanPath.includes("uploads/product")) cleanPath = `uploads/product/${cleanPath}`;
  return `https://muroposter.com/${cleanPath}`;
};

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("cat")?.toUpperCase() || "ALL";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("ALL");

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 40; // 4 rows on desktop

  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
      setSelectedSubCategory("ALL");
      setCurrentPage(1);
    }
  }, [urlCategory]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, subcatRes] = await Promise.all([
          API.getProducts().catch(() => []), 
          API.adminGetCategories().catch(() => []),
          API.adminGetSubcategories().catch(() => [])
        ]);
        
        setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data?.items || prodRes?.data || []));
        setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []));
        setSubcategories(Array.isArray(subcatRes) ? subcatRes : (subcatRes?.data || []));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("ALL");
    setCurrentPage(1);
    setSearchParams({ cat: cat.toLowerCase() });
  };

  const handleSubCategoryClick = (subCat: string) => {
    setSelectedSubCategory(subCat);
    setCurrentPage(1);
  };

  const currentCatObj = categories.find(c => c.name.toUpperCase() === selectedCategory);
  const availableSubcats = currentCatObj ? subcategories.filter(s => s.category_id === (currentCatObj.id || currentCatObj.category_id)) : [];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "ALL" || p.category?.toUpperCase() === selectedCategory;
    const matchSubCat = selectedSubCategory === "ALL" || p.subcategory?.toUpperCase() === selectedSubCategory;
    return matchCat && matchSubCat;
  });

  // --- PAGINATION LOGIC ---
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers to display (max 5 pages at a time)
  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
const navBase = "font-montserrat text-[15px] font-medium  uppercase tracking-[0.08em]  whitespace-nowrap pb-1.5";
  return (
    // Background color changed here
    <main className="bg-[#F0EEE9] min-h-screen font-sans text-[#111111]">
      <div className="pt-16 pb-8 text-center px-4">
        <motion.h1 
          key={selectedCategory}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
         className="font-montserrat font-light tracking-[1px] text-3xl md:text-4xl text-[#111] mb-8  text-black transition-colors uppercase"
        >
          {selectedCategory === "ALL" ? "Posters & Art Prints" : selectedCategory.toLowerCase()}
        </motion.h1>

        <div className="container mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-2 px-2 sm:px-4">
            <button 
              onClick={() => handleCategoryClick("ALL")}
              className={`${navBase} px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[12px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${selectedCategory === "ALL" ? "bg-[#111] text-[#F0EEE9] shadow-md" : "bg-white/50 text-[black] border border-black hover:bg-white" }`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id || cat.category_id} 
                onClick={() => handleCategoryClick(cat.name.toUpperCase())}
                className={` ${navBase} px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 rounded-full ${selectedCategory === cat.name.toUpperCase() ? "bg-[#111] text-[#F0EEE9] shadow-md" : "bg-white/50 text-[black] border border-black hover:bg-white" }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {availableSubcats.length > 0 && selectedCategory !== "ALL" && (
             <div className="flex flex-wrap items-center justify-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => handleSubCategoryClick("ALL")}
                  className={` ${navBase} px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest border transition-all rounded-full ${selectedSubCategory === "ALL" ? "border-black bg-black text-[#F0EEE9]" : "bg-white/50 text-[black] border border-black hover:bg-white" }`}
                >
                  ALL
                </button>
                {availableSubcats.map((sub) => (
                  <button 
                    key={sub.id || sub.subcategory_id} 
                    onClick={() => handleSubCategoryClick(sub.name.toUpperCase())}
                    className={`px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest border transition-all rounded-full ${selectedSubCategory === sub.name.toUpperCase() ? "border-black bg-black text-[#F0EEE9]" : "bg-white/50 text-[black] border border-black hover:bg-white" }`}
                  >
                    {sub.name}
                  </button>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Sticky header background also changed to match */}
      <div className="border-t border-b border-[#E0DED9] py-4 mb-6 sticky top-0 bg-[#F0EEE9] z-40">
        <div className="container mx-auto px-4 md:px-8 max-w-[1600px] flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
            {["SELECT SIZE", "THEME", "COLOR", "ARTISTS"].map(filter => (
              <button key={filter} className={`${navBase} flex items-center gap-1.5 text-[black] md:text-[12px] font-semibold uppercase tracking-[0.15em] text-[#333] hover:opacity-70`}>
                {filter} <ChevronDown size={14} className="text-[#888]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pb-24 max-w-[1600px]">
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin"></div></div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-16 mt-2">
              {currentItems.map((product, idx) => (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (idx % 8) * 0.05, duration: 0.4 }} key={product.id}>
                  <Link 
  to={`/product/${product.id}`} 
  state={{ productData: product }} // Poora data yahan se bhej diya
  className="group block w-full"
>
                    <div className="relative w-full aspect-[3/4] bg-[#E5E3DD] overflow-hidden">
                      <img src={getFullImageUrl(product.wall_poster_url || product.hoverImg || product.main_poster_url || product.image_url)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0" alt="Room View" />
                      {/* Using transparent bg for overlay to let the new theme colors work */}
                      <div className="absolute inset-0 z-10 bg-[#F0EEE9] transition-opacity duration-500 ease-in-out group-hover:opacity-0">
                        <img src={getFullImageUrl(product.main_poster_url || product.defaultImg || product.image_url)} className="w-full h-full object-cover" alt="Poster Print" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col items-start px-1">
                      <h3 className={` ${navBase} text-[12px] sm:text-[14px] text-[black] font-bold tracking-wide line-clamp-1 group-hover:text-gray-500 transition-colors`}>
                        {product.title}
                      </h3>
                      <p className={`${navBase} text-[12px] sm:text-[14px] text-[black] font-bold mt-1`}>
                        From ₹{product.price}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* NEW PAGINATION UI */}
            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-8 w-full font-sans">
                
                {/* Left Side: Empty div taaki center wale items perfectly center mein rahein */}
                <div className="hidden sm:block flex-1"></div>

                {/* Center: Page Numbers & Next */}
                <div className="flex items-center justify-center gap-8 flex-1 mb-6 sm:mb-0">
                  <div className="flex items-center gap-6">
                    {getPageNumbers().map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-1 pb-1 text-[15px] transition-all duration-200 ${
                          currentPage === pageNum 
                            ? 'border-b-[2px] border-black text-black' 
                            : 'text-black border-b-[2px] border-transparent hover:border-black/30'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="flex items-center text-[15px] text-black hover:opacity-60 transition-opacity"
                    >
                      NEXT <span className="ml-2 text-[18px] leading-none mb-[2px]">→</span>
                    </button>
                  )}
                </div>

                {/* Right Side: Showing Status */}
                <div className="text-[15px] text-black tracking-wide flex-1 text-center sm:text-right">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} items
                </div>
                
              </div>
            )}
          </>
        ) : (
          <div className="h-[40vh] flex flex-col items-center justify-center text-gray-500">
            <p className="text-sm tracking-widest uppercase">No products found</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Products;