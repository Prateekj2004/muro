import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Tag } from "lucide-react";
import { toast } from "sonner";

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

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/600x800?text=No+Image";
  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `https://muroposter.com/${cleanPath}`;
};

const safeNumber = (value?: string | number) => {
  const cleanValue = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const num = Number(cleanValue);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

const formatPrice = (value?: string | number) => {
  const price = safeNumber(value);
  return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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

type CutoutProduct = {
  id: number;
  product_type: "cutout" | "sqft";
  product_name: string;
  size?: string;
  description?: string;
  short_description?: string;
  full_description?: string;
  price?: string | number;
  total_price?: string | number;
  image_url?: string;
  front_image_url?: string;
  width?: string | number;
  height?: string | number;
  sqft_price?: string | number;
  active_offer?: ActiveOffer | null;
};

const CutoutDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<CutoutProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/cutouts/${id}`);
        const json = await response.json().catch(() => null);
        setProduct(json?.data?.product || null);
      } catch (error) {
        console.error("Failed to fetch cutout product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    fetchActiveOffers().then(setActiveOffers);
  }, []);

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
          <h1 className="text-[28px] font-semibold text-[#1C1C1C] mb-4">CutOut product not found</h1>
          <Link to="/cutouts" className="inline-flex items-center justify-center bg-[#1C1C1C] text-white px-8 py-3 text-[12px] uppercase tracking-[0.18em]">
            Back to CutOuts
          </Link>
        </div>
      </main>
    );
  }

  const basePrice = safeNumber(product.total_price || product.price);
  const activeOffer = product.active_offer || activeOffers[0] || null;
  const offerPreview = getActiveOfferPrice(basePrice, activeOffer);
  const couponPreview = couponResult?.valid
    ? getActiveOfferPrice(offerPreview.finalPrice, {
        label: couponResult.code || "Coupon",
        discount_percent: couponResult.discount_percent || 0,
      })
    : null;
  const image = product.image_url || product.front_image_url;
  const shortDescription = product.short_description || product.description || "Premium cutout product.";
  const fullDescription = product.full_description || product.description || shortDescription;

  return (
    <main className="bg-[#F0EEE9] min-h-screen font-sans text-[#1C1C1C]">
      <section className="w-full py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#1C1C1C]/45">
            <Link to="/" className="hover:text-[#1C1C1C] transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link to="/cutouts" className="hover:text-[#1C1C1C] transition-colors">CutOuts</Link>
            <ChevronRight size={13} />
            <span className="text-[#1C1C1C] font-semibold">{product.product_name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
            <div className="bg-white rounded-[24px] overflow-hidden p-5">
              <img src={getFullImageUrl(image)} alt={product.product_name} className="block w-full h-auto object-contain" />
            </div>

            <div className="w-full lg:pt-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#1C1C1C]/40 mb-5">
                CutOut
              </p>

              <h1 className="text-[34px] md:text-[42px] lg:text-[46px] leading-tight font-normal tracking-[-0.04em] mb-5">
                {product.product_name}
              </h1>

              <div className="mb-5">
                <div className="flex flex-wrap items-end gap-3">
                  {offerPreview.hasOffer && (
                    <span className="text-[18px] text-[#1C1C1C]/35 line-through mb-1">
                      {formatPrice(offerPreview.originalPrice)}
                    </span>
                  )}
                  <span className="text-[28px] md:text-[32px] font-semibold">
                    {formatPrice(couponPreview?.finalPrice || offerPreview.finalPrice)}
                  </span>
                </div>

                {activeOffer && offerPreview.hasOffer && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#006039]/10 border border-[#006039]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#006039]">
                    <Tag size={13} />
                    {activeOffer.label} - {activeOffer.discount_percent}% OFF
                  </div>
                )}

                {couponPreview?.hasOffer && couponResult?.valid && (
                  <div className="mt-2 text-[12px] font-semibold text-[#006039] uppercase tracking-[0.12em]">
                    Coupon {couponResult.code} applied: {couponResult.discount_percent}% extra off
                  </div>
                )}
              </div>

              <p className="text-[15px] md:text-[16px] leading-relaxed text-[#1C1C1C]/65 mb-7 max-w-[650px] whitespace-pre-wrap">
                {shortDescription}
              </p>

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

              <div className="rounded-[22px] bg-white/65 border border-[#1C1C1C]/8 p-6 md:p-7 mb-7 space-y-4">
                {product.size && <InfoRow label="Size" value={product.size} />}
                <InfoRow label="Width" value={String(product.width || 0)} />
                <InfoRow label="Height" value={String(product.height || 0)} />
                <InfoRow label="Sqft Price" value={formatPrice(product.sqft_price)} />
              </div>

              <div className="rounded-[22px] bg-white/65 border border-[#1C1C1C]/8 p-6 md:p-7">
                <h2 className="text-[13px] uppercase tracking-[0.18em] font-semibold mb-4">Long Description</h2>
                <p className="text-[14px] md:text-[15px] leading-relaxed text-[#1C1C1C]/65 whitespace-pre-wrap">
                  {fullDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-5 border-b border-[#1C1C1C]/8 pb-3 last:border-b-0 last:pb-0">
    <span className="text-[11px] uppercase tracking-[0.18em] text-[#1C1C1C]/45 font-semibold">{label}</span>
    <span className="text-[14px] font-semibold text-right">{value}</span>
  </div>
);

export default CutoutDetails;
