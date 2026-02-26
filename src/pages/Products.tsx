import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight, ShoppingBag, X, ChevronDown, Check } from "lucide-react";

// --- Types ---
interface Product {
  id: string | number;
  title: string;
  price: number;
  category: string;
  image: string;
  isNew?: boolean;
}

// --- Dummy Data Generator ---
const generateMockProducts = (): Product[] => {
  const categories = ["Motivational & Mindset", "Aesthetic & Vibe", "Love & Connection", "Kids – Learning & Confidence", "Calm & Inner Balance", "Fandom & Passion", "Kitchen & Dining", "Customization"];
  const images = [
    "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&q=80&w=600"
  ];
  
  return Array.from({ length: 36 }).map((_, i) => ({
    id: i + 1,
    title: `Premium Poster ${i + 1}`,
    price: Math.floor(Math.random() * 2500) + 500,
    category: categories[i % categories.length],
    image: images[i % images.length],
    isNew: i % 5 === 0
  }));
};

const allMockProducts = generateMockProducts();

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest Arrivals" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" }
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("cat");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");

  const ITEMS_PER_PAGE = 16; // Changed to 16 for better grid filling (4x4)

  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
      setCurrentPage(1); 
    }
  }, [urlCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setSortMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        let filteredData = [...allMockProducts];

        if (selectedCategory) filteredData = filteredData.filter(p => p.category === selectedCategory);
        if (appliedMinPrice !== null) filteredData = filteredData.filter(p => p.price >= appliedMinPrice);
        if (appliedMaxPrice !== null) filteredData = filteredData.filter(p => p.price <= appliedMaxPrice);

        if (sortBy === "price-asc") filteredData.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-desc") filteredData.sort((a, b) => b.price - a.price);
        else if (sortBy === "newest") filteredData.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));

        const total = filteredData.length;
        const totalPgs = Math.ceil(total / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        setProducts(paginatedData);
        setTotalPages(totalPgs || 1);

      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedCategory, appliedMinPrice, appliedMaxPrice, sortBy]);

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    if (cat) setSearchParams({ cat });
    else setSearchParams({}); 
  };

  const applyCustomPrice = () => {
    setAppliedMinPrice(minPriceInput ? parseInt(minPriceInput) : null);
    setAppliedMaxPrice(maxPriceInput ? parseInt(maxPriceInput) : null);
    setCurrentPage(1);
  };

  const clearPriceFilter = () => {
    setMinPriceInput(""); setMaxPriceInput("");
    setAppliedMinPrice(null); setAppliedMaxPrice(null);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const currentSortLabel = sortOptions.find(opt => opt.id === sortBy)?.label;

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      
      <div className="bg-[#F0EEE9]/30 border-b border-[#222222]/5 py-16 md:py-24 text-center px-4">
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-4 text-[#222222] tracking-tight">
          {selectedCategory || "The Collection"}
        </h1>
        <p className="text-[#222222]/60 text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
          Curated art for every space
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-[#E5E5E5] gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mr-2 hidden md:block">Active:</span>
            {!selectedCategory && appliedMinPrice === null && appliedMaxPrice === null && (
              <span className="text-xs text-[#222222] italic">All Products</span>
            )}
            {selectedCategory && (
              <div className="flex items-center gap-2 bg-[#F9F9F9] border border-[#E5E5E5] px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold">
                {selectedCategory}
                <button onClick={() => handleCategoryChange(null)} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </div>
            )}
            {(appliedMinPrice !== null || appliedMaxPrice !== null) && (
              <div className="flex items-center gap-2 bg-[#F9F9F9] border border-[#E5E5E5] px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold">
                Price: {appliedMinPrice !== null ? `₹${appliedMinPrice}` : '₹0'} - {appliedMaxPrice !== null ? `₹${appliedMaxPrice}` : 'Max'}
                <button onClick={clearPriceFilter} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em]">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="relative z-30" ref={sortRef}>
              <button onClick={() => setSortMenuOpen(!sortMenuOpen)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] hover:text-[#2F4F4F] transition-colors">
                Sort by: <span className="text-[#222222]/60 font-medium">{currentSortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${sortMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-3 w-56 bg-white border border-[#E5E5E5] shadow-xl flex flex-col py-2">
                    {sortOptions.map((opt) => (
                      <button key={opt.id} onClick={() => { setSortBy(opt.id); setSortMenuOpen(false); setCurrentPage(1); }} className={`text-left px-5 py-3 text-[11px] uppercase tracking-[0.1em] transition-colors flex items-center justify-between ${sortBy === opt.id ? 'bg-[#F9F9F9] text-black font-bold' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
                        {opt.label} {sortBy === opt.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-[100px] space-y-10">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] mb-5">Categories</h3>
                <ul className="space-y-4">
                  {["Motivational & Mindset", "Aesthetic & Vibe", "Love & Connection", "Kids – Learning & Confidence", "Calm & Inner Balance", "Fandom & Passion", "Kitchen & Dining", "Customization"].map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <li key={cat}>
                        <button onClick={() => handleCategoryChange(isActive ? null : cat)} className="group flex items-center gap-3 w-full text-left">
                          <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors ${isActive ? 'bg-[#222222] border-[#222222]' : 'border-[#CCCCCC] group-hover:border-[#222222]'}`}>
                            {isActive && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                          </div>
                          <span className={`text-[13px] tracking-wide transition-colors ${isActive ? 'text-[#222222] font-semibold' : 'text-[#222222]/60 group-hover:text-[#222222]'}`}>{cat}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#222222] mb-5">Price Range</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" placeholder="Min" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} className="w-full border border-[#E5E5E5] bg-[#F9F9F9] py-2.5 pl-7 pr-2 text-sm focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" placeholder="Max" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} className="w-full border border-[#E5E5E5] bg-[#F9F9F9] py-2.5 pl-7 pr-2 text-sm focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>
                <button onClick={applyCustomPrice} className="w-full bg-[#222222] text-white py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#2F4F4F] transition-colors">Apply Filter</button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center bg-[#F9F9F9] border border-[#E5E5E5] p-8">
                <p className="text-lg font-serif text-[#222222] mb-2">Nothing matches your criteria.</p>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or sorting.</p>
                <button onClick={() => { handleCategoryChange(null); clearPriceFilter(); }} className="bg-[#222222] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#2F4F4F] transition-colors">Clear All Filters</button>
              </div>
            ) : (
              <>
                {/* UPGRADED TO 4 COLUMNS & ASPECT-[5/7] */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14">
                  {products.map((product) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} key={product.id} className="group cursor-pointer">
                      <Link to={`/product/${product.id}`} className="block relative w-full aspect-[5/7] bg-[#F4F4F4] overflow-hidden mb-4">
                        {product.isNew && (
                          <span className="absolute top-3 left-3 bg-[#222222] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 z-10 shadow-sm">New</span>
                        )}
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
                        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <button className="w-full bg-white text-[#222222] py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#222222] hover:text-white transition-colors flex justify-center items-center gap-2 shadow-xl">
                            <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                          </button>
                        </div>
                      </Link>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#222222]/40 mb-1">{product.category}</span>
                        <Link to={`/product/${product.id}`} className="font-serif text-[15px] text-[#222222] group-hover:text-[#2F4F4F] transition-colors mb-1 line-clamp-1">
                          {product.title}
                        </Link>
                        <span className="text-[12px] tracking-widest font-bold text-[#222222]">₹{product.price}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-20 flex items-center justify-center border-t border-[#E5E5E5] pt-10">
                    <nav className="flex items-center gap-1">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-3 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"><ChevronLeft className="w-5 h-5" strokeWidth={1.5} /></button>
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button key={idx + 1} onClick={() => handlePageChange(idx + 1)} className={`w-10 h-10 flex items-center justify-center text-[13px] transition-colors ${currentPage === idx + 1 ? 'border-b-2 border-black font-bold text-black' : 'text-gray-400 hover:text-black'}`}>{idx + 1}</button>
                      ))}
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"><ChevronRight className="w-5 h-5" strokeWidth={1.5} /></button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFiltersOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 flex flex-col lg:hidden">
              <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-black" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {/* Mobile filters omitted for brevity in snippet, but keep your existing ones */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Products;