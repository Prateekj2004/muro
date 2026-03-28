import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "@/components/NavLink"; 
import { API } from "@/services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Profile dropdown toggle state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check auth state & User Data
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState<any>(() => JSON.parse(localStorage.getItem("user") || "null"));

  // Default Categories Data
  const defaultCategories = [
    "Motivational & Mindset",
    "Aesthetic & Vibe",
    "Love & Connection",
    "Kids – Learning & Confidence",
    "Calm & Inner Balance",
    "Fandom & Passion",
    "Kitchen & Dining",
    "Customization"
  ];

  // State for Dynamic Categories
  const [categories, setCategories] = useState<string[]>(defaultCategories);

  // Fetch Categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.adminGetCategories();
        // API response se array nikalo
        const catData = Array.isArray(res) ? res : (res?.data || []);
        
        if (catData && catData.length > 0) {
          // Object me se sirf 'name' nikal kar array bana rahe hain
          const categoryNames = catData.map((c: any) => c.name);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.log("API error, using default categories.", error);
      }
    };

    fetchCategories();
  }, []);

  // Listen to storage changes incase login happens in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserData(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Click outside close logic for Profile Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null); // Clear user data on logout
    setProfileOpen(false); // Close dropdown on logout
    window.dispatchEvent(new Event("storage")); // Dispatch event so other tabs sync
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#57663D] h-[64px] font-sans text-white">
      <div className="w-full h-full px-5 md:px-8 xl:px-12 flex items-center justify-between">
        
        {/* 1. LEFT: LOGO */}
        <div className="flex-1 flex justify-start items-center">
          <button
            className="lg:hidden mr-4 hover:opacity-60 transition-opacity"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <Link 
            to="/" 
            className="font-coolvetica ml-5 text-xl md:text-2xl tracking-tight hover:text-[#2F4F4F] transition-colors whitespace-nowrap uppercase"
          >
            muro poster
          </Link>
        </div>

        {/* 2. CENTER: LINKS & DROPDOWN */}
        <nav className="flex-none hidden ml-[100px] lg:flex justify-center items-center gap-4 xl:gap-6 relative -left-4 xl:-left-8 h-full">
          <NavLink 
            to="/" 
            className="text-[13px] font-[500] text-white uppercase tracking-[0.1em] transition-opacity"
            activeClassName="  decoration-[1.5px]"
          >
            Home
          </NavLink>

          {/* PRODUCTS DROPDOWN */}
          <div className="relative group h-full flex items-center cursor-pointer">
            <NavLink 
              to="/products" 
              className="text-[13px] font-[500] text- uppercase tracking-[0.1em] hover:opacity-60 transition-opacity flex items-center gap-1"
              activeClassName="opacity-60      decoration-[1.5px]"
            >
              Products <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300 ease-in-out" strokeWidth={2}/>
            </NavLink>
            
            <div className="absolute top-[64px] left-1/2 -translate-x-1/2 w-[320px] bg-white border border-[#E5E5E5] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out flex flex-col py-3 z-50">
              {categories.map((cat) => (
                <NavLink 
                  key={cat} 
                  to={`/products?cat=${encodeURIComponent(cat)}`}
                  className="px-6 py-3 text-[11px] xl:text-[12px] font-[500] text-[#000000] uppercase tracking-[0.08em] hover:bg-[#f9f9f9] hover:text-gray-500 transition-colors text-left"
                  activeClassName="bg-[#f9f9f9] text-gray-500"
                >
                  {cat}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink 
            to="/bestsellers" 
            className="text-[13px] font-[500] text-[#fff] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60      decoration-[1.5px]"
          >
            Bestsellers
          </NavLink>

          <NavLink 
            to="/new-arrivals" 
            className="text-[13px] font-[500] text-[#fff] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60      decoration-[1.5px]"
          >
            New Arrivals
          </NavLink>

          <NavLink 
            to="/customisation" 
            className="text-[13px] font-[500] text-[#fff] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60      decoration-[1.5px]"
          >
            Customisation
          </NavLink>

          <NavLink 
            to="/about" 
            className="text-[13px] font-[500] text-[#fff] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60      decoration-[1.5px]"
          >
            About MURO
          </NavLink>

          <NavLink 
            to="/contact" 
            className="text-[13px] font-[500] text-[#fff] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60      decoration-[1.5px]"
          >
            Contact
          </NavLink>
        </nav>

        {/* 3. RIGHT: ICONS */}
        <div className="flex-1 flex justify-end items-center gap-4 xl:gap-5 h-full">
          
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer"
          >
            <Search className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#fff]" strokeWidth={1.2} />
            <span className="text-[10px] xl:text-[11px] font-[400] text-[#fff] hidden xl:block whitespace-nowrap uppercase tracking-wider">Search</span>
          </button>

          {/* 🔥 AUTH PROFILE / CLICK DROPDOWN */}
          <div className="hidden md:flex relative h-full items-center z-50" ref={profileRef}>
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 hover:opacity-60 transition-opacity cursor-pointer"
                >
                  <User className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#fff]" strokeWidth={1.2} />
                </button>
                
                {/* Profile Dropdown Box */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[64px] right-0 w-[200px] bg-white border border-[#E5E5E5] shadow-lg flex flex-col py-2 text-black"
                    >
                      {/* USER NAME RENDER */}
                      {userData?.name && (
                        <div className="px-5 py-3 border-b border-gray-100 mb-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Logged in as</p>
                          <p className="text-[13px] font-bold truncate text-black">{userData.name}</p>
                        </div>
                      )}

                      {/* ADMIN DASHBOARD LINK */}
                      {userData?.role === 'admin' && (
                        <Link 
                          to="/admin/dashboard" 
                          onClick={() => setProfileOpen(false)} 
                          className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] bg-[#F4F4F4] text-[#57663D] hover:bg-[#EAEAEA] transition-colors text-left border-b border-white"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <Link 
                        to="/profile" 
                        onClick={() => setProfileOpen(false)}
                        className="px-5 py-3 text-[11px] font-[500] text-[#000000] uppercase tracking-[0.08em] hover:bg-[#f9f9f9] transition-colors text-left"
                      >
                        View Account
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="px-5 py-3 text-[11px] font-[500] text-red-500 uppercase tracking-[0.08em] hover:bg-[#f9f9f9] transition-colors text-left w-full"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <NavLink 
                to="/login" 
                className="hover:opacity-60 transition-opacity"
                activeClassName="opacity-60"
              >
                <User className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#fff]" strokeWidth={1.2} />
              </NavLink>
            )}
          </div>

          <NavLink 
            to="/cart" 
            className="relative hover:opacity-60 transition-opacity"
            activeClassName="opacity-60"
          >
            <ShoppingBag className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#fff]" strokeWidth={1.2} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#222222] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans shadow-sm">
                {itemCount}
              </span>
            )}
          </NavLink>

        </div>
      </div>
      
      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#E5E5E5] bg-white overflow-hidden absolute w-full top-[64px] left-0 shadow-xl z-40 text-black"
          >
             <div className="container mx-auto px-6 py-10 flex items-center gap-6 max-w-4xl">
               <Search className="w-5 h-5 text-[#222222]/50" />
               <input 
                 type="text" 
                 placeholder="Search for posters..." 
                 className="w-full text-lg outline-none placeholder:text-[#222222]/30 bg-transparent border-b border-[#222222]/10 pb-2 focus:border-black transition-all"
                 autoFocus
               />
               <button onClick={() => setIsSearchOpen(false)}><X className="w-5 h-5 text-[#222222]/50 hover:text-black" /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-white z-[60] h-screen w-full flex flex-col text-black"
          >
            <div className="flex justify-between items-center px-6 border-b border-[#E5E5E5] h-[64px]">
               <span className="font-serif font-bold tracking-[-0.02em] text-[24px] lowercase">muro poster</span>
               <button onClick={() => setMobileOpen(false)}><X className="w-6 h-6 hover:opacity-60" strokeWidth={1.5} /></button>
            </div>
            
            <div className="flex flex-col py-10 px-8 text-[13px] font-[500] text-black uppercase tracking-[0.1em] gap-8 font-sans overflow-y-auto">
              <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <div className="flex flex-col gap-4">
                <span className="text-gray-400 text-[10px] tracking-widest border-b pb-2">PRODUCTS CATEGORIES</span>
                {categories.map((cat) => (
                   <Link 
                     key={cat} 
                     to={`/products?cat=${encodeURIComponent(cat)}`} 
                     onClick={() => setMobileOpen(false)} 
                     className="pl-2 font-[400]"
                   >
                     {cat}
                   </Link>
                ))}
              </div>
              <Link to="/bestsellers" onClick={() => setMobileOpen(false)}>Bestsellers</Link>
              <Link to="/new-arrivals" onClick={() => setMobileOpen(false)}>New Arrivals</Link>
              <Link to="/customisation" onClick={() => setMobileOpen(false)}>Customisation</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)}>About MURO</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
              
              {/* AUTH IN MOBILE MENU */}
              <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-8 mt-4">
                {isLoggedIn ? (
                  <>
                    {/* USER NAME RENDER MOBILE */}
                    {userData?.name && (
                      <p className="text-gray-400 text-[10px] tracking-widest border-b pb-2">
                        Logged in as: <span className="font-bold text-black">{userData.name}</span>
                      </p>
                    )}
                    
                    {/* ADMIN DASHBOARD LINK MOBILE */}
                    {userData?.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="text-[#57663D] font-bold">
                        Admin Dashboard
                      </Link>
                    )}

                    <Link to="/profile" onClick={() => setMobileOpen(false)}>View Account</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-left text-red-500 uppercase">Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Login / Sign Up</Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;