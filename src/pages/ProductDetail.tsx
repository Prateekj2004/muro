import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";
import { cartApi } from "@/services/cartApi";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

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
  page: "#FFFFFF",
  panel: "#F3F3F1",
  ink: "#111111",
  muted: "#9A9A9A",
  green: "#006039",
  campaign: "#F2FF67",
};

const serifFont = "Georgia, 'Times New Roman', serif";

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

const toNumber = (value: any, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const emitCartUpdated = (itemCount?: number) => {
  window.dispatchEvent(
    new CustomEvent("muro_cart_updated", {
      detail: {
        item_count: Number(itemCount || 0),
      },
    }),
  );
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

  const discountAmount =
    Math.round(((price * discountPercent) / 100) * 100) / 100;
  const finalPrice = Math.max(
    0,
    Math.round((price - discountAmount) * 100) / 100,
  );

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
    const rows = Array.isArray(json?.data)
      ? json.data
      : json?.data?.items || [];
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
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
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
  routeId?: string,
): number | null => {
  const possibleId =
    product?.id ?? product?.product_id ?? product?.productId ?? routeId ?? "";

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
  return String(
    size?.size_name ?? size?.name ?? size?.size_code ?? size?.code ?? "",
  );
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
  selectedSize?: SizePriceItem | null,
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
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .find((img) =>
      Boolean(img.image_url || img.url || img.file_url || img.path),
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

const getProductGalleryImages = (product?: ProductItem | null) => {
  const imageRows = Array.isArray(product?.product_images)
    ? product?.product_images
    : Array.isArray(product?.images)
      ? product?.images
      : [];

  const gallery = imageRows
    .slice()
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .map((img) => img.image_url || img.url || img.file_url || img.path || "")
    .filter(Boolean);

  [
    product?.main_poster_url,
    product?.zoom_in_url,
    product?.image_url,
    product?.wall_poster_url,
    product?.defaultImg,
    product?.hoverImg,
  ].forEach((image) => {
    if (image) gallery.push(image);
  });

  const seen = new Set<string>();
  return gallery.filter((image) => {
    const key = getFullImageUrl(image);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getOfferValidityText = (offer?: ActiveOffer | null) => {
  if (!offer?.to_date) return "Limited time offer";

  const date = new Date(offer.to_date);
  if (Number.isNaN(date.getTime())) return "Limited time offer";

  return `Valid until ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stateProduct = (location.state as any)?.productData as
    | ProductItem
    | undefined;

  const [product, setProduct] = useState<ProductItem | null>(
    stateProduct || null,
  );

  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(!stateProduct);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [cartLoading, setCartLoading] = useState(false);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);

      try {
        const res: any =
          typeof (API as any).adminGetProducts === "function"
            ? await (API as any)
                .adminGetProducts({ all: 1 })
                .catch(() => API.getProducts().catch(() => []))
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
        (size) => getSizeId(size) === selectedSizeId,
      );

      if (!currentExists) {
        setSelectedSizeId(getSizeId(sizePrices[0]));
      }
    } else {
      setSelectedSizeId("");
    }
  }, [product, selectedSizeId]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

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

        if (!itemId || !image || !itemKey || itemKey !== currentKey)
          return false;

        const dedupeKey = String(itemId);
        if (seen.has(dedupeKey)) return false;

        seen.add(dedupeKey);
        return true;
      })
      .sort(
        (a, b) =>
          Number(resolveProductId(a) || 0) - Number(resolveProductId(b) || 0),
      );
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

    return source.slice(0, 8);
  }, [allProducts, product, id]);

  const productTitle = getProductTitle(product);
  const productPrice = getSelectedProductPrice(product, selectedSize);
  const productOfferPrice = getActiveOfferPrice(productPrice, activeOffer);
  const couponPreview = couponResult?.valid
    ? getActiveOfferPrice(productOfferPrice.finalPrice, {
        label: couponResult.code || "Coupon",
        discount_percent: couponResult.discount_percent || 0,
      })
    : null;
  const galleryImages = useMemo(
    () => getProductGalleryImages(product),
    [product],
  );
  const mainImage =
    galleryImages[activeImageIndex] || getUploadedProductImage(product);

  const shortDescription =
    product?.description ||
    product?.short_description ||
    product?.quote ||
    "Premium poster print curated for beautiful living spaces.";

  const longDescription =
    product?.about_artwork ||
    product?.full_description ||
    product?.description ||
    "This artwork is designed to add meaning, mood and visual impact to your wall. It works well for bedrooms, workspaces, study corners and creative interiors.";

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


  const refreshCartBadge = async () => {
    try {
      const res = await cartApi.getCart();
      const summary = res?.data?.summary || {};
      const itemCount = toNumber(summary.item_count);

      emitCartUpdated(itemCount);
    } catch (error) {
      console.error("Failed to refresh cart count:", error);
    }
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
        qty: 1,
      });

      toast.success("Item added to cart");
      await refreshCartBadge();
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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[28px] font-semibold text-[#111111] mb-4">
            Product not found
          </h1>

          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-[#111111] rounded-full text-white px-8 py-3 text-[12px] font-semibold"
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
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      <section className="w-full pt-5 md:pt-7 pb-14">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 xl:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(520px,1fr)_410px] gap-3 lg:gap-7 items-start">
            <aside className="order-2 lg:order-1 lg:sticky lg:top-[125px] lg:max-h-[calc(100vh-145px)] lg:overflow-y-auto">
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {galleryImages.map((image, index) => {
                  const active = index === activeImageIndex;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative shrink-0 w-[118px] h-[148px] lg:w-full lg:h-[282px] rounded-[12px] overflow-hidden bg-[#F2F2F2] border transition-all ${
                        active
                          ? "border-[#111111] ring-1 ring-[#111111]"
                          : "border-transparent hover:border-[#CFCFCF]"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={getFullImageUrl(image)}
                        alt={`${productTitle} thumbnail ${index + 1}`}
                        className="w-full h-full object-contain p-4"
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="order-1 lg:order-2 relative min-h-[540px] lg:min-h-[760px] rounded-[12px] bg-[#F2F2F2] flex items-center justify-center overflow-hidden">
              <button
                type="button"
                aria-label="Add to wishlist"
                className="absolute top-5 right-5 z-10 h-10 w-10 rounded-full bg-white/70 flex items-center justify-center text-[#111111] hover:bg-white transition-colors"
              >
                <Heart size={21} strokeWidth={1.4} />
              </button>

              <img
                src={getFullImageUrl(mainImage)}
                alt={productTitle}
                className="max-w-[88%] max-h-[82vh] lg:max-h-[720px] object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.08)]"
              />
            </div>

            <aside className="order-3 lg:sticky lg:top-[125px] lg:max-h-[calc(100vh-145px)] lg:overflow-y-auto lg:pr-1">
              <div className="bg-white lg:pt-1">
                <div className="mb-3 flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[18px] md:text-[20px] text-[#A5A5A5] leading-tight">
                      {product.category || "Muro Poster"}
                    </p>
                    <h1
                      className="mt-1 text-[18px] md:text-[19px] font-medium leading-tight tracking-[-0.015em] text-[#111111]"
                      style={{ fontFamily: serifFont }}
                    >
                      {productTitle}
                    </h1>
                  </div>

                  <div className="hidden sm:flex h-11 w-11 rounded-full bg-[#F2F2F2] items-center justify-center text-[#006039] text-[11px] font-bold leading-none">
                    FSC
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-[14px] font-semibold">
                  <span>
                    {formatPrice(
                      couponPreview?.finalPrice || productOfferPrice.finalPrice,
                    )}
                  </span>
                  {productOfferPrice.hasOffer && (
                    <span className="text-[#A0A0A0] line-through font-medium">
                      {formatPrice(productOfferPrice.originalPrice)}
                    </span>
                  )}
                  {couponPreview?.hasOffer && couponResult?.valid && (
                    <span className="text-[#006039] text-[11px] uppercase tracking-[0.08em]">
                      {couponResult.discount_percent}% coupon off
                    </span>
                  )}
                </div>


                {sizePrices.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sizePrices.map((size) => {
                      const sizeId = getSizeId(size);
                      const active = sizeId === selectedSizeId;

                      return (
                        <button
                          key={sizeId || getSizeName(size)}
                          type="button"
                          onClick={() => setSelectedSizeId(sizeId)}
                          className={`min-h-[46px] rounded-full border px-4 text-[12px] font-semibold transition-colors ${
                            active
                              ? "bg-[#111111] border-[#111111] text-white"
                              : "bg-white border-[#D4D4D4] text-[#111111] hover:border-[#111111]"
                          }`}
                        >
                          {getSizeName(size)}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <InfoOption
                    label="Size"
                    icon="↗"
                    value={
                      selectedSize ? getSizeName(selectedSize) : "Select size"
                    }
                    trailing={formatPrice(productPrice)}
                  />


                  <div className="rounded-[22px] border border-[#C9C9C9] p-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponResult(null);
                        }}
                        placeholder="Coupon code"
                        className="h-[38px] min-w-0 flex-1 bg-transparent px-2 text-[13px] font-semibold uppercase tracking-[0.08em] outline-none placeholder:text-[#999999]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="h-[38px] rounded-full bg-[#111111] px-5 text-[12px] font-semibold text-white disabled:opacity-60"
                      >
                        {couponLoading ? "Checking" : "Apply"}
                      </button>
                    </div>
                    {couponResult && (
                      <p
                        className={`px-2 pt-2 text-[12px] font-medium ${couponResult.valid ? "text-[#006039]" : "text-red-600"}`}
                      >
                        {couponResult.message ||
                          (couponResult.valid
                            ? "Coupon applied"
                            : "Coupon is not valid")}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading || sizePrices.length === 0}
                  className="mb-3 h-[50px] w-full rounded-full bg-[#333333] text-white text-[14px] font-bold hover:bg-[#111111] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={17} strokeWidth={1.8} />
                  {cartLoading
                    ? "Adding to shopping bag"
                    : "Add to shopping bag"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={cartLoading || sizePrices.length === 0}
                  className="mb-5 h-[46px] w-full rounded-full border border-[#333333] bg-white text-[#111111] text-[14px] font-bold hover:bg-[#F2F2F2] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cartLoading ? "Processing" : "Buy now"}
                </button>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                  <Benefit text="In stock" />
                  <Benefit text="90-day returns" />
                  <Benefit text="Fast and tracked delivery" />
                  <Benefit text="Flexible payments" />
                </div>

                {activeOffer && productOfferPrice.hasOffer && (
                  <div className="mb-5 rounded-[22px] bg-[#F2FF67] px-5 py-3 text-center">
                    <p className="text-[15px] font-extrabold leading-tight">
                      {activeOffer.discount_percent}% off all prints
                    </p>
                    <p className="text-[13px] font-medium leading-tight">
                      {getOfferValidityText(activeOffer)}
                    </p>
                  </div>
                )}

                {variationProducts.length > 1 && (
                  <div className="mb-5">
                    <p className="mb-3 text-[14px] font-semibold">
                      In the same series
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {variationProducts.map((item) => {
                        const itemId = resolveProductId(item);
                        const itemImage = getUploadedProductImage(item);
                        const active =
                          String(itemId) ===
                          String(resolveProductId(product, id));

                        if (!itemId || !itemImage) return null;

                        return (
                          <button
                            key={itemId}
                            type="button"
                            onClick={() => {
                              setProduct(item);
                              navigate(`/product/${itemId}`, {
                                replace: false,
                                state: { productData: item },
                              });
                            }}
                            className={`h-[86px] w-[74px] shrink-0 rounded-[8px] bg-[#F2F2F2] overflow-hidden border transition-colors ${
                              active
                                ? "border-[#111111]"
                                : "border-transparent hover:border-[#CFCFCF]"
                            }`}
                            title={getProductTitle(item)}
                          >
                            <img
                              src={getFullImageUrl(itemImage)}
                              alt={getProductTitle(item)}
                              className="h-full w-full object-contain p-2"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-5 text-[14px] leading-[1.55] text-[#111111]">
                  <p className="line-clamp-5 whitespace-pre-wrap">
                    {shortDescription}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("details-and-description")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="mt-1 underline underline-offset-2 hover:text-[#006039]"
                  >
                    Read more
                  </button>
                </div>

                <div
                  id="details-and-description"
                  className="border-t border-[#E5E5E5]"
                >
                  <AccordionRow
                    title="Details and description"
                    open={detailsOpen}
                    onClick={() => setDetailsOpen((prev) => !prev)}
                  >
                    <div className="space-y-4 text-[14px] leading-[1.65] text-[#333333]">
                      <p className="whitespace-pre-wrap">{longDescription}</p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Tag size={15} className="text-[#999999]" />
                        {productTags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#F2F2F2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666666]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </AccordionRow>

                  <AccordionRow
                    title="Support"
                    open={supportOpen}
                    onClick={() => setSupportOpen((prev) => !prev)}
                  >
                    <p className="text-[14px] leading-[1.65] text-[#333333]">
                      Need help with this product? Contact our support team from
                      the contact page and share the product name or order
                      details.
                    </p>
                  </AccordionRow>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 bg-white">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 xl:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-[15px] md:text-[16px] font-semibold uppercase tracking-[0.08em] text-[#111111]">
              You may also like
            </h2>

            <Link
              to="/products"
              className="shrink-0 text-[13px] font-semibold text-[#111111] underline underline-offset-4 hover:text-[#006039] transition-colors"
            >
              View all
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="h-[18vh] flex items-center justify-center text-[#999999]">
              <p className="text-sm tracking-widest uppercase">
                No related products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-5 gap-y-8">
              {relatedProducts.map((item, index) => {
                const itemTitle = getProductTitle(item);
                const posterImage = getUploadedProductImage(item);
                const itemSizePrices = normalizeSizePrices(item);
                const itemPrice =
                  safeNumber(itemSizePrices[0]?.price) ||
                  safeNumber(item.price || item.base_price) ||
                  500;
                const itemOfferPrice = getActiveOfferPrice(
                  itemPrice,
                  item.active_offer || activeOffer,
                );
                const relatedId = resolveProductId(item);

                if (!relatedId || !posterImage) return null;

                return (
                  <Link
                    key={relatedId || index}
                    to={`/product/${relatedId}`}
                    state={{ productData: item }}
                    className="group block"
                  >
                    <article>
                      <div className="relative rounded-[10px] bg-[#F2F2F2] aspect-[4/5] overflow-hidden flex items-center justify-center">
                        <button
                          type="button"
                          aria-label="Add to wishlist"
                          onClick={(event) => event.preventDefault()}
                          className="absolute top-4 right-4 z-10 text-[#111111] hover:text-[#006039] transition-colors"
                        >
                          <Heart size={21} strokeWidth={1.4} />
                        </button>
                        <img
                          src={getFullImageUrl(posterImage)}
                          alt={itemTitle}
                          className="max-w-[78%] max-h-[78%] object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 items-start">
                        <div className="min-w-0">
                          <p className="text-[14px] text-[#A5A5A5] truncate">
                            {item.category || "Muro Poster"}
                          </p>
                          <h3 className="mt-1 text-[15px] font-semibold text-[#111111] leading-snug">
                            {itemTitle}
                          </h3>
                        </div>

                        <div className="text-right text-[14px] font-semibold whitespace-nowrap">
                          <p>{formatPrice(itemOfferPrice.finalPrice)}</p>
                          {itemOfferPrice.hasOffer && (
                            <p className="text-[#A5A5A5] line-through font-medium">
                              {formatPrice(itemOfferPrice.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
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


const InfoOption = ({
  label,
  icon,
  value,
  trailing,
}: {
  label: string;
  icon: string;
  value: string;
  trailing?: string;
}) => (
  <div className="min-h-[48px] rounded-full border border-[#C9C9C9] px-4 flex items-center gap-3">
    <span className="w-[80px] text-[14px] text-[#111111]">{label}</span>
    <span className="h-7 w-7 shrink-0 rounded-full bg-[#F1F1F1] flex items-center justify-center text-[13px] text-[#111111]">
      {icon}
    </span>
    <span className="min-w-0 flex-1 text-[14px] font-semibold text-[#111111] truncate">
      {value}
    </span>
    {trailing && (
      <span className="text-[14px] font-semibold text-[#111111]">
        {trailing}
      </span>
    )}
    <ChevronRight size={16} className="text-[#111111]" />
  </div>
);

const Benefit = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111111]">
    <span className="h-6 w-6 shrink-0 rounded-full bg-[#F1F1F1] flex items-center justify-center">
      <Check size={14} strokeWidth={2.2} />
    </span>
    <span>{text}</span>
  </div>
);

const AccordionRow = ({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div className="border-b border-[#E5E5E5]">
    <button
      type="button"
      onClick={onClick}
      className="w-full py-4 flex items-center justify-between gap-4 text-left"
    >
      <span className="text-[14px] font-semibold uppercase tracking-[0.03em] text-[#111111]">
        {title}
      </span>
      <ChevronDown
        size={17}
        className={`transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
    {open && <div className="pb-5">{children}</div>}
  </div>
);

export default ProductDetails;
