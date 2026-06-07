import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

type ActiveOffer = {
  id?: number;
  label: string;
  discount_percent: number | string;
  from_date?: string;
  to_date?: string;
};

type OfferPrice = {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  hasOffer: boolean;
};

type PostcardProduct = {
  id: number;
  source?: string;
  source_key?: string;
  product_id?: number;
  image_id?: number;
  product_type?: "postcard" | "sqft";
  product_name: string;
  quality_of_paper?: string;
  size?: string;
  description?: string;
  short_description?: string;
  full_description?: string;
  price?: string | number;
  total_price?: string | number;
  offer_price?: string | number;
  final_price?: string | number;
  front_image_url?: string;
  back_image_url?: string;
  image_url?: string;
  detail_url?: string;
  width?: string | number;
  height?: string | number;
  sqft_price?: string | number;
  active_offer?: ActiveOffer | null;
};

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `https://muroposter.com/${cleanPath}`;
};

const safeNumber = (value?: string | number) => {
  const cleanValue = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const num = Number(cleanValue);
  return Number.isFinite(num) ? num : 0;
};

const formatPrice = (value?: string | number) => {
  const price = safeNumber(value);
  return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const formatPercent = (value?: string | number) => {
  const percent = safeNumber(value);

  if (Number.isInteger(percent)) {
    return String(percent);
  }

  return percent.toFixed(2).replace(/\.?0+$/, "");
};

const getActiveOfferPrice = (
  price: number,
  offer?: ActiveOffer | null,
  apiFinalPrice?: number
): OfferPrice => {
  if (apiFinalPrice && apiFinalPrice > 0 && apiFinalPrice < price) {
    return {
      originalPrice: price,
      finalPrice: apiFinalPrice,
      discountAmount: Math.round((price - apiFinalPrice) * 100) / 100,
      hasOffer: true,
    };
  }

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

const fetchActiveOffers = async (): Promise<ActiveOffer[]> => {
  try {
    const response = await fetch(`${API_BASE}/offers/active`, {
      headers: { Accept: "application/json" },
    });

    const json = await response.json().catch(() => null);
    const rows = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.data?.items)
      ? json.data.items
      : [];

    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("Failed to fetch active offers:", error);
    return [];
  }
};

const fetchPostcardRows = async (): Promise<PostcardProduct[]> => {
  const response = await fetch(`${API_BASE}/postcards`, {
    headers: { Accept: "application/json" },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message || "Failed to fetch postcards");
  }

  const items = Array.isArray(json?.data?.items)
    ? json.data.items
    : Array.isArray(json?.items)
    ? json.items
    : [];

  return items;
};

const Postcards: React.FC = () => {
  const [products, setProducts] = useState<PostcardProduct[]>([]);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const fetchPostcards = async () => {
      setLoading(true);
      setErrorText("");

      try {
        const [items, offers] = await Promise.all([
          fetchPostcardRows(),
          fetchActiveOffers(),
        ]);

        setProducts(items);
        setActiveOffers(offers);
      } catch (error: any) {
        console.error("Failed to fetch postcards:", error);
        setErrorText(error?.message || "Failed to fetch postcards");
        setProducts([]);
        setActiveOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPostcards();
  }, []);

  return (
    <main className="bg-[#F0EEE9] min-h-screen font-sans text-[#1C1C1C]">
      <section className="py-16 px-6 max-w-[1400px] mx-auto">
        <div className="mb-10 text-center">
          <p className="text-[12px] uppercase tracking-[0.24em] text-[#006039] font-semibold mb-3">
            Muro Poster
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
            Postcards
          </h1>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center gap-3">
            <p className="text-sm uppercase tracking-widest text-[#1C1C1C]/45">
              No postcard products found
            </p>

            {errorText && (
              <p className="max-w-xl text-xs text-red-600 tracking-wide">
                {errorText}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-start">
            {products.map((product, index) => {
              const image =
                product.front_image_url || product.image_url || product.back_image_url;

              const basePrice = safeNumber(product.total_price || product.price);
              const apiFinalPrice = safeNumber(product.final_price || product.offer_price);
              const activeOffer = product.active_offer || activeOffers[0] || null;
              const offerPrice = getActiveOfferPrice(basePrice, activeOffer, apiFinalPrice);

              const key =
                product.source_key ||
                `${product.source || "postcard"}-${product.id}-${product.image_id || index}`;

              const detailUrl = product.detail_url || `/postcards/${product.id}`;

              return (
                <Link key={key} to={detailUrl} className="group block">
                  <article>
                    <div className="bg-white rounded-[14px] overflow-hidden">
                      <img
                        src={getFullImageUrl(image)}
                        alt={product.product_name}
                        className="block w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                      />
                    </div>

                    <div className="mt-4">
                      {offerPrice.hasOffer && activeOffer && (
                        <div className="mb-2 inline-flex items-center rounded-full bg-[#006039]/10 border border-[#006039]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#006039]">
                          {activeOffer.label || "Offer"} -{" "}
                          {formatPercent(activeOffer.discount_percent)}% OFF
                        </div>
                      )}

                      <h3 className="text-[14px] md:text-[15px] font-medium text-[#1C1C1C] leading-snug min-h-[42px]">
                        {product.product_name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {offerPrice.hasOffer ? (
                          <>
                            <p className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                              {formatPrice(offerPrice.finalPrice)}
                            </p>
                            <p className="text-[12px] md:text-[13px] font-medium text-[#1C1C1C]/45 line-through">
                              {formatPrice(offerPrice.originalPrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                            {formatPrice(basePrice)}
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
      </section>
    </main>
  );
};

export default Postcards;