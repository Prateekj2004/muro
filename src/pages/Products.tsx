import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, SlidersHorizontal } from "lucide-react";
import { API } from "@/services/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";
const SITE_ORIGIN = "https://muroposter.com";

type ActiveOffer = { label: string; discount_percent: number };

const serifFont = "Georgia, 'Times New Roman', serif";

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";

  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (cleanPath.startsWith("images/") || cleanPath.startsWith("assets/")) {
    return `/${cleanPath}`;
  }

  if (cleanPath.includes("api/public/uploads")) {
    return `${SITE_ORIGIN}/${cleanPath}`;
  }

  if (cleanPath.includes("uploads/product")) {
    return `${SITE_ORIGIN}/${cleanPath}`;
  }

  return `${SITE_ORIGIN}/uploads/product/${cleanPath}`;
};

const safeNumber = (value?: string | number) => {
  const cleanValue = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const num = Number(cleanValue);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

const formatPrice = (value?: string | number) => {
  const numericValue = safeNumber(value) || 500;
  return `₹${numericValue.toLocaleString("en-IN")}`;
};

const toTitleCase = (value?: string) => {
  const text = String(value || "").trim();

  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getUploadedProductImage = (product: any) => {
  const imageRows = Array.isArray(product?.product_images)
    ? product.product_images
    : Array.isArray(product?.images)
    ? product.images
    : [];

  const firstUploaded = imageRows
    .slice()
    .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .find((img: any) => Boolean(img.image_url || img.url || img.file_url || img.path));

  return (
    firstUploaded?.image_url ||
    firstUploaded?.url ||
    firstUploaded?.file_url ||
    firstUploaded?.path ||
    product?.main_poster_url ||
    product?.zoom_in_url ||
    product?.image_url ||
    product?.wall_poster_url ||
    ""
  );
};

const getLowestProductPrice = (product: any) => {
  const sizeRows = Array.isArray(product?.size_prices)
    ? product.size_prices
    : Array.isArray(product?.sizes)
    ? product.sizes
    : [];

  const prices = sizeRows.map((size: any) => safeNumber(size.price)).filter((price: number) => price > 0);

  if (prices.length > 0) {
    return Math.min(...prices);
  }

  return safeNumber(product?.price || product?.base_price) || 500;
};

const getOfferPrice = (price: number, offer?: ActiveOffer | null) => {
  const discount = safeNumber(offer?.discount_percent);

  if (!offer || discount <= 0 || price <= 0) {
    return { originalPrice: price, finalPrice: price, hasOffer: false };
  }

  return {
    originalPrice: price,
    finalPrice: Math.max(0, Math.round((price - (price * discount) / 100) * 100) / 100),
    hasOffer: true,
  };
};

const fetchActiveOffer = async (): Promise<ActiveOffer | null> => {
  try {
    const response = await fetch(`${API_BASE}/offers/active`);
    const json = await response.json().catch(() => null);
    const rows = Array.isArray(json?.data) ? json.data : json?.data?.items || [];
    return rows[0] || null;
  } catch (error) {
    console.error("Failed to fetch active offer:", error);
    return null;
  }
};

const getProductId = (product: any) => {
  return product?.id || product?.product_id || product?.productId;
};

const ProductCard = ({ product, activeOffer, index }: { product: any; activeOffer: ActiveOffer | null; index: number }) => {
  const productImage = getUploadedProductImage(product);
  const productId = getProductId(product);
  const productPrice = getLowestProductPrice(product);
  const currentOffer = (product.active_offer || activeOffer) as ActiveOffer | null;
  const offerPrice = getOfferPrice(productPrice, currentOffer);
  const title = product.title || product.name || "Product";
  const brand = product.category || product.subcategory || "Muro Poster";

  if (!productImage || !productId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.25) }}
    >
      <Link to={`/product/${productId}`} state={{ productData: product }} className="group block w-full">
        <article className="w-full">
          <div className="relative flex aspect-[0.78] w-full items-center justify-center overflow-hidden rounded-[13px] bg-[#F3F3F1] px-8 py-9 md:px-10 md:py-11">
            <button
              type="button"
              aria-label="Add to wishlist"
              onClick={(event) => event.preventDefault()}
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#111]/70 transition-colors hover:bg-white hover:text-[#006039]"
            >
              <Heart className="h-5 w-5" strokeWidth={1.45} />
            </button>

            <img
              src={getFullImageUrl(productImage)}
              alt={title}
              className="max-h-full max-w-full object-contain drop-shadow-[0_14px_16px_rgba(0,0,0,0.10)] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              loading="lazy"
            />
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 px-1">
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-none text-[#A19D96]">{brand}</p>
              <h3 className="mt-2 min-h-[38px] text-[14px] font-medium leading-snug text-[#101010] md:text-[15px]">{title}</h3>
            </div>

            <div className="text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-[13px] font-semibold text-[#101010] md:text-[14px]">{formatPrice(offerPrice.finalPrice)}</span>
                {offerPrice.hasOffer && <span className="text-[12px] text-[#A19D96] line-through">{formatPrice(offerPrice.originalPrice)}</span>}
              </div>

              {currentOffer && offerPrice.hasOffer && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#006039]">{currentOffer.label}</p>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("cat")?.toUpperCase() || "ALL";
  const urlSubcategory = searchParams.get("subcat")?.toUpperCase() || "ALL";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(urlSubcategory);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 40;

  useEffect(() => {
    if (urlCategory !== selectedCategory || urlSubcategory !== selectedSubCategory) {
      setSelectedCategory(urlCategory);
      setSelectedSubCategory(urlSubcategory);
      setCurrentPage(1);
    }
  }, [urlCategory, urlSubcategory, selectedCategory, selectedSubCategory]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      try {
        const [prodRes, catRes, subcatRes, offerRes] = await Promise.all([
          API.getProducts().catch(() => []),
          API.adminGetCategories().catch(() => []),
          API.adminGetSubcategories().catch(() => []),
          fetchActiveOffer(),
        ]);

        setProducts(Array.isArray(prodRes) ? prodRes : prodRes?.data?.items || prodRes?.data || []);
        setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);
        setSubcategories(Array.isArray(subcatRes) ? subcatRes : subcatRes?.data || []);
        setActiveOffer(offerRes);
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

    if (cat === "ALL") {
      setSearchParams({});
    } else {
      setSearchParams({ cat: cat.toLowerCase() });
    }
  };

  const handleSubCategoryClick = (subCat: string) => {
    setSelectedSubCategory(subCat);
    setCurrentPage(1);

    const params: Record<string, string> = {};

    if (selectedCategory !== "ALL") {
      params.cat = selectedCategory.toLowerCase();
    }

    if (subCat !== "ALL") {
      params.subcat = subCat.toLowerCase();
    }

    setSearchParams(params);
  };

  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();

    return categories.filter((cat) => {
      const name = String(cat.name || "").trim();
      const key = name.toUpperCase();

      if (!name || seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [categories]);

  const currentCatObj = uniqueCategories.find((cat) => cat.name?.toUpperCase() === selectedCategory);

  const availableSubcats = useMemo(() => {
    if (!currentCatObj) return [];

    return subcategories
      .filter((sub) => String(sub.category_id) === String(currentCatObj.id || currentCatObj.category_id))
      .filter((sub, index, arr) => {
        const name = String(sub.name || "").trim().toUpperCase();

        if (!name || name === selectedCategory) return false;

        return arr.findIndex((item) => String(item.name || "").trim().toUpperCase() === name) === index;
      });
  }, [currentCatObj, selectedCategory, subcategories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCat = selectedCategory === "ALL" || product.category?.toUpperCase() === selectedCategory;
      const matchSubCat = selectedSubCategory === "ALL" || product.subcategory?.toUpperCase() === selectedSubCategory;

      return matchCat && matchSubCat && Boolean(getUploadedProductImage(product));
    });
  }, [products, selectedCategory, selectedSubCategory]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const pageHeading =
    selectedSubCategory !== "ALL"
      ? toTitleCase(selectedSubCategory)
      : selectedCategory === "ALL"
      ? "Posters"
      : toTitleCase(selectedCategory);

  const pageDescription =
    selectedSubCategory !== "ALL"
      ? `Explore ${toTitleCase(selectedSubCategory)} posters from MURO Poster. Browse premium wall art prints with clean styling, dynamic size pricing and curated visual themes.`
      : selectedCategory === "ALL"
      ? "Discover a wide range of posters online, featuring popular motifs such as motivational quotes, mindset art, typography, lifestyle prints and more. Explore styles for every room and mood at MURO Poster."
      : `Discover curated ${toTitleCase(selectedCategory)} posters for modern spaces. Choose from premium wall art prints designed for homes, offices, studios and creative rooms.`;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <main className="min-h-screen bg-white text-[#101010] selection:bg-[#101010] selection:text-white">
      <section className="mx-auto max-w-[1320px] px-5 pb-8 pt-12 md:px-7 md:pb-10 md:pt-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <motion.h1
            key={`${selectedCategory}-${selectedSubCategory}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-[34px] leading-none tracking-[-0.04em] text-[#101010] md:text-[42px] lg:text-[48px]"
            style={{ fontFamily: serifFont }}
          >
            {pageHeading}
          </motion.h1>

          <p className="max-w-[670px] text-[14px] font-medium leading-relaxed text-[#101010] md:text-[15px]">{pageDescription}</p>
        </div>

      

      
      </section>

      <section className="mx-auto max-w-[1320px] px-5 pb-16 md:px-7 lg:px-8">
        <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#A19D96]">
          <span>{totalItems} Products</span>
          <span className="hidden sm:inline">Dynamic master size pricing</span>
        </div>

        {loading ? (
          <div className="flex min-h-[45vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#101010] border-t-transparent" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex min-h-[45vh] items-center justify-center rounded-[14px] bg-[#F3F3F1] px-6 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#77736B]">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {currentItems.map((product, index) => (
              <ProductCard key={String(getProductId(product) || index)} product={product} activeOffer={activeOffer} index={index} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-full border border-[#101010] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#101010] transition-colors hover:bg-[#101010] hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              Prev
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`h-9 w-9 rounded-full border text-[12px] font-semibold transition-colors ${
                  currentPage === page ? "border-[#101010] bg-[#101010] text-white" : "border-[#101010] text-[#101010] hover:bg-[#101010] hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-full border border-[#101010] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#101010] transition-colors hover:bg-[#101010] hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Products;
