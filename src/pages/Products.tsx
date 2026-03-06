import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight, ShoppingBag, X, ChevronDown, Check } from "lucide-react";

// --- 9 STATIC PRODUCTS (Same as Detail Page) ---
const STATIC_PRODUCTS = [
  { id: 1, title: "Abstract Serenity", price: 899, category: "Aesthetic & Vibe", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80", isNew: true },
  { id: 2, title: "Minimalist Horizon", price: 749, category: "Calm & Inner Balance", image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80" },
  { id: 3, title: "Golden Mindset", price: 999, category: "Motivational & Mindset", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80", isNew: true },
  { id: 4, title: "Vintage Connection", price: 1200, category: "Love & Connection", image: "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&q=80" },
  { id: 5, title: "Urban Vibe", price: 699, category: "Aesthetic & Vibe", image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80" },
  { id: 6, title: "Zen Garden", price: 850, category: "Calm & Inner Balance", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80" },
  { id: 7, title: "Cyber Neon", price: 1100, category: "Fandom & Passion", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80", isNew: true },
  { id: 8, title: "Nordic Kitchen", price: 599, category: "Kitchen & Dining", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80" },
  { id: 9, title: "Custom Legacy", price: 1500, category: "Customization", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80" },
];

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" }
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("cat");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
  }, [urlCategory]);

  // LOCAL FILTERING LOGIC
  useEffect(() => {
    setLoading(true);
    let filtered = [...STATIC_PRODUCTS];

    if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory);
    if (appliedMinPrice !== null) filtered = filtered.filter(p => p.price >= appliedMinPrice);
    if (appliedMaxPrice !== null) filtered = filtered.filter(p => p.price <= appliedMaxPrice);

    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);

    // Simulate small load for feel
    setTimeout(() => {
      setProducts(filtered);
      setLoading(false);
    }, 300);
  }, [selectedCategory, appliedMinPrice, appliedMaxPrice, sortBy]);

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222]">
      <div className="bg-[#F0EEE9]/30 border-b border-[#222222]/5 py-16 text-center px-4">
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">{selectedCategory || "The Collection"}</h1>
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em]">Curated art for every space</p>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* SIDEBAR FILTERS */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-[100px] space-y-10">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5">Categories</h3>
                <ul className="space-y-4">
                  {["Motivational & Mindset", "Aesthetic & Vibe", "Love & Connection", "Calm & Inner Balance", "Fandom & Passion", "Kitchen & Dining", "Customization"].map((cat) => (
                    <li key={cat}>
                      <button onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className="flex items-center gap-3 text-[13px] hover:text-black transition-colors">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center ${selectedCategory === cat ? 'bg-black border-black' : 'border-gray-300'}`}>
                          {selectedCategory === cat && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={selectedCategory === cat ? 'font-bold' : 'text-gray-500'}>{cat}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
             {loading ? (
               <div className="h-[40vh] flex items-center justify-center"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>
             ) : (
               <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                 {products.map((product) => (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={product.id} className="group">
                     <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] bg-[#F4F4F4] overflow-hidden mb-4 shadow-sm border border-gray-100">
                       {product.isNew && <span className="absolute top-3 left-3 bg-black text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 z-10">New</span>}
                       <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                       <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                         <button className="w-full bg-white text-black py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                           <ShoppingBag size={14} /> View Details
                         </button>
                       </div>
                     </Link>
                     <div className="text-left">
                       <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                       <h4 className="font-serif text-[15px] mb-1 group-hover:text-gray-600 transition-colors">{product.title}</h4>
                       <p className="text-sm font-bold">₹{product.price}</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>

        </div>
      </div>
    </main>
  );
};

export default Products;