import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  ChevronRight,
  Heart,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { API } from "@/services/api";
import { cartApi } from "@/services/cartApi";
import logoImg from "@/assets/logo.png";

type CategoryItem = {
  id?: string | number;
  category_id?: string | number;
  name: string;
  subcategories?: SubcategoryItem[];
};

type SubcategoryItem = {
  id?: string | number;
  subcategory_id?: string | number;
  category_id?: string | number;
  name: string;
};

type CategoryTreeItem = {
  key: string;
  id: string;
  name: string;
  subcategories: SubcategoryItem[];
};

const defaultCategoryTree: CategoryTreeItem[] = [
  {
    key: "motivational-and-mindset",
    id: "motivational-and-mindset",
    name: "Motivational & Mindset",
    subcategories: [],
  },
  {
    key: "aesthetic-and-vibe",
    id: "aesthetic-and-vibe",
    name: "Aesthetic & Vibe",
    subcategories: [],
  },
  {
    key: "love-and-connection",
    id: "love-and-connection",
    name: "Love & Connection",
    subcategories: [],
  },
  {
    key: "kids-learning-and-confidence",
    id: "kids-learning-and-confidence",
    name: "Kids – Learning & Confidence",
    subcategories: [],
  },
];

const getCategoryId = (category: CategoryItem) => {
  return String(category.id ?? category.category_id ?? category.name);
};

const getSubcategoryId = (subcategory: SubcategoryItem) => {
  return String(
    subcategory.id ?? subcategory.subcategory_id ?? subcategory.name
  );
};

const normalizeCategoryTree = (
  categories: CategoryItem[],
  subcategories: SubcategoryItem[]
): CategoryTreeItem[] => {
  const seenCategories = new Set<string>();

  return categories
    .filter((category) => {
      const name = String(category.name || "").trim();
      const key = name.toUpperCase();

      if (!name || seenCategories.has(key)) return false;

      seenCategories.add(key);
      return true;
    })
    .map((category) => {
      const categoryId = getCategoryId(category);

      const nestedSubcategories = Array.isArray(category.subcategories)
        ? category.subcategories
        : [];

      const externalSubcategories = subcategories.filter((subcategory) => {
        return String(subcategory.category_id) === categoryId;
      });

      const sourceSubcategories =
        nestedSubcategories.length > 0
          ? nestedSubcategories
          : externalSubcategories;

      const seenSubcategories = new Set<string>();

      const mergedSubcategories = sourceSubcategories.filter((subcategory) => {
        const name = String(subcategory.name || "").trim();
        const key = name.toUpperCase();

        if (!name || key === String(category.name || "").trim().toUpperCase()) {
          return false;
        }

        if (seenSubcategories.has(key)) return false;

        seenSubcategories.add(key);
        return true;
      });

      return {
        key: categoryId,
        id: categoryId,
        name: category.name,
        subcategories: mergedSubcategories,
      };
    });
};

const Navbar = () => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredCategoryKey, setHoveredCategoryKey] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  const [cartCount, setCartCount] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [categoryTree, setCategoryTree] =
    useState<CategoryTreeItem[]>(defaultCategoryTree);

  const activeHoveredCategory = useMemo(() => {
    if (!hoveredCategoryKey) return null;

    return categoryTree.find((category) => category.key === hoveredCategoryKey) || null;
  }, [categoryTree, hoveredCategoryKey]);

  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await cartApi.getCart();

      const count = Number(
        res?.data?.summary?.item_count ??
          res?.summary?.item_count ??
          res?.data?.item_count ??
          0
      );

      setCartCount(Number.isFinite(count) && count > 0 ? count : 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [catRes, subcatRes] = await Promise.all([
          API.adminGetCategories().catch(() => []),
          API.adminGetSubcategories().catch(() => []),
        ]);

        const catData: CategoryItem[] = Array.isArray(catRes)
          ? catRes
          : catRes?.data || [];

        const subcatData: SubcategoryItem[] = Array.isArray(subcatRes)
          ? subcatRes
          : subcatRes?.data || [];

        if (catData.length > 0) {
          const tree = normalizeCategoryTree(catData, subcatData);
          setCategoryTree(tree);
          setHoveredCategoryKey("");
        }
      } catch (error) {
        console.log("Category API error, using default categories.", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ item_count?: number }>;
      const incomingCount = customEvent?.detail?.item_count;

      if (typeof incomingCount === "number") {
        setCartCount(incomingCount > 0 ? incomingCount : 0);
      } else {
        fetchCartCount();
      }
    };

    window.addEventListener("muro_cart_updated", handleCartUpdated);

    return () => {
      window.removeEventListener("muro_cart_updated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(!!token);
      setUserData(getSavedUser());

      if (token) {
        fetchCartCount();
      } else {
        setCartCount(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("muro_auth_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("muro_auth_updated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchCartCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
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
    setCartCount(0);
    setProfileOpen(false);

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("muro_auth_updated"));
    window.dispatchEvent(
      new CustomEvent("muro_cart_updated", {
        detail: {
          item_count: 0,
        },
      })
    );

    navigate("/login");
  };

  const navBase =
    "font-montserrat text-[11px] xl:text-[12px] font-medium text-black uppercase tracking-widest hover:text-[#006039] transition-colors whitespace-nowrap";

  const navActive = "text-[#006039]";

  const displayCartCount = cartCount > 99 ? "99+" : cartCount;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden sm:block w-full bg-[#1C1C1C] border-b border-white/10">
        <div className="w-full px-5 md:px-8 xl:px-12 flex items-center justify-between h-9">
          <div className="flex items-center gap-2 font-montserrat text-[11px] text-white font-semibold">
            <svg
              width="20"
              height="14"
              viewBox="0 0 20 14"
              className="rounded-[2px] shrink-0"
            >
              <rect width="20" height="4.67" y="0" fill="#FF9933" />
              <rect width="20" height="4.67" y="4.67" fill="#FFFFFF" />
              <rect width="20" height="4.67" y="9.33" fill="#138808" />
              <circle
                cx="10"
                cy="7"
                r="1.8"
                fill="none"
                stroke="#000080"
                strokeWidth="0.4"
              />
              <circle cx="10" cy="7" r="0.3" fill="#000080" />
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15 * Math.PI) / 180;

                return (
                  <line
                    key={i}
                    x1={10 + 0.3 * Math.cos(angle)}
                    y1={7 + 0.3 * Math.sin(angle)}
                    x2={10 + 1.8 * Math.cos(angle)}
                    y2={7 + 1.8 * Math.sin(angle)}
                    stroke="#000080"
                    strokeWidth="0.25"
                  />
                );
              })}
            </svg>

            <span className="uppercase tracking-wider">India</span>
            <span className="mx-0.5">|</span>
            <span className="uppercase tracking-wider flex items-center gap-1">
              English <ChevronDown size={10} strokeWidth={2.5} />
            </span>
          </div>

          <p className="mx-auto text-center font-montserrat text-[11px] text-white tracking-wide font-medium">
            Free shipping over ₹999 &nbsp;•&nbsp; Happiness Guarantee
            &nbsp;•&nbsp; Delivery in 4–7 business days
          </p>

          <div className="w-[140px]" />
        </div>
      </div>

      <div className="w-full bg-[#F0EEE9] border-b border-[#1C1C1C]/10">
        <div className="w-full px-5 md:px-8 xl:px-12 flex items-center justify-between h-[80px]">
          <div className="flex items-center gap-4 shrink-0 lg:w-[280px]">
            <button
              type="button"
              className="lg:hidden hover:opacity-60 transition-opacity shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-black" strokeWidth={1.5} />
            </button>

            <Link to="/" className="inline-flex items-center shrink-0">
              <img
                src={logoImg}
                alt="MURO Poster"
                className="h-11 md:h-12 w-auto max-w-[170px] object-contain"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 justify-center items-center gap-5 xl:gap-8">
            <NavLink to="/" className={navBase} activeClassName={navActive}>
              Home
            </NavLink>

            <div
              className="relative group h-[80px] flex items-center"
              onMouseEnter={() => setHoveredCategoryKey("")}
              onMouseLeave={() => setHoveredCategoryKey("")}
            >
              <NavLink
                to="/products"
                className={`${navBase} flex items-center gap-1`}
                activeClassName={navActive}
              >
                Posters
                <ChevronDown
                  size={12}
                  className="group-hover:rotate-180 transition-transform duration-300"
                  strokeWidth={2.5}
                />
              </NavLink>

              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[310px] bg-white border border-[#E5E5E5] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col py-3 z-50 text-black rounded-b-[18px]">
                {categoryTree.map((cat) => {
                  const isActive = hoveredCategoryKey === cat.key;

                  return (
                    <div
                      key={cat.key}
                      className="relative"
                      onMouseEnter={() => setHoveredCategoryKey(cat.key)}
                    >
                      <NavLink
                        to={`/products?cat=${encodeURIComponent(cat.name)}`}
                        className={`px-6 py-3 font-montserrat text-[11px] font-semibold text-[#111] uppercase tracking-[0.07em] hover:bg-[#F0EEE9] hover:text-[#006039] transition-colors border-l-2 flex items-center justify-between gap-3 ${
                          isActive
                            ? "border-[#006039] bg-[#F0EEE9] text-[#006039]"
                            : "border-transparent"
                        }`}
                        activeClassName="border-[#006039] bg-[#F0EEE9] text-[#006039]"
                      >
                        <span>{cat.name}</span>

                        {cat.subcategories.length > 0 && (
                          <ChevronRight size={13} strokeWidth={2.4} />
                        )}
                      </NavLink>
                    </div>
                  );
                })}

                {activeHoveredCategory && activeHoveredCategory.subcategories.length > 0 && (
                  <div className="absolute left-[calc(100%-1px)] top-0 w-[290px] bg-white border border-[#E5E5E5] shadow-xl rounded-br-[18px] overflow-hidden py-3">
                    <div className="px-6 pb-2 mb-2 border-b border-[#F0F0F0]">
                      <p className="font-montserrat text-[10px] uppercase tracking-[0.18em] text-[#1C1C1C]/45 font-bold">
                        {activeHoveredCategory.name}
                      </p>
                    </div>

                    {activeHoveredCategory.subcategories.map((subcat) => (
                      <NavLink
                        key={getSubcategoryId(subcat)}
                        to={`/products?cat=${encodeURIComponent(
                          activeHoveredCategory.name
                        )}&subcat=${encodeURIComponent(subcat.name)}`}
                        className="block px-6 py-2.5 font-montserrat text-[11px] font-medium text-[#111] uppercase tracking-[0.07em] hover:bg-[#F0EEE9] hover:text-[#006039] transition-colors border-l-2 border-transparent"
                        activeClassName="border-l-2 border-[#006039] bg-[#F0EEE9] text-[#006039]"
                      >
                        {subcat.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <NavLink
              to="/bestsellers"
              className={navBase}
              activeClassName={navActive}
            >
              Bestsellers
            </NavLink>

            <NavLink
              to="/new-arrivals"
              className={navBase}
              activeClassName={navActive}
            >
              CutOuts
            </NavLink>

            <NavLink
              to="/customisation"
              className={navBase}
              activeClassName={navActive}
            >
              Postcard
            </NavLink>

            <NavLink to="/about" className={navBase} activeClassName={navActive}>
              About MURO
            </NavLink>

            <NavLink
              to="/contact"
              className={navBase}
              activeClassName={navActive}
            >
              Contact
            </NavLink>
          </nav>

          <div className="flex items-center justify-end gap-3 xl:gap-5 shrink-0 lg:w-[280px]">
            <div
              className="hidden md:flex items-center border border-[#1C1C1C]/10 rounded-full px-4 py-2 gap-2 bg-white/55 hover:border-[#006039]/40 transition-colors cursor-text w-[160px] xl:w-[200px]"
              onClick={() => setIsSearchOpen(true)}
            >
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent font-montserrat text-[11px] text-black outline-none placeholder:text-[#1C1C1C]/40 cursor-text"
                onFocus={() => setIsSearchOpen(true)}
                readOnly
              />
              <Search
                className="w-3.5 h-3.5 text-[#1C1C1C]/55 shrink-0"
                strokeWidth={1.8}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden hover:opacity-60 transition-opacity"
              aria-label="Open search"
            >
              <Search
                className="w-[18px] h-[18px] text-black"
                strokeWidth={1.3}
              />
            </button>

            <button
              type="button"
              className="hidden md:flex hover:text-[#006039] transition-colors"
              aria-label="Wishlist"
            >
              <Heart
                className="w-[18px] h-[18px] text-current"
                strokeWidth={1.3}
              />
            </button>

            <div className="relative flex items-center" ref={profileRef}>
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="hover:text-[#006039] transition-colors"
                    aria-label="Open profile"
                  >
                    <User
                      className="w-[18px] h-[18px] text-current"
                      strokeWidth={1.3}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-[calc(100%+18px)] right-0 w-[210px] bg-white border border-[#E5E5E5] shadow-xl flex flex-col py-2 text-black z-50 rounded-[18px] overflow-hidden"
                      >
                        {userData?.name && (
                          <div className="px-5 py-3 border-b border-gray-100 mb-1">
                            <p className="font-montserrat text-[10px] text-gray-400 uppercase tracking-widest">
                              Logged in as
                            </p>
                            <p className="font-montserrat text-[13px] font-bold truncate">
                              {userData.name}
                            </p>
                          </div>
                        )}

                        {userData?.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-[0.08em] bg-[#F0EEE9] text-[#006039] hover:bg-[#E9E4DA] transition-colors border-b border-white"
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
                          type="button"
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
                <NavLink
                  to="/login"
                  className="hover:text-[#006039] transition-colors"
                  activeClassName="text-[#006039]"
                >
                  <User
                    className="w-[18px] h-[18px] text-current"
                    strokeWidth={1.3}
                  />
                </NavLink>
              )}
            </div>

            <NavLink
              to="/cart"
              className="relative hover:text-[#006039] transition-colors"
              activeClassName="text-[#006039]"
              aria-label={`Cart with ${cartCount} item${
                cartCount === 1 ? "" : "s"
              }`}
            >
              <ShoppingBag
                className="w-[18px] h-[18px] text-current"
                strokeWidth={1.3}
              />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[17px] h-[17px] px-[4px] rounded-full bg-[#006039] text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                  {displayCartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>

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
              <Search
                className="w-5 h-5 text-[#999] shrink-0"
                strokeWidth={1.5}
              />

              <input
                type="text"
                placeholder="Search for posters, artists, styles..."
                className="w-full font-montserrat text-[17px] text-black outline-none placeholder:text-[#CCCCCC] bg-transparent border-b border-[#E0E0E0] pb-2 focus:border-black transition-all"
                autoFocus
              />

              <button type="button" onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5 text-[#999] hover:text-black transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            className="lg:hidden fixed inset-0 bg-white z-[60] h-screen w-full flex flex-col"
          >
            <div className="flex justify-between items-center px-6 border-b border-[#EBEBEB] h-[70px] bg-[#F0EEE9]">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center"
              >
                <img
                  src={logoImg}
                  alt="MURO Poster"
                  className="h-11 w-auto max-w-[160px] object-contain"
                />
              </Link>

              <button type="button" onClick={() => setMobileOpen(false)}>
                <X
                  className="w-6 h-6 text-black hover:opacity-60"
                  strokeWidth={1.5}
                />
              </button>
            </div>

            <div className="flex flex-col py-8 px-8 font-montserrat text-[12px] font-black text-black uppercase tracking-[0.08em] gap-7 overflow-y-auto">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Home
              </Link>

              <div className="flex flex-col gap-3">
                <Link
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className="text-[10px] text-[#AAAAAA] tracking-widest border-b border-[#F0F0F0] pb-2 font-medium"
                >
                  Products Categories
                </Link>

                {categoryTree.map((cat) => (
                  <div key={cat.key} className="flex flex-col gap-2">
                    <Link
                      to={`/products?cat=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileOpen(false)}
                      className="pl-2 font-semibold text-[12px]"
                    >
                      {cat.name}
                    </Link>

                    {cat.subcategories.length > 0 && (
                      <div className="flex flex-col gap-2 pl-5">
                        {cat.subcategories.map((subcat) => (
                          <Link
                            key={getSubcategoryId(subcat)}
                            to={`/products?cat=${encodeURIComponent(
                              cat.name
                            )}&subcat=${encodeURIComponent(subcat.name)}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-[10px] text-[#1C1C1C]/55 font-semibold tracking-widest"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Link to="/bestsellers" onClick={() => setMobileOpen(false)}>
                Bestsellers
              </Link>

              <Link to="/new-arrivals" onClick={() => setMobileOpen(false)}>
                New Arrivals
              </Link>

              <Link to="/customisation" onClick={() => setMobileOpen(false)}>
                Customisation
              </Link>

              <Link to="/about" onClick={() => setMobileOpen(false)}>
                About MURO
              </Link>

              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>

              <Link to="/cart" onClick={() => setMobileOpen(false)}>
                Cart {cartCount > 0 ? `(${cartCount})` : ""}
              </Link>

              <div className="border-t border-[#F0F0F0] pt-6 flex flex-col gap-6 mt-2">
                {isLoggedIn ? (
                  <>
                    {userData?.name && (
                      <p className="text-[10px] text-[#AAAAAA] tracking-widest border-b border-[#F0F0F0] pb-3">
                        Logged in as:{" "}
                        <span className="font-black text-black">
                          {userData.name}
                        </span>
                      </p>
                    )}

                    {userData?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="text-[#006039]"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <Link to="/profile" onClick={() => setMobileOpen(false)}>
                      View Account
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="text-left text-red-500"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Login / Sign Up
                  </Link>
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
