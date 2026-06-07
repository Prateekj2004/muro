import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Info,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";
import { cartApi } from "@/services/cartApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

type ActiveOffer = {
  id?: number;
  label: string;
  discount_percent: number;
  from_date?: string;
  to_date?: string;
};

type CouponResult = {
  valid: boolean;
  code?: string;
  discount_percent?: number;
  message?: string;
};

type SizePriceItem = {
  id?: string | number;
  size_id?: string | number;
  size_name?: string;
  name?: string;
  size_code?: string;
  code?: string;
  price?: string | number;
  is_active?: string | number;
};

type ProductImageItem = {
  id?: string | number;
  image_title?: string;
  title?: string;
  image_url?: string;
  url?: string;
  file_url?: string;
  path?: string;
  sort_order?: string | number;
};

type ProductItem = {
  id?: string | number;
  product_id?: string | number;
  productId?: string | number;
  title?: string;
  name?: string;
  price?: string | number;
  base_price?: string | number;
  original_price?: string | number;
  originalPrice?: string | number;
  category?: string;
  subcategory?: string;
  description?: string;
  short_description?: string;
  full_description?: string;
  about_artwork?: string;
  quote?: string;
  main_poster_url?: string;
  defaultImg?: string;
  image_url?: string;
  zoom_in_url?: string;
  wall_poster_url?: string;
  hoverImg?: string;
  tags?: string[] | string;
  size_prices?: SizePriceItem[];
  sizes?: SizePriceItem[];
  product_images?: ProductImageItem[];
  images?: ProductImageItem[];
  active_offer?: ActiveOffer | null;
  offer_price?: string | number;
  final_price?: string | number;
};

const COLORS = {
  cloud: "#F0EEE9",
  blackboard: "#1C1C1C",
  green: "#006039",
};

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/600x800?text=No+Image";

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

const formatPrice = (price?: string | number) => {
  const numericValue = safeNumber(price);
  const finalValue = numericValue > 0 ? numericValue : 500;
  return `₹${finalValue.toLocaleString("en-IN")}`;
};

const getActiveOfferPrice = (price: number, offer?: ActiveOffer | null) => {
  const discountPercent = safeNumber(offer?.discount_percent);
  if (!offer || discountPercent <= 0 || price <= 0) {
    return {
      originalPrice: price,
      finalPrice: price,
      discountAmount: 0,
      hasOffer: false,
    };
  }

  const discountAmount = Math.round(((price * discountPercent) / 100) * 100) / 100;
  const finalPrice = Math.max(0, Math.round((price - discountAmount) * 100) / 100);

  return {
    originalPrice: price,
    finalPrice,
    discountAmount,
    hasOffer: finalPrice < price,
  };
};

const normalizeVariationTitle = (title?: string) => {
  return String(title || "")
    .trim()
    .replace(/\s*[-–—:]\s*\d+\s*$/i, "")
    .replace(/\s+\d+\s*$/i, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const fetchActiveOffers = async (): Promise<ActiveOffer[]> => {
  try {
    const response = await fetch(`${API_BASE}/offers/active`);
    const json = await response.json().catch(() => null);
    const rows = Array.isArray(json?.data) ? json.data : json?.data?.items || [];
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("Failed to fetch active offers:", error);
    return [];
  }
};

const validateCouponCode = async (code: string): Promise<CouponResult> => {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      valid: false,
      message: "Please login to apply coupon",
    };
  }

  const response = await fetch(`${API_BASE}/coupons/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, use_now: true }),
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || json?.success === false) {
    return {
      valid: false,
      message: json?.message || "Coupon is not valid or already used",
    };
  }

  return {
    valid: true,
    code: json?.data?.code || code,
    discount_percent: safeNumber(json?.data?.discount_percent),
    message: json?.message || "Coupon applied successfully",
  };
};


const getFirstProductImageTitle = (product?: ProductItem | null) => {
  const imageRows = Array.isArray(product?.product_images)
    ? product?.product_images
    : Array.isArray(product?.images)
    ? product?.images
    : [];

  const firstImage = imageRows
    .slice()
    .sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    )
    .find((img) => Boolean(img.image_title || img.title));

  return String(firstImage?.image_title || firstImage?.title || "").trim();
};

const looksLikeUploadedFileName = (title?: string) => {
  const value = String(title || "").trim();

  return (
    /^screenshot\s+\d{4}/i.test(value) ||
    /^img[_\-\s]?\d+/i.test(value) ||
    /^dsc[_\-\s]?\d+/i.test(value) ||
    /\.(jpg|jpeg|png|webp|pdf)$/i.test(value)
  );
};

const getProductTitle = (product?: ProductItem | null) => {
  const title = String(product?.title || product?.name || "").trim();
  const imageTitle = getFirstProductImageTitle(product);

  if (!title || looksLikeUploadedFileName(title)) {
    return imageTitle || "Product";
  }

  return title;
};

const resolveProductId = (
  product?: ProductItem | null,
  routeId?: string
): number | null => {
  const possibleId =
    product?.id ??
    product?.product_id ??
    product?.productId ??
    routeId ??
    "";

  const cleanId = String(possibleId).trim();

  if (!cleanId || cleanId === "undefined" || cleanId === "null") {
    return null;
  }

  const numericId = Number(cleanId);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return null;
  }

  return numericId;
};

const getSizeId = (size?: SizePriceItem | null) => {
  return String(size?.size_id ?? size?.id ?? "");
};

const getSizeName = (size?: SizePriceItem | null) => {
  return String(size?.size_name ?? size?.name ?? size?.size_code ?? size?.code ?? "");
};

const normalizeSizePrices = (product?: ProductItem | null): SizePriceItem[] => {
  const rawSizes = Array.isArray(product?.size_prices)
    ? product?.size_prices
    : Array.isArray(product?.sizes)
    ? product?.sizes
    : [];

  return (rawSizes || [])
    .filter((size) => {
      const sizeId = getSizeId(size);
      const sizeName = getSizeName(size);
      const price = safeNumber(size?.price);
      const isActive = Number(size?.is_active ?? 1) === 1;

      return isActive && Boolean(sizeId || sizeName) && price > 0;
    })
    .map((size) => ({
      ...size,
      size_id: size.size_id ?? size.id,
      size_name: size.size_name ?? size.name,
      size_code: size.size_code ?? size.code,
      price: safeNumber(size.price),
    }));
};

const getSelectedProductPrice = (
  product?: ProductItem | null,
  selectedSize?: SizePriceItem | null
) => {
  const selectedPrice = safeNumber(selectedSize?.price);
  if (selectedPrice > 0) return selectedPrice;

  const firstSizePrice = safeNumber(normalizeSizePrices(product)[0]?.price);
  if (firstSizePrice > 0) return firstSizePrice;

  return safeNumber(product?.price || product?.base_price) || 500;
};

const getUploadedProductImage = (product?: ProductItem | null) => {
  const imageRows = Array.isArray(product?.product_images)
    ? product?.product_images
    : Array.isArray(product?.images)
    ? product?.images
    : [];

  const firstUploaded = imageRows
    .slice()
    .sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    )
    .find((img) =>
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
    product?.defaultImg ||
    product?.hoverImg ||
    ""
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stateProduct = (location.state as any)?.productData as
    | ProductItem
    | undefined;

  const [product, setProduct] = useState<ProductItem | null>(
    stateProduct || null
  );

  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(!stateProduct);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);

      try {
        const res: any =
          typeof (API as any).adminGetProducts === "function"
            ? await (API as any).adminGetProducts({ all: 1 }).catch(() => API.getProducts().catch(() => []))
            : await API.getProducts().catch(() => []);
        const items: ProductItem[] = Array.isArray(res)
          ? res
          : res?.data?.items || res?.data || [];

        setAllProducts(items);

        const found = items.find((item) => {
          const itemId = resolveProductId(item);
          return String(itemId) === String(id);
        });

        if (found) {
          setProduct(found);
        } else if (stateProduct) {
          setProduct(stateProduct);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);

        if (!stateProduct) {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, stateProduct]);

  useEffect(() => {
    fetchActiveOffers().then(setActiveOffers);
  }, []);

  useEffect(() => {
    const sizePrices = normalizeSizePrices(product);

    if (sizePrices.length > 0) {
      const currentExists = sizePrices.some(
        (size) => getSizeId(size) === selectedSizeId
      );

      if (!currentExists) {
        setSelectedSizeId(getSizeId(sizePrices[0]));
      }
    } else {
      setSelectedSizeId("");
    }
  }, [product, selectedSizeId]);

  const sizePrices = useMemo(() => normalizeSizePrices(product), [product]);

  const selectedSize = useMemo(() => {
    return (
      sizePrices.find((size) => getSizeId(size) === selectedSizeId) ||
      sizePrices[0] ||
      null
    );
  }, [sizePrices, selectedSizeId]);

  const activeOffer = product?.active_offer || activeOffers[0] || null;

  const variationProducts = useMemo(() => {
    if (!product) return [];

    const currentKey = normalizeVariationTitle(getProductTitle(product));
    if (!currentKey) return [];

    const seen = new Set<string>();

    return allProducts
      .filter((item) => {
        const itemId = resolveProductId(item);
        const image = getUploadedProductImage(item);
        const itemKey = normalizeVariationTitle(getProductTitle(item));

        if (!itemId || !image || !itemKey || itemKey !== currentKey) return false;

        const dedupeKey = String(itemId);
        if (seen.has(dedupeKey)) return false;

        seen.add(dedupeKey);
        return true;
      })
      .sort((a, b) => Number(resolveProductId(a) || 0) - Number(resolveProductId(b) || 0));
  }, [allProducts, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const currentProductId = resolveProductId(product, id);
    const seen = new Set<string>();

    const allWithImages = allProducts.filter((item) => {
      const itemId = resolveProductId(item);
      const image = getUploadedProductImage(item);

      if (!image || !itemId) return false;

      const key = String(itemId);

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    const sameCategory = allWithImages.filter((item) => {
      const itemId = resolveProductId(item);
      const notSame = String(itemId) !== String(currentProductId);

      const categoryMatch =
        product.category &&
        item.category &&
        item.category.toLowerCase() === product.category.toLowerCase();

      return notSame && categoryMatch;
    });

    const fallbackWithoutCurrent = allWithImages.filter((item) => {
      const itemId = resolveProductId(item);
      return String(itemId) !== String(currentProductId);
    });

    const source =
      sameCategory.length > 0
        ? sameCategory
        : fallbackWithoutCurrent.length > 0
        ? fallbackWithoutCurrent
        : allWithImages;

    return source.slice(0, 12);
  }, [allProducts, product, id]);

  useEffect(() => {
    if (relatedProducts.length <= 1) {
      setRelatedSlideIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setRelatedSlideIndex((prev) => (prev + 1) % relatedProducts.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [relatedProducts.length]);

  const visibleRelatedProducts = useMemo(() => {
    if (relatedProducts.length <= 5) return relatedProducts;

    return Array.from({ length: 5 }, (_, index) => {
      return relatedProducts[(relatedSlideIndex + index) % relatedProducts.length];
    });
  }, [relatedProducts, relatedSlideIndex]);

  const productTitle = getProductTitle(product);
  const productPrice = getSelectedProductPrice(product, selectedSize);
  const productOfferPrice = getActiveOfferPrice(productPrice, activeOffer);
  const couponPreview = couponResult?.valid
    ? getActiveOfferPrice(productOfferPrice.finalPrice, {
        label: couponResult.code || "Coupon",
        discount_percent: couponResult.discount_percent || 0,
      })
    : null;
  const mainImage = getUploadedProductImage(product);

  const productTags = useMemo(() => {
    if (!product?.tags) {
      return [
        product?.category || "Poster",
        product?.subcategory || "Wall Art",
      ].filter(Boolean);
    }

    if (Array.isArray(product.tags)) return product.tags;

    return String(product.tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [product]);

  const handleQuantityChange = (type: "minus" | "plus") => {
    setQuantity((prev) => {
      if (type === "minus") return Math.max(1, prev - 1);
      return prev + 1;
    });
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (!product) {
      toast.error("Product data missing");
      return false;
    }

    const productId = resolveProductId(product, id);

    if (!productId) {
      console.error("Invalid cart product id:", {
        routeId: id,
        product,
      });

      toast.error("Product id missing or invalid");
      return false;
    }

    if (!selectedSize || !getSizeId(selectedSize)) {
      toast.error("Please select size");
      return false;
    }

    setCartLoading(true);

    try {
      await cartApi.addItem({
        product_id: productId,
        size_id: Number(getSizeId(selectedSize)),
        qty: quantity,
      });

      toast.success("Item added to cart");
      window.dispatchEvent(new Event("muro_cart_updated"));
      return true;
    } catch (error: any) {
      console.error("Add to cart failed:", error);
      toast.error(error?.message || "Failed to add item to cart");
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      toast.error("Enter coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponResult(null);

    try {
      const result = await validateCouponCode(cleanCode);
      setCouponResult(result);

      if (result.valid) {
        toast.success(result.message || "Coupon applied");
      } else {
        toast.error(result.message || "Coupon is not valid");
      }
    } catch (error: any) {
      console.error("Coupon validation failed:", error);
      toast.error(error?.message || "Coupon validation failed");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();

    if (added) {
      navigate("/cart", {
        state: {
          openCheckout: true,
          couponCode: couponResult?.valid ? couponResult.code : "",
        },
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0EEE9] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F0EEE9] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[28px] font-semibold text-[#1C1C1C] mb-4">
            Product not found
          </h1>

          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-[#1C1C1C] text-white px-8 py-3 text-[12px] uppercase tracking-[0.18em]"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden font-sans"
      style={{
        backgroundColor: COLORS.cloud,
        color: COLORS.blackboard,
      }}
    >
      <section className="w-full py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#1C1C1C]/45">
            <Link to="/" className="hover:text-[#1C1C1C] transition-colors">
              Home
            </Link>

            <ChevronRight size={13} />

            <Link
              to="/products"
              className="hover:text-[#1C1C1C] transition-colors"
            >
              Products
            </Link>

            {product.category && (
              <>
                <ChevronRight size={13} />
                <span className="text-[#1C1C1C] font-semibold">
                  {product.category}
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
            <div className="w-full">
              <img
                src={getFullImageUrl(mainImage)}
                alt={productTitle}
                className="block w-full h-auto object-contain"
              />
            </div>

            <div className="w-full lg:pt-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#1C1C1C]/40 mb-5">
                {product.category || "Poster"}
                {product.subcategory ? ` > ${product.subcategory}` : ""}
              </p>

              <h1 className="text-[34px] md:text-[42px] lg:text-[46px] leading-tight text-[#1C1C1C] font-normal tracking-[-0.04em] mb-5">
                {productTitle}
              </h1>

              <div className="mb-3">
                <div className="flex flex-wrap items-center gap-3">
                  {productOfferPrice.hasOffer && (
                    <span className="text-[18px] md:text-[20px] text-[#1C1C1C]/35 line-through font-medium">
                      {formatPrice(productOfferPrice.originalPrice)}
                    </span>
                  )}

                  <span className="text-[28px] md:text-[32px] font-semibold text-[#1C1C1C]">
                    {formatPrice(couponPreview?.finalPrice || productOfferPrice.finalPrice)}
                  </span>
                </div>

                {activeOffer && productOfferPrice.hasOffer && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-[#006039]/10 border border-[#006039]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#006039]">
                    {activeOffer.label} - {activeOffer.discount_percent}% OFF
                  </div>
                )}

                {couponPreview?.hasOffer && couponResult?.valid && (
                  <div className="mt-2 text-[12px] font-semibold text-[#006039] uppercase tracking-[0.12em]">
                    Coupon {couponResult.code} applied: {couponResult.discount_percent}% extra off
                  </div>
                )}
              </div>

              <p className="text-[15px] md:text-[16px] leading-relaxed text-[#1C1C1C]/65 mb-8 max-w-[650px]">
                {product.description ||
                  product.short_description ||
                  product.quote ||
                  "Premium poster print curated for beautiful living spaces."}
              </p>

              <div className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="text-[12px] uppercase tracking-[0.22em] font-semibold text-[#1C1C1C]">
                    Choose Size
                  </p>

                  
                </div>

                <div className="flex flex-wrap gap-3">
                  {sizePrices.map((size) => {
                    const sizeId = getSizeId(size);
                    const active = sizeId === selectedSizeId;

                    return (
                      <button
                        key={sizeId || getSizeName(size)}
                        type="button"
                        onClick={() => setSelectedSizeId(sizeId)}
                        className={`h-[46px] rounded-full border px-5 inline-flex items-center justify-center gap-3 transition-all shadow-sm ${
                          active
                            ? "border-[#1C1C1C] bg-[#1C1C1C] text-white"
                            : "border-[#1C1C1C]/15 bg-white/70 text-[#1C1C1C] hover:border-[#1C1C1C] hover:bg-white"
                        }`}
                      >
                        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] leading-none">
                          {getSizeName(size)}
                        </span>

                      
                      </button>
                    );
                  })}
                </div>
              </div>

              {variationProducts.length > 1 && (
                <div className="mb-8">
                  <p className="text-[12px] uppercase tracking-[0.22em] font-semibold mb-3 text-[#1C1C1C]">
                    Variations
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {variationProducts.map((item) => {
                      const itemId = resolveProductId(item);
                      const itemImage = getUploadedProductImage(item);
                      const active = String(itemId) === String(resolveProductId(product, id));

                      if (!itemId || !itemImage) return null;

                      return (
                        <button
                          key={itemId}
                          type="button"
                          onClick={() => {
                            setProduct(item);
                            navigate(`/product/${itemId}`, { replace: false, state: { productData: item } });
                          }}
                          className={`w-[74px] h-[92px] rounded-xl border overflow-hidden bg-white transition-all ${
                            active
                              ? "border-[#1C1C1C] ring-2 ring-[#1C1C1C]/20"
                              : "border-[#1C1C1C]/12 hover:border-[#1C1C1C]"
                          }`}
                          title={getProductTitle(item)}
                        >
                          <img
                            src={getFullImageUrl(itemImage)}
                            alt={getProductTitle(item)}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-[12px] uppercase tracking-[0.22em] font-semibold mb-3 text-[#1C1C1C]">
                  Quantity
                </p>

                <div className="inline-flex items-center border border-[#1C1C1C]/15 bg-white/60 h-[52px]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("minus")}
                    className="w-[52px] h-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="min-w-[54px] text-center text-[14px] font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange("plus")}
                    className="w-[52px] h-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading || sizePrices.length === 0}
                  className={`h-[56px] border border-[#1C1C1C] bg-transparent text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all text-[12px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-3 ${
                    cartLoading || sizePrices.length === 0
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <ShoppingBag size={17} />
                  {cartLoading ? "Adding..." : "Add To Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={cartLoading || sizePrices.length === 0}
                  className={`h-[56px] bg-[#1C1C1C] text-white hover:bg-[#006039] transition-colors text-[12px] font-semibold uppercase tracking-[0.2em] ${
                    cartLoading || sizePrices.length === 0
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {cartLoading ? "Processing..." : "Buy It Now"}
                </button>
              </div>

              <div className="rounded-[20px] bg-white/65 border border-[#1C1C1C]/8 p-4 md:p-5 mb-7">
                <p className="text-[12px] uppercase tracking-[0.22em] font-semibold mb-3 text-[#1C1C1C]">
                  Coupon Code
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponResult(null);
                    }}
                    placeholder="Enter coupon code"
                    className="h-[48px] flex-1 border border-[#1C1C1C]/15 bg-white px-4 text-[13px] font-semibold uppercase tracking-[0.14em] outline-none focus:border-[#1C1C1C]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="h-[48px] px-6 bg-[#1C1C1C] text-white text-[11px] font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
                  >
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                </div>

                {couponResult && (
                  <p className={`mt-3 text-[12px] font-semibold ${couponResult.valid ? "text-[#006039]" : "text-red-600"}`}>
                    {couponResult.message || (couponResult.valid ? "Coupon applied" : "Coupon is not valid")}
                  </p>
                )}
              </div>

              <div className="rounded-[22px] bg-white/65 border border-[#1C1C1C]/8 p-6 md:p-7 mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={17} className="text-[#1C1C1C]" />

                  <h2 className="text-[13px] uppercase tracking-[0.18em] font-semibold text-[#1C1C1C]">
                    About This Artwork
                  </h2>
                </div>

                <p className="text-[14px] md:text-[15px] leading-relaxed text-[#1C1C1C]/65 mb-5 whitespace-pre-wrap">
                  {product.about_artwork ||
                    product.full_description ||
                    product.description ||
                    "This artwork is designed to add meaning, mood and visual impact to your wall. It works well for bedrooms, workspaces, study corners and creative interiors."}
                </p>

                <p className="text-[14px] md:text-[15px] leading-relaxed text-[#1C1C1C]/65">
                  Best for: anyone who wants a clean, motivational and premium
                  wall decor piece.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tag size={15} className="text-[#1C1C1C]/45" />

                {productTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/70 border border-[#1C1C1C]/8 px-3 py-2 text-[10px] uppercase tracking-[0.12em] font-semibold text-[#1C1C1C]/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-14 bg-[#F0EEE9] border-t border-[#1C1C1C]/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-normal tracking-[0.18em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-none">
              You Might Also Like
            </h2>

            <Link
              to="/products"
              className="shrink-0 text-[12px] md:text-[14px] font-medium tracking-[0.18em] text-[#1C1C1C] uppercase hover:text-[#006039] transition-colors"
            >
              View All
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="h-[18vh] flex items-center justify-center text-[#1C1C1C]/45">
              <p className="text-sm tracking-widest uppercase">
                No related products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 items-start">
              {visibleRelatedProducts.map((item, index) => {
                const itemTitle = getProductTitle(item);
                const posterImage = getUploadedProductImage(item);
                const itemSizePrices = normalizeSizePrices(item);
                const itemPrice =
                  safeNumber(itemSizePrices[0]?.price) ||
                  safeNumber(item.price || item.base_price) ||
                  500;
                const itemOfferPrice = getActiveOfferPrice(itemPrice, item.active_offer || activeOffer);
                const relatedId = resolveProductId(item);

                if (!relatedId || !posterImage) return null;

                return (
                  <Link
                    key={relatedId || index}
                    to={`/product/${relatedId}`}
                    state={{ productData: item }}
                    className="group cursor-pointer flex flex-col h-full w-full"
                  >
                    <div className="w-full">
                      <div className="relative w-full mb-4 overflow-hidden">
                        <img
                          src={getFullImageUrl(posterImage)}
                          alt={itemTitle}
                          className="block w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>

                      <div className="w-full text-left">
                        <h3 className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C] leading-snug mb-2 w-full min-h-[42px]">
                          {itemTitle}
                        </h3>

                        <div className="flex items-center gap-2">
                          {itemOfferPrice.hasOffer && (
                            <span className="text-[12px] text-[#1C1C1C]/35 line-through">
                              {formatPrice(itemOfferPrice.originalPrice)}
                            </span>
                          )}
                          <span className="text-[15px] font-semibold text-[#1C1C1C]">
                            {formatPrice(itemOfferPrice.finalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;
