import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, ChevronDown, Heart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const shopCategories = [
    "Motivational", "Aesthetic", "Love", "Kids", 
    "Calm", "Fandom", "Kitchen", "All Collections"
  ];

  return (
    // BG Color Changed back to Original #F0EEE9
    <header className="sticky top-0 z-50 bg-[#F0EEE9]/95 backdrop-blur-md border-b border-[#222222]/5 text-[#222222]">
      <div className="container mx-auto flex items-center justify-between h-[60px] px-8 md:px-12">
        
        {/* LEFT: LOGO */}
        <div className="flex-shrink-0 w-[220px]">
          <Link to="/" className="font-coolvetica text-xl md:text-2xl tracking-tight hover:text-[#2F4F4F] transition-colors whitespace-nowrap uppercase">
            MURO POSTER
          </Link>
        </div>

        {/* CENTRE: NAVIGATION */}
        <nav className="hidden lg:flex items-center justify-center gap-4 text-[12px] md:text-[13px] text-[#151515] uppercase tracking-[0.12em] font-coolvetica flex-1">
          <Link to="/" className="hover:text-[#2F4F4F] transition-all duration-300">Home</Link>
          
          <div className="relative group h-20 flex items-center">
            <Link to="/shop" className="flex items-center gap-1.5 hover:text-[#2F4F4F] transition-all py-2">
              Shop <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300"/>
            </Link>
            
            <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-48 bg-[#F0EEE9] border border-[#222222]/5 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-3">
              <div className="py-3">
                {shopCategories.map((cat) => (
                  <Link 
                    key={cat} 
                    to={`/shop?cat=${cat}`}
                    className="block px-6 py-2.5 text-[10px] font-medium tracking-[0.15em] hover:bg-[#2F4F4F] hover:text-white transition-colors text-left text-[#222222]/70"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link to="/bestsellers" className="hover:text-[#2F4F4F] transition-all duration-300">Bestsellers</Link>
          <Link to="/new-arrivals" className="hover:text-[#2F4F4F] transition-all duration-300">New Arrivals</Link>
          <Link to="/customization" className="hover:text-[#2F4F4F] transition-all duration-300">Customisation</Link>
          <Link to="/about" className="hover:text-[#2F4F4F] transition-all duration-300">About</Link>
        </nav>

        {/* RIGHT: ICONS */}
        <div className="flex items-center justify-end gap-6 w-[220px] font-coolvetica">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center gap-2 hover:text-[#2F4F4F] transition-colors group"
          >
            <Search className="w-5 h-5" strokeWidth={1.2} />
            <span className="hidden xl:block text-[13px] md:text-13px text-[#000000] uppercase tracking-[0.12em] group-hover:text-[#2F4F4F]">Search</span>
          </button>

          <Link to="/wishlist" className="hidden lg:block hover:text-[#2F4F4F] transition-colors">
            <Heart className="w-5 h-5" strokeWidth={1.2} />
          </Link>
          
          <Link to="/account" className="hidden md:block hover:text-[#2F4F4F] transition-colors">
            <User className="w-5 h-5" strokeWidth={1.2} />
          </Link>

          <Link to="/cart" className="relative group hover:text-[#2F4F4F] transition-colors">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.2} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#2F4F4F] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="lg:hidden hover:text-[#2F4F4F] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      
      {/* Search Overlay - Matches Original BG */}
       <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#222222]/5 bg-[#F0EEE9] overflow-hidden absolute w-full top-[80px] left-0 shadow-xl z-40"
          >
             <div className="container mx-auto px-6 py-10 flex items-center gap-6 max-w-4xl">
               <Search className="w-5 h-5 text-[#222222]/50" />
               <input 
                 type="text" 
                 placeholder="Search for posters..." 
                 className="w-full text-lg outline-none placeholder:text-[#222222]/30 bg-transparent border-b border-[#222222]/10 pb-2 focus:border-[#2F4F4F] transition-all"
                 autoFocus
               />
               <button onClick={() => setIsSearchOpen(false)}><X className="w-5 h-5 text-[#222222]/50 hover:text-black" /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu - Matches Original BG */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-[#F0EEE9] z-[60] h-screen w-full flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#222222]/5 h-[80px]">
               <span className="font-coolvetica text-xl tracking-tight">MURO</span>
               <button onClick={() => setMobileOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex flex-col py-12 px-8 text-[11px] font-semibold uppercase tracking-[0.22em] gap-8 font-sans overflow-y-auto">
              <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
              <Link to="/bestsellers" onClick={() => setMobileOpen(false)}>Bestsellers</Link>
              <Link to="/new-arrivals" onClick={() => setMobileOpen(false)}>New Arrivals</Link>
              <Link to="/customization" onClick={() => setMobileOpen(false)}>Customisation</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;