import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Categories for Shop Dropdown
  const shopCategories = [
    "Motivational", "Aesthetic", "Love", "Kids", 
    "Calm", "Fandom", "Kitchen", "All Collections"
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F0EEE9]/90 backdrop-blur-md border-b border-[#222222]/5 text-[#222222]">
      <div className="container mx-auto flex items-center justify-between h-20 px-4 md:px-8">
        
        {/* LEFT: LOGO */}
        <div className="flex-shrink-0 w-320">
          <Link to="/" className="font-serif text-2xl md:text-3xl font-bold tracking-tighter hover:text-[#2F4F4F] transition-colors">
            MURO POSTERS
          </Link>
        </div>

        {/* CENTRE: NAVIGATION */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] flex-1">
          <Link to="/" className="hover:text-[#2F4F4F] transition-colors">Home</Link>
          
          {/* Shop Dropdown */}
          <div className="relative group h-20 flex items-center">
            <Link to="/shop" className="flex items-center gap-1 hover:text-[#2F4F4F] transition-colors py-2">
              Shop <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
            </Link>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-[#222222]/5 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <div className="py-2">
                {shopCategories.map((cat) => (
                  <Link 
                    key={cat} 
                    to={`/shop?cat=${cat}`}
                    className="block px-6 py-3 text-[10px] hover:bg-[#F0EEE9] hover:text-[#2F4F4F] transition-colors text-left"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link to="/bestsellers" className="hover:text-[#2F4F4F] transition-colors">Bestsellers</Link>
          <Link to="/new-arrivals" className="hover:text-[#2F4F4F] transition-colors">New Arrivals</Link>
          <Link to="/customization" className="hover:text-[#2F4F4F] transition-colors">Customisation</Link>
          <Link to="/about" className="hover:text-[#2F4F4F] transition-colors">About MURO</Link>
          <Link to="/contact" className="hover:text-[#2F4F4F] transition-colors">Contact</Link>
        </nav>

        {/* RIGHT: ICONS (Search, Account, Cart) */}
        <div className="flex items-center justify-end gap-5 w-32">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:text-[#2F4F4F] transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <Link to="/account" className="hidden md:block hover:text-[#2F4F4F] transition-colors">
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          <Link to="/cart" className="relative group hover:text-[#2F4F4F] transition-colors">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#2F4F4F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden hover:text-[#2F4F4F] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* SEARCH BAR OVERLAY (Optional UX Improvement) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#222222]/5 bg-white overflow-hidden"
          >
             <div className="container mx-auto px-4 py-4 flex items-center gap-4">
               <Search className="w-4 h-4 text-[#222222]/50" />
               <input 
                 type="text" 
                 placeholder="Search for moods, styles, or collections..." 
                 className="w-full text-sm outline-none placeholder:text-[#222222]/40 font-serif tracking-wide"
                 autoFocus
               />
               <button onClick={() => setIsSearchOpen(false)}><X className="w-4 h-4 text-[#222222]/50" /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-[#222222]/5 bg-[#F0EEE9]"
          >
            <div className="flex flex-col py-8 px-6 text-sm font-bold uppercase tracking-widest gap-6">
              <Link to="/" onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">Home</Link>
              
              {/* Mobile Shop Dropdown Logic could go here, simplified for now */}
              <div className="flex flex-col gap-4 border-l-2 border-[#222222]/10 pl-4">
                <span className="text-[#2F4F4F] opacity-50 text-[10px]">Shop By Category</span>
                {shopCategories.slice(0, 4).map(cat => (
                   <Link key={cat} to={`/shop?cat=${cat}`} onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">{cat}</Link>
                ))}
                <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-[#2F4F4F] underline underline-offset-4">View All</Link>
              </div>

              <Link to="/bestsellers" onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">Bestsellers</Link>
              <Link to="/new-arrivals" onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">New Arrivals</Link>
              <Link to="/customization" onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">Customisation</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">About MURO</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="hover:text-[#2F4F4F]">Contact</Link>
              
              <div className="pt-6 border-t border-[#222222]/10 flex items-center gap-4">
                <Link to="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 hover:text-[#2F4F4F]">
                  <User size={16} /> My Account
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;