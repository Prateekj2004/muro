import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { API } from "@/services/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

type ActiveOffer = { label: string; discount_percent: number };

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";

  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (cleanPath.includes("api/public/uploads")) {
    return `https://muroposter.com/${cleanPath}`;
  }

  if (cleanPath.includes("uploads/product")) {
    return `https://muroposter.com/${cleanPath}`;
  }

  return `https://muroposter.com/uploads/product/${cleanPath}`;
};

const safeNumber = (value?: string | number) => {
  const cleanValue = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const num = Number(cleanValue);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

const getUploadedProductImage = (product: any) => {
  const imageRows = Array.isArray(product?.product_images)
    ? product.product_images
    : Array.isArray(product?.images)
    ? product.images
    : [];

  const firstUploaded = imageRows
    .slice()
    .sort(
      (a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    )
    .find((img: any) =>
      Boolean(img.image_url || img.url || img.file_url || img.path)
    );

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

  const prices = sizeRows
    .map((size: any) => safeNumber(size.price))
    .filter((price: number) => price > 0);

  if (prices.length > 0) {
    return Math.min(...prices);
  }

  return safeNumber(product?.price || product?.base_price) || 500;
};

const getProductPrice = (price?: string | number) => {
  const numericValue = safeNumber(price) || 500;
  return `₹${numericValue.toLocaleString("en-IN")}`;
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
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<string>(urlSubcategory);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 40;

  useEffect(() => {
    if (
      urlCategory !== selectedCategory ||
      urlSubcategory !== selectedSubCategory
    ) {
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

        setProducts(
          Array.isArray(prodRes)
            ? prodRes
            : prodRes?.data?.items || prodRes?.data || []
        );

        setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);

        setSubcategories(
          Array.isArray(subcatRes) ? subcatRes : subcatRes?.data || []
        );

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

  const currentCatObj = uniqueCategories.find(
    (cat) => cat.name?.toUpperCase() === selectedCategory
  );

  const availableSubcats = currentCatObj
    ? subcategories
        .filter(
          (sub) =>
            String(sub.category_id) ===
            String(currentCatObj.id || currentCatObj.category_id)
        )
        .filter((sub, index, arr) => {
          const name = String(sub.name || "").trim().toUpperCase();

          if (!name || name === selectedCategory) return false;

          return arr.findIndex((item) => String(item.name || "").trim().toUpperCase() === name) === index;
        })
    : [];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCat =
        selectedCategory === "ALL" ||
        product.category?.toUpperCase() === selectedCategory;

      const matchSubCat =
        selectedSubCategory === "ALL" ||
        product.subcategory?.toUpperCase() === selectedSubCategory;

      return matchCat && matchSubCat && Boolean(getUploadedProductImage(product));
    });
  }, [products, selectedCategory, selectedSubCategory]);

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

  const navBase =
    "font-montserrat text-[15px] font-medium uppercase tracking-[0.08em] whitespace-nowrap pb-1.5";

  return (
    <main className="bg-[#F0EEE9] min-h-screen font-sans text-[#111111]">
      <div className="pt-16 pb-8 text-center px-4">
        <motion.h1
          key={`${selectedCategory}-${selectedSubCategory}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-montserrat font-light tracking-[1px] text-3xl md:text-4xl text-[#111] mb-8 uppercase"
        >
          {selectedSubCategory !== "ALL"
            ? selectedSubCategory.toLowerCase()
            : selectedCategory === "ALL"
            ? "Posters & Art Prints"
            : selectedCategory.toLowerCase()}
        </motion.h1>

        <div className="container mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-2 px-2 sm:px-4">
            <button
              onClick={() => handleCategoryClick("ALL")}
              className={`${navBase} px-4 py-2 sm:px-5 sm:py-2.5 text-[9px] sm:text-[12px] font-semibold tracking-[0.15em] transition-all duration-300 rounded-full ${
                selectedCategory === "ALL"
                  ? "bg-[#111] text-[#F0EEE9] shadow-md"
                  : "bg-white/50 text-black border border-black hover:bg-white"
              }`}
            >
              ALL
            </button>

            {uniqueCategories.map((cat) => (
              <button
                key={cat.id || cat.category_id}
                onClick={() => handleCategoryClick(cat.name.toUpperCase())}
                className={`${navBase} px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[10px] font-semibold tracking-[0.15em] transition-all duration-300 rounded-full ${
                  selectedCategory === cat.name.toUpperCase()
                    ? "bg-[#111] text-[#F0EEE9] shadow-md"
                    : "bg-white/50 text-black border border-black hover:bg-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {availableSubcats.length > 0 && selectedCategory !== "ALL" && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => handleSubCategoryClick("ALL")}
                className={`${navBase} px-4 py-1.5 text-[12px] font-bold tracking-widest border transition-all rounded-full ${
                  selectedSubCategory === "ALL"
                    ? "border-black bg-black text-[#F0EEE9]"
                    : "bg-white/50 text-black border-black hover:bg-white"
                }`}
              >
                ALL
              </button>

              {availableSubcats.map((sub) => (
                <button
                  key={sub.id || sub.subcategory_id}
                  onClick={() =>
                    handleSubCategoryClick(sub.name.toUpperCase())
                  }
                  className={`px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest border transition-all rounded-full ${
                    selectedSubCategory === sub.name.toUpperCase()
                      ? "border-black bg-black text-[#F0EEE9]"
                      : "bg-white/50 text-black border-black hover:bg-white"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-b border-[#E0DED9] py-4 mb-6 sticky top-0 bg-[#F0EEE9] z-40">
        <div className="container mx-auto px-4 md:px-8 max-w-[1600px] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#111]/55">
            <ChevronDown size={14} />
            <span>{totalItems} Products</span>
          </div>

          <div className="text-[11px] uppercase tracking-[0.18em] text-[#111]/55">
            Dynamic master size pricing
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 md:px-8 max-w-[1600px] pb-16">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentItems.length === 0 ? (
          <div className="min-h-[40vh] flex items-center justify-center text-center">
            <p className="text-sm uppercase tracking-widest text-[#111]/45">
              No products found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-start">
            {currentItems.map((product, index) => {
              const productImage = getUploadedProductImage(product);
              const productId = getProductId(product);
              const productPrice = getLowestProductPrice(product);
              const offerPrice = getOfferPrice(productPrice, product.active_offer || activeOffer);

              if (!productImage || !productId) return null;

              return (
                <Link
                  key={productId || index}
                  to={`/product/${productId}`}
                  state={{ productData: product }}
                  className="group block"
                >
                  <article>
                    <img
                      src={getFullImageUrl(productImage)}
                      alt={product.title || product.name || "Product"}
                      className="block w-full h-auto rounded-[14px] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />

                    <div className="mt-4">
                      <h3 className="text-[14px] md:text-[15px] font-medium text-[#1C1C1C] leading-snug min-h-[42px]">
                        {product.title || product.name || "Product"}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {offerPrice.hasOffer && (
                          <span className="text-[12px] text-[#1C1C1C]/35 line-through">
                            {getProductPrice(offerPrice.originalPrice)}
                          </span>
                        )}
                        <span className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                          {getProductPrice(offerPrice.finalPrice)}
                        </span>
                        {(product.active_offer || activeOffer) && offerPrice.hasOffer && (
                          <span className="text-[10px] font-bold text-[#006039] uppercase tracking-[0.12em]">
                            {(product.active_offer || activeOffer)?.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 border border-black text-[11px] uppercase tracking-widest disabled:opacity-40"
            >
              Prev
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 border text-[12px] font-semibold ${
                  currentPage === page
                    ? "bg-black text-white border-black"
                    : "border-black text-black"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 border border-black text-[11px] uppercase tracking-widest disabled:opacity-40"
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
