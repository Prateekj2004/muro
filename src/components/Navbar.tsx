import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

type ActiveOffer = { label: string; discount_percent: number };

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

let navbarCartCountLoadedOnce = false;

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
  const cartCountFetchingRef = useRef(false);

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

  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);

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

    if (cartCountFetchingRef.current) return;

    cartCountFetchingRef.current = true;

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
    } finally {
      cartCountFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const fetchActiveOffer = async () => {
      try {
        const response = await fetch(`${API_BASE}/offers/active`);
        const json = await response.json().catch(() => null);
        const rows = Array.isArray(json?.data) ? json.data : json?.data?.items || [];
        setActiveOffer(rows[0] || null);
      } catch (error) {
        console.error("Failed to fetch active offer:", error);
        setActiveOffer(null);
      }
    };

    fetchActiveOffer();
  }, []);

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
    if (!navbarCartCountLoadedOnce) {
      navbarCartCountLoadedOnce = true;
      fetchCartCount();
    }

    const handleCartUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        item_count?: number;
        item_delta?: number;
        redirect_to_cart?: boolean;
      }>;
      const incomingCount = customEvent?.detail?.item_count;
      const incomingDelta = customEvent?.detail?.item_delta;

      if (typeof incomingCount === "number") {
        setCartCount(incomingCount > 0 ? incomingCount : 0);
      } else if (typeof incomingDelta === "number") {
        setCartCount((prev) => Math.max(0, prev + incomingDelta));
      }

      if (customEvent?.detail?.redirect_to_cart) {
        navigate("/cart");
      }
    };

    window.addEventListener("muro_cart_updated", handleCartUpdated);

    return () => {
      window.removeEventListener("muro_cart_updated", handleCartUpdated);
    };
  }, [navigate]);

  useEffect(() => {
    const handleOpenCartPage = () => {
      navigate("/cart");
    };

    window.addEventListener("muro_open_cart_drawer", handleOpenCartPage);

    return () => {
      window.removeEventListener("muro_open_cart_drawer", handleOpenCartPage);
    };
  }, [navigate]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(!!token);
      setUserData(getSavedUser());

      if (token) {
        if (!navbarCartCountLoadedOnce) {
          navbarCartCountLoadedOnce = true;
          fetchCartCount();
        }
      } else {
        navbarCartCountLoadedOnce = false;
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
    navbarCartCountLoadedOnce = false;
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
    "font-montserrat text-[14px] font-medium text-[#101010] hover:text-[#006039] transition-colors whitespace-nowrap";

  const navActive = "text-[#006039]";

  const displayCartCount = cartCount > 99 ? "99+" : cartCount;
  const discount = Number(activeOffer?.discount_percent || 0);
  const announcementText =
    activeOffer && discount > 0
      ? `${activeOffer.label} – ${discount}% off all prints`
      : "Summer Campaign – 30% off all prints";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl">
      <div className="flex h-[30px] w-full items-center justify-center bg-[#ECFF66] px-4 text-center font-montserrat text-[14px] font-semibold text-black md:text-[16px]">
        {announcementText}
      </div>

      <div className="w-full border-b border-[#101010]/10 bg-white/95">
        <div className="relative mx-auto flex h-[80px] w-full max-w-[1540px] items-center justify-between px-4 sm:px-5 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-5 md:gap-7">
           
            <nav className="hidden items-center gap-5 text-[14px] lg:flex xl:gap-7">
              <div
                className="group relative flex h-[80px] items-center"
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
                    className="transition-transform duration-300 group-hover:rotate-180"
                    strokeWidth={2.3}
                  />
                </NavLink>

                <div className="invisible absolute left-0 top-[80px] z-50 flex w-[310px] flex-col rounded-b-[18px] border border-[#E5E5E5] bg-white py-3 text-black opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
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
                          className={`flex items-center justify-between gap-3 border-l-2 px-6 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.07em] text-[#111] transition-colors hover:bg-[#F4F4F2] hover:text-[#006039] ${
                            isActive
                              ? "border-[#006039] bg-[#F4F4F2] text-[#006039]"
                              : "border-transparent"
                          }`}
                          activeClassName="border-[#006039] bg-[#F4F4F2] text-[#006039]"
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
                    <div className="absolute left-[calc(100%-1px)] top-0 w-[290px] overflow-hidden rounded-br-[18px] border border-[#E5E5E5] bg-white py-3 shadow-xl">
                      <div className="mb-2 border-b border-[#F0F0F0] px-6 pb-2">
                        <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C1C1C]/45">
                          {activeHoveredCategory.name}
                        </p>
                      </div>

                      {activeHoveredCategory.subcategories.map((subcat) => (
                        <NavLink
                          key={getSubcategoryId(subcat)}
                          to={`/products?cat=${encodeURIComponent(
                            activeHoveredCategory.name
                          )}&subcat=${encodeURIComponent(subcat.name)}`}
                          className="block border-l-2 border-transparent px-6 py-2.5 font-montserrat text-[11px] font-medium uppercase tracking-[0.07em] text-[#111] transition-colors hover:bg-[#F4F4F2] hover:text-[#006039]"
                          activeClassName="border-l-2 border-[#006039] bg-[#F4F4F2] text-[#006039]"
                        >
                          {subcat.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <NavLink to="/bestsellers" className={navBase} activeClassName={navActive}>
                Bestsellers
              </NavLink>

              <NavLink to="/cutouts" className={navBase} activeClassName={navActive}>
                CutOuts
              </NavLink>

              <NavLink to="/postcards" className={navBase} activeClassName={navActive}>
                Postcard
              </NavLink>

              <NavLink to="/about" className={navBase} activeClassName={navActive}>
                About MURO
              </NavLink>
            </nav>
          </div>

          <Link
            to="/"
            className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            aria-label="MURO Poster home"
          >
            <img
              src={logoImg}
              alt="MURO Poster"
              className="h-10 w-auto max-w-[145px] object-contain md:h-9 md:max-w-[227px]"
           style={{ height: '5.5rem' }} />
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 md:gap-5">
            <div
              className="hidden h-[44px] w-[210px] cursor-text items-center justify-between rounded-full border border-[#101010]/20 bg-white px-5 text-[13px] text-[#77736B] transition-colors hover:border-[#101010]/45 md:flex xl:w-[250px]"
              onClick={() => setIsSearchOpen(true)}
            >
              <span className="font-montserrat text-[13px] text-[#77736B]">
                Search posters
              </span>
              <Search className="h-4 w-4 shrink-0 text-[#101010]" strokeWidth={1.7} />
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F2] md:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-[#101010]" strokeWidth={1.7} />
            </button>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F2] hover:text-[#006039] md:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-current" strokeWidth={1.7} />
            </button>

            <div className="relative flex items-center" ref={profileRef}>
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F2] hover:text-[#006039]"
                    aria-label="Open profile"
                  >
                    <User className="h-5 w-5 text-current" strokeWidth={1.7} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-[calc(100%+18px)] z-50 flex w-[220px] flex-col overflow-hidden rounded-[18px] border border-[#E5E5E5] bg-white py-2 text-black shadow-xl"
                      >
                        {userData?.name && (
                          <div className="mb-1 border-b border-gray-100 px-5 py-3">
                            <p className="font-montserrat text-[10px] uppercase tracking-widest text-gray-400">
                              Logged in as
                            </p>
                            <p className="truncate font-montserrat text-[13px] font-bold">
                              {userData.name}
                            </p>
                          </div>
                        )}

                        {userData?.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="border-b border-white bg-[#F4F4F2] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-[0.08em] text-[#006039] transition-colors hover:bg-[#ECE9E1]"
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="px-5 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-[#F9F9F9]"
                        >
                          View Account
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full px-5 py-3 text-left font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-red-500 transition-colors hover:bg-[#F9F9F9]"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F2] hover:text-[#006039]"
                  activeClassName="text-[#006039]"
                >
                  <User className="h-5 w-5 text-current" strokeWidth={1.7} />
                </NavLink>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F2] hover:text-[#006039]"
              aria-label={`Open cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-5 w-5 text-current" strokeWidth={1.7} />

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#006039] px-[4px] text-[9px] font-bold leading-none text-white shadow-sm">
                  {displayCartCount}
                </span>
              )}
            </button>
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
            className="absolute left-0 z-40 w-full overflow-hidden border-t border-[#EBEBEB] bg-white shadow-2xl"
          >
            <div className="mx-auto flex max-w-4xl items-center gap-5 px-6 py-10">
              <Search className="h-5 w-5 shrink-0 text-[#999]" strokeWidth={1.5} />

              <input
                type="text"
                placeholder="Search for posters, artists, styles..."
                className="w-full border-b border-[#E0E0E0] bg-transparent pb-2 font-montserrat text-[17px] text-black outline-none transition-all placeholder:text-[#CCCCCC] focus:border-black"
                autoFocus
              />

              <button type="button" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <X className="h-5 w-5 text-[#999] transition-colors hover:text-black" />
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
            className="fixed inset-0 z-[60] flex h-screen w-full flex-col bg-white lg:hidden"
          >
            <div className="flex h-[70px] items-center justify-between border-b border-[#EBEBEB] bg-[#F4F4F2] px-6">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center"
              >
                <img
                  src={logoImg}
                  alt="MURO Poster"
                  className="h-9 w-auto max-w-[140px] object-contain"
style={{"height":"5.5rem"}} />
              </Link>

              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6 text-black hover:opacity-60" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col gap-7 overflow-y-auto px-8 py-8 font-montserrat text-[14px] font-black uppercase tracking-[0.08em] text-black">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Home
              </Link>

              <div className="flex flex-col gap-3">
                <Link
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-[#F0F0F0] pb-2 text-[14px] font-medium tracking-widest text-[#AAAAAA]"
                >
                  Product Categories
                </Link>

                {categoryTree.map((cat) => (
                  <div key={cat.key} className="flex flex-col gap-2">
                    <Link
                      to={`/products?cat=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileOpen(false)}
                      className="pl-2 text-[14px] font-semibold"
                    >
                      {cat.name}
                    </Link>

                    {cat.subcategories.length > 0 && (
                      <div className="flex flex-col gap-2 pl-5">
                        {cat.subcategories.map((subcat) => (
                          <Link
                            key={getSubcategoryId(subcat)}
                            to={`/products?cat=${encodeURIComponent(cat.name)}&subcat=${encodeURIComponent(subcat.name)}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-[10px] font-semibold tracking-widest text-[#1C1C1C]/55"
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

              <Link to="/cutouts" onClick={() => setMobileOpen(false)}>
                CutOuts
              </Link>

              <Link to="/postcards" onClick={() => setMobileOpen(false)}>
                Postcard
              </Link>

              <Link to="/about" onClick={() => setMobileOpen(false)}>
                About MURO
              </Link>

              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/cart");
                }}
                className="text-left"
              >
                Cart {cartCount > 0 ? `(${cartCount})` : ""}
              </button>

              <div className="mt-2 flex flex-col gap-6 border-t border-[#F0F0F0] pt-6">
                {isLoggedIn ? (
                  <>
                    {userData?.name && (
                      <p className="border-b border-[#F0F0F0] pb-3 text-[10px] tracking-widest text-[#AAAAAA]">
                        Logged in as: <span className="font-black text-black">{userData.name}</span>
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
