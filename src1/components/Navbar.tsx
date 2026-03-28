import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, ChevronDown, Heart } from "lucide-react";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState<any>(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const defaultCategories = [
    "Motivational & Mindset", "Aesthetic & Vibe", "Love & Connection",
    "Kids – Learning & Confidence", "Calm & Inner Balance",
    "Fandom & Passion", "Kitchen & Dining", "Customization",
  ];
  const [categories, setCategories] = useState<string[]>(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.adminGetCategories();
        const catData = Array.isArray(res) ? res : res?.data || [];
        if (catData.length > 0) setCategories(catData.map((c: any) => c.name));
      } catch (error) {
        console.log("API error, using default categories.", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserData(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
    setUserData(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  // Shared base class for all desktop nav links
 const navBase = "font-montserrat text-[15px] font-medium text-[#111] uppercase tracking-[0.08em] hover:opacity-60 transition-opacity whitespace-nowrap pb-1.5";
  const navActive = "nav-zigzag opacity-100";

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ══════════════════════════════════════════
          ROW 1 — ANNOUNCEMENT BAR
          ══════════════════════════════════════════ */}
      <div className="w-full bg-[#DDD6F0] border-b border-[#CBC2E8]">
        <div className="w-full px-5 md:px-8 xl:px-12 flex items-center justify-between h-9">

          <div className="flex items-center gap-2 font-montserrat text-[11px] text-[#333] font-semibold">
            <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-[2px] shrink-0">
              <rect width="20" height="4.67" y="0"    fill="#FF9933" />
              <rect width="20" height="4.67" y="4.67" fill="#FFFFFF" />
              <rect width="20" height="4.67" y="9.33" fill="#138808" />
              <circle cx="10" cy="7" r="1.8" fill="none" stroke="#000080" strokeWidth="0.4" />
              <circle cx="10" cy="7" r="0.3" fill="#000080" />
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={10 + 0.3 * Math.cos(angle)}
                    y1={7  + 0.3 * Math.sin(angle)}
                    x2={10 + 1.8 * Math.cos(angle)}
                    y2={7  + 1.8 * Math.sin(angle)}
                    stroke="#000080"
                    strokeWidth="0.25"
                  />
                );
              })}
            </svg>
            <span className="uppercase tracking-wider hidden sm:inline">India</span>
            <span className="text-[#999] mx-0.5 hidden sm:inline">|</span>
            <span className="uppercase tracking-wider hidden sm:flex items-center gap-1">
              English <ChevronDown size={10} strokeWidth={2.5} />
            </span>
          </div>

          <p className="mx-auto text-center font-montserrat text-[11px] text-[#333] tracking-wide font-medium">
            Free shipping over ₹999 &nbsp;•&nbsp; Happiness Guarantee &nbsp;•&nbsp; Delivery in 4–7 business days
          </p>

          <div className="hidden md:block w-[140px]" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ROW 2 — LOGO + SEARCH + ICONS
          ══════════════════════════════════════════ */}
      <div className="w-full bg-white border-b border-[#E8E8E8]">
        <div className="w-full px-5 md:px-8 xl:px-12 flex items-center gap-4 h-[70px]">

          <button
            className="lg:hidden hover:opacity-60 transition-opacity shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5 text-black" strokeWidth={1.5} />
          </button>

          <Link
            to="/"
            className="font-coolvetica text-xl md:text-[26px] tracking-tight text-black hover:text-[#57663D] transition-colors whitespace-nowrap uppercase shrink-0 leading-none"
          >
            muro poster
          </Link>

          <div
            className="flex-1 mx-4 md:mx-10 hidden md:flex items-center border border-[#DEDEDE] rounded-full px-5 py-2.5 gap-3 bg-[#F8F8F8] hover:border-[#BBBBBB] transition-colors cursor-text"
            onClick={() => setIsSearchOpen(true)}
          >
            <input
              type="text"
              placeholder="Search product, name, brand..."
              className="w-full bg-transparent font-montserrat text-[13px] text-black outline-none placeholder:text-[#AAAAAA] cursor-text"
              onFocus={() => setIsSearchOpen(true)}
              readOnly
            />
            <Search className="w-4 h-4 text-[#888] shrink-0" strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-4 xl:gap-5 ml-auto shrink-0">

            <button onClick={() => setIsSearchOpen(true)} className="md:hidden hover:opacity-60 transition-opacity">
              <Search className="w-[18px] h-[18px] text-black" strokeWidth={1.3} />
            </button>

            <button className="hidden md:flex hover:opacity-60 transition-opacity">
              <Heart className="w-[18px] h-[18px] text-black" strokeWidth={1.3} />
            </button>

            <div className="relative flex items-center" ref={profileRef}>
              {isLoggedIn ? (
                <>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="hover:opacity-60 transition-opacity">
                    <User className="w-[18px] h-[18px] text-black" strokeWidth={1.3} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-[calc(100%+18px)] right-0 w-[210px] bg-white border border-[#E5E5E5] shadow-xl flex flex-col py-2 text-black z-50"
                      >
                        {userData?.name && (
                          <div className="px-5 py-3 border-b border-gray-100 mb-1">
                            <p className="font-montserrat text-[10px] text-gray-400 uppercase tracking-widest">Logged in as</p>
                            <p className="font-montserrat text-[13px] font-bold truncate">{userData.name}</p>
                          </div>
                        )}
                        {userData?.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-[0.08em] bg-[#F4F4F4] text-[#57663D] hover:bg-[#EAEAEA] transition-colors border-b border-white"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="px-5 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-[#F9F9F9] transition-colors"
                        >
                          View Account
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="px-5 py-3 font-montserrat text-[11px] font-semibold text-red-500 uppercase tracking-[0.08em] hover:bg-[#F9F9F9] transition-colors text-left w-full"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink to="/login" className="hover:opacity-60 transition-opacity" activeClassName="opacity-60">
                  <User className="w-[18px] h-[18px] text-black" strokeWidth={1.3} />
                </NavLink>
              )}
            </div>

            <NavLink to="/cart" className="relative hover:opacity-60 transition-opacity" activeClassName="opacity-60">
              <ShoppingBag className="w-[18px] h-[18px] text-black" strokeWidth={1.3} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#57663D] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </NavLink>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ROW 3 — NAV LINKS (Golden Yellow + Zigzag)
          ══════════════════════════════════════════ */}
      <div className="w-full bg-[#FBDA71] hidden lg:block">
        <nav className="w-full px-5 md:px-8 xl:px-12 flex items-center justify-center gap-5 xl:gap-8 h-[46px]">

          <NavLink to="/" className={navBase} activeClassName={navActive}>
            Home
          </NavLink>

          {/* PRODUCTS DROPDOWN */}
          <div className="relative group h-full flex items-center">
            <NavLink
              to="/products"
              className={`${navBase} flex items-center gap-1`}
              activeClassName={navActive}
            >
              Products
              <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" strokeWidth={3} />
            </NavLink>

            <div className="absolute top-[46px] left-1/2 -translate-x-1/2 w-[300px] bg-white border border-[#E5E5E5] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col py-3 z-50">
              {categories.map((cat) => (
                <NavLink
                  key={cat}
                  to={`/products?cat=${encodeURIComponent(cat)}`}
                  className="px-6 py-2.5 font-montserrat text-[11px] font-semibold text-[#111] uppercase tracking-[0.07em] hover:bg-[#F9F9F9] hover:text-[#57663D] transition-colors border-l-2 border-transparent"
                  activeClassName="border-l-2 border-[#57663D] bg-[#F9F9F9] text-[#57663D]"
                >
                  {cat}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/bestsellers" className={navBase} activeClassName={navActive}>
            Bestsellers
          </NavLink>

          <NavLink to="/new-arrivals" className={navBase} activeClassName={navActive}>
            New Arrivals
          </NavLink>

          <NavLink to="/customisation" className={navBase} activeClassName={navActive}>
            Customisation
          </NavLink>

          <NavLink to="/about" className={navBase} activeClassName={navActive}>
            About MURO
          </NavLink>

          <NavLink to="/contact" className={navBase} activeClassName={navActive}>
            Contact
          </NavLink>

        </nav>
      </div>

      {/* ══════════════════════════════════════════
          SEARCH OVERLAY
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#EBEBEB] bg-white overflow-hidden absolute w-full left-0 shadow-2xl z-40"
          >
            <div className="container mx-auto px-6 py-10 flex items-center gap-5 max-w-4xl">
              <Search className="w-5 h-5 text-[#999] shrink-0" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search for posters, artists, styles..."
                className="w-full font-montserrat text-[17px] text-black outline-none placeholder:text-[#CCCCCC] bg-transparent border-b border-[#E0E0E0] pb-2 focus:border-black transition-all"
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5 text-[#999] hover:text-black transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MOBILE MENU
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="lg:hidden fixed inset-0 bg-white z-[60] h-screen w-full flex flex-col"
          >
            <div className="flex justify-between items-center px-6 border-b border-[#EBEBEB] h-[64px] bg-[#FBDA71]">
              <span className="font-coolvetica font-black text-[22px] uppercase text-black">muro poster</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6 text-black hover:opacity-60" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col py-8 px-8 font-montserrat text-[12px] font-black text-black uppercase tracking-[0.08em] gap-7 overflow-y-auto">
              <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-[#AAAAAA] tracking-widest border-b border-[#F0F0F0] pb-2 font-medium">
                  Products Categories
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?cat=${encodeURIComponent(cat)}`}
                    onClick={() => setMobileOpen(false)}
                    className="pl-2 font-semibold text-[12px]"
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

              <div className="border-t border-[#F0F0F0] pt-6 flex flex-col gap-6 mt-2">
                {isLoggedIn ? (
                  <>
                    {userData?.name && (
                      <p className="text-[10px] text-[#AAAAAA] tracking-widest border-b border-[#F0F0F0] pb-3">
                        Logged in as: <span className="font-black text-black">{userData.name}</span>
                      </p>
                    )}
                    {userData?.role === "admin" && (
                      <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="text-[#57663D]">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>View Account</Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="text-left text-red-500"
                    >
                      Logout
                    </button>
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
