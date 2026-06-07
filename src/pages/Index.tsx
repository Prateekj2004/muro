import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Award, Heart, Package, Star } from "lucide-react";

import FAQSection from "../components/FAQSection";
import heroBanner from "@/assets/hero-banner.jpg";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const SITE_ORIGIN = "https://muroposter.com";

type ActiveOffer = { label: string; discount_percent: number };

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
  zoom_in_url?: string;
  wall_poster_url?: string;
  hoverImg?: string;
  main_poster_url?: string;
  defaultImg?: string;
  image_url?: string;
  category?: string;
  subcategory?: string;
  product_images?: ProductImageItem[];
  images?: ProductImageItem[];
  size_prices?: SizePriceItem[];
  sizes?: SizePriceItem[];
};

type HomeHeroSlide = {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
};

type HomeCategoryTile = {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
};

type HomeProduct = {
  id: number;
  product_type?: "poster" | "postcard" | "cutout" | "sqft";
  product_name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  price?: string | number;
  total_price?: string | number;
  original_price?: string | number;
  final_price?: string | number;
  offer_price?: string | number;
  image_url?: string;
  main_poster_url?: string;
  front_image_url?: string;
  back_image_url?: string;
  product_images?: ProductImageItem[];
  size_prices?: SizePriceItem[];
  size?: string;
};

type HomeContent = {
  hero_slides: HomeHeroSlide[];
  category_tiles: HomeCategoryTile[];
  featured_new_arrival_ids: number[];
  featured_postcard_ids: number[];
  featured_cutout_ids: number[];
  featured_new_arrivals: HomeProduct[];
  featured_postcards: HomeProduct[];
  featured_cutouts: HomeProduct[];
};

const COLORS = {
  cloud: "#F0EEE9",
  blackboard: "#1C1C1C",
  green: "#006039",
};

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

  if (cleanPath.includes("uploads/product") || cleanPath.includes("uploads/postcards") || cleanPath.includes("uploads/home")) {
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
  const price = safeNumber(value) || 500;
  return `₹${price.toLocaleString("en-IN")}`;
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

const getProductId = (product: ProductItem) => {
  return product.id || product.product_id || product.productId;
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

const getUploadedProductImage = (product?: ProductItem | null) => {
  const imageRows = Array.isArray(product?.product_images)
    ? product?.product_images
    : Array.isArray(product?.images)
    ? product?.images
    : [];

  const firstUploaded = imageRows
    .slice()
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .find((img) => Boolean(img.image_url || img.url || img.file_url || img.path));

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

const getLowestSizePrice = (product?: ProductItem | null) => {
  const sizeRows = Array.isArray(product?.size_prices)
    ? product?.size_prices
    : Array.isArray(product?.sizes)
    ? product?.sizes
    : [];

  const prices = sizeRows.map((size) => safeNumber(size.price)).filter((price) => price > 0);

  if (prices.length > 0) {
    return Math.min(...prices);
  }

  return safeNumber(product?.price || product?.base_price) || 500;
};

const getHomeProductImage = (item?: HomeProduct | null) => {
  const imageRows = Array.isArray(item?.product_images) ? item?.product_images : [];
  const firstUploaded = imageRows
    .slice()
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .find((img) => Boolean(img.image_url || img.url || img.file_url || img.path));

  return (
    firstUploaded?.image_url ||
    firstUploaded?.url ||
    firstUploaded?.file_url ||
    firstUploaded?.path ||
    item?.image_url ||
    item?.main_poster_url ||
    item?.front_image_url ||
    item?.back_image_url ||
    ""
  );
};

const getHomeProductPrice = (item?: HomeProduct | null) => {
  const sizeRows = Array.isArray(item?.size_prices) ? item?.size_prices : [];
  const sizePrices = sizeRows.map((size) => safeNumber(size.price)).filter((price) => price > 0);

  if (sizePrices.length > 0) {
    return Math.min(...sizePrices);
  }

  return safeNumber(item?.final_price) || safeNumber(item?.offer_price) || safeNumber(item?.total_price) || safeNumber(item?.price) || 500;
};

const getHomeProductTitle = (item?: HomeProduct | null) => {
  return String(item?.product_name || item?.title || "Product").trim() || "Product";
};

const getHomeProductBrand = (item?: HomeProduct | null) => {
  if (item?.product_type === "postcard") return "Postcard";
  if (item?.product_type === "cutout" || item?.product_type === "sqft") return "CutOut";
  return item?.category || "Muro Poster";
};

const getHomeProductLink = (item: HomeProduct, fallback: string) => {
  if (item.product_type === "postcard") return `/postcards/${item.id}`;
  if (item.product_type === "cutout" || item.product_type === "sqft") return `/cutouts/${item.id}`;
  return item.id ? `/product/${item.id}` : fallback;
};

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const defaultHeroSlides: HomeHeroSlide[] = [
  {
    image_url: heroBanner,
    title: "Transform Your Walls.",
    subtitle: "Premium poster prints curated for beautiful living.",
    button_text: "Start Curating →",
    button_link: "/products",
  },
  {
    image_url: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1800&auto=format&fit=crop",
    title: "Art For Every Space.",
    subtitle: "Bring warmth, mood and personality into your room.",
    button_text: "Explore Posters →",
    button_link: "/products",
  },
  {
    image_url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1800&auto=format&fit=crop",
    title: "Curated Wall Prints.",
    subtitle: "Simple, premium and meaningful posters for modern homes.",
    button_text: "Shop Now →",
    button_link: "/products",
  },
];

const moods = [
  {
    label: "Motivational & Mindset",
    cat: "Aesthetic & Vibe",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
  },
  {
    label: "Aesthetic & Vibe",
    cat: "Calm & Inner Balance",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
  },
  {
    label: "Love & Connection",
    cat: "Motivational & Mindset",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
  },
  {
    label: "Kids – Learning & Confidence",
    cat: "Aesthetic & Vibe",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
  },
  {
    label: "Calm & Inner Balance",
    cat: "Motivational & Mindset",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop",
  },
  {
    label: "Fandom & Passion",
    cat: "Kitchen & Dining",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
  },
];

const defaultCategoryTiles: HomeCategoryTile[] = [
  {
    title: "New Arrivals",
    subtitle: "New prints to refresh your walls",
    button_text: "Discover",
    button_link: "/new-arrivals",
    image_url: "images/posters.webp",
  },
  {
    title: "Kids Art Prints",
    subtitle: "Playful prints to bring joy to their space",
    button_text: "Explore",
    button_link: "/products?cat=Kids%20Art%20Prints",
    image_url: "images/cutouts.webp",
  },
  {
    title: "Postcards",
    subtitle: "Front and back postcard products with premium paper options",
    button_text: "Explore",
    button_link: "/postcards",
    image_url: "images/postcards.webp",
  },
];

const wallRooms = [
  {
    name: "Bedroom",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  },
  {
    name: "Living Room",
    img: "https://images.unsplash.com/photo-1493666438817-866a91353ca9",
  },
  {
    name: "Office",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174",
  },
  {
    name: "Gym",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
  },
  {
    name: "Kitchen",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  },
  {
    name: "Kids Room",
    img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9",
  },
  {
    name: "Hallway",
    img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  },
  {
    name: "Dining Room",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  },
  {
    name: "Studio",
    img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  },
  {
    name: "Bathroom",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  },
];

const whyBuyItems = [
  {
    icon: Award,
    title: "Premium Print Quality",
    text: "Sharp, vibrant and long-lasting prints made for modern homes.",
  },
  {
    icon: Package,
    title: "Safe Packaging",
    text: "Every poster is packed carefully so it reaches you safely.",
  },
  {
    icon: Heart,
    title: "Made With Intention",
    text: "Simple wall art designed to add warmth and personality.",
  },
  {
    icon: Star,
    title: "Easy Support",
    text: "Quick help available through Email and WhatsApp.",
  },
];

const normalizeHeroSlides = (items: any): HomeHeroSlide[] => {
  const rows = Array.isArray(items) ? items : [];
  const normalized = rows
    .slice(0, 3)
    .map((row: any, index: number) => ({
      title: String(row?.title || defaultHeroSlides[index]?.title || ""),
      subtitle: String(row?.subtitle || defaultHeroSlides[index]?.subtitle || ""),
      button_text: String(row?.button_text || row?.buttonText || defaultHeroSlides[index]?.button_text || "Explore"),
      button_link: String(row?.button_link || row?.buttonLink || defaultHeroSlides[index]?.button_link || "/products"),
      image_url: String(row?.image_url || row?.image || defaultHeroSlides[index]?.image_url || ""),
    }))
    .filter((row) => row.image_url);

  return normalized.length > 0 ? normalized : defaultHeroSlides;
};

const normalizeCategoryTiles = (items: any): HomeCategoryTile[] => {
  const rows = Array.isArray(items) ? items : [];
  const normalized = rows
    .slice(0, 3)
    .map((row: any, index: number) => ({
      title: String(row?.title || defaultCategoryTiles[index]?.title || ""),
      subtitle: String(row?.subtitle || defaultCategoryTiles[index]?.subtitle || ""),
      button_text: String(row?.button_text || row?.buttonText || row?.cta || defaultCategoryTiles[index]?.button_text || "Explore"),
      button_link: String(row?.button_link || row?.buttonLink || row?.to || defaultCategoryTiles[index]?.button_link || "/products"),
      image_url: String(row?.image_url || row?.image || row?.img || defaultCategoryTiles[index]?.image_url || ""),
    }))
    .filter((row) => row.image_url);

  return normalized.length > 0 ? normalized : defaultCategoryTiles;
};

const emptyHomeContent = (): HomeContent => ({
  hero_slides: defaultHeroSlides,
  category_tiles: defaultCategoryTiles,
  featured_new_arrival_ids: [],
  featured_postcard_ids: [],
  featured_cutout_ids: [],
  featured_new_arrivals: [],
  featured_postcards: [],
  featured_cutouts: [],
});

const fetchHomeContent = async (): Promise<HomeContent> => {
  try {
    const response = await fetch(`${API_BASE}/home-content`);
    const json = await response.json().catch(() => null);
    const data = json?.data || json || {};

    return {
      hero_slides: normalizeHeroSlides(data.hero_slides),
      category_tiles: normalizeCategoryTiles(data.category_tiles),
      featured_new_arrival_ids: Array.isArray(data.featured_new_arrival_ids) ? data.featured_new_arrival_ids.map(Number).filter(Boolean) : [],
      featured_postcard_ids: Array.isArray(data.featured_postcard_ids) ? data.featured_postcard_ids.map(Number).filter(Boolean) : [],
      featured_cutout_ids: Array.isArray(data.featured_cutout_ids) ? data.featured_cutout_ids.map(Number).filter(Boolean) : [],
      featured_new_arrivals: Array.isArray(data.featured_new_arrivals) ? data.featured_new_arrivals : [],
      featured_postcards: Array.isArray(data.featured_postcards) ? data.featured_postcards : [],
      featured_cutouts: Array.isArray(data.featured_cutouts) ? data.featured_cutouts : [],
    };
  } catch (error) {
    console.error("Failed to fetch home content:", error);
    return emptyHomeContent();
  }
};

const fetchPublicItems = async (endpoint: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const json = await response.json().catch(() => null);

    if (Array.isArray(json?.data?.items)) return json.data.items;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json)) return json;

    return [];
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return [];
  }
};

const normalizePosterProductForHome = (item: any): HomeProduct | null => {
  const id = Number(item?.id || item?.product_id || item?.productId || 0);
  const image = getUploadedProductImage(item);

  if (!id || !image) return null;

  return {
    ...item,
    id,
    product_type: "poster",
    product_name: getProductTitle(item),
    title: getProductTitle(item),
    image_url: image,
    main_poster_url: item?.main_poster_url || item?.image_url || image,
    price: item?.price || item?.base_price || getLowestSizePrice(item),
    original_price: item?.original_price || item?.originalPrice,
    final_price: item?.final_price,
    offer_price: item?.offer_price,
    product_images: Array.isArray(item?.product_images) ? item.product_images : Array.isArray(item?.images) ? item.images : [],
    size_prices: Array.isArray(item?.size_prices) ? item.size_prices : Array.isArray(item?.sizes) ? item.sizes : [],
  };
};

const normalizePostcardProductForHome = (item: any, fallbackType: "postcard" | "cutout"): HomeProduct | null => {
  const id = Number(item?.id || item?.product_id || item?.productId || 0);
  const productType = String(item?.product_type || fallbackType).toLowerCase() as "postcard" | "cutout" | "sqft";
  const image = String(item?.image_url || item?.front_image_url || item?.main_poster_url || item?.back_image_url || "");

  if (!id || !image) return null;

  return {
    ...item,
    id,
    product_type: productType,
    product_name: String(item?.product_name || item?.title || item?.name || "Product"),
    title: String(item?.title || item?.product_name || item?.name || "Product"),
    image_url: image,
    front_image_url: item?.front_image_url || "",
    back_image_url: item?.back_image_url || "",
    price: item?.price,
    total_price: item?.total_price,
    final_price: item?.final_price,
    offer_price: item?.offer_price,
    size: item?.size || "",
  };
};

const uniqueHomeItems = (items: HomeProduct[]): HomeProduct[] => {
  const seen = new Set<string>();
  const clean: HomeProduct[] = [];

  items.forEach((item) => {
    const key = `${item.product_type || "poster"}-${Number(item.id || 0)}`;
    if (!item.id || seen.has(key) || !getHomeProductImage(item)) return;
    seen.add(key);
    clean.push(item);
  });

  return clean;
};

const fetchHomeProductById = async (id: number, type: "poster" | "postcard" | "cutout"): Promise<HomeProduct | null> => {
  try {
    const endpoint = type === "poster" ? `/products/view?id=${id}` : type === "postcard" ? `/postcards/${id}` : `/cutouts/${id}`;
    const response = await fetch(`${API_BASE}${endpoint}`);
    const json = await response.json().catch(() => null);
    const item = json?.data?.product || json?.data || json?.product || null;

    if (!item) return null;

    if (type === "poster") {
      return normalizePosterProductForHome(item);
    }

    return normalizePostcardProductForHome(item, type);
  } catch (error) {
    console.error(`Failed to fetch home ${type} ${id}:`, error);
    return null;
  }
};

const resolveFeaturedHomeItems = async ({
  provided,
  selectedIds,
  pool,
  type,
  fallbackLimit = 8,
}: {
  provided: HomeProduct[];
  selectedIds: number[];
  pool: HomeProduct[];
  type: "poster" | "postcard" | "cutout";
  fallbackLimit?: number;
}): Promise<HomeProduct[]> => {
  const cleanProvided = uniqueHomeItems(Array.isArray(provided) ? provided : []);
  if (cleanProvided.length > 0) {
    return cleanProvided.slice(0, 12);
  }

  const ids = Array.isArray(selectedIds) ? selectedIds.map(Number).filter(Boolean) : [];
  const cleanPool = uniqueHomeItems(pool);

  if (ids.length > 0) {
    const poolById = new Map(cleanPool.map((item) => [Number(item.id), item]));
    const selectedFromPool = ids.map((id) => poolById.get(id)).filter(Boolean) as HomeProduct[];
    const missingIds = ids.filter((id) => !poolById.has(id));

    if (missingIds.length > 0) {
      const fetchedItems = await Promise.all(missingIds.map((id) => fetchHomeProductById(id, type)));
      const fetchedById = new Map(fetchedItems.filter(Boolean).map((item) => [Number(item!.id), item!]));
      const ordered = ids.map((id) => poolById.get(id) || fetchedById.get(id)).filter(Boolean) as HomeProduct[];
      return uniqueHomeItems(ordered).slice(0, 12);
    }

    return uniqueHomeItems(selectedFromPool).slice(0, 12);
  }

  return cleanPool.slice(0, fallbackLimit);
};

const HomeProductSlider = ({
  title,
  items,
  linkTo,
}: {
  title: string;
  items: HomeProduct[];
  linkTo: string;
}) => {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const visibleItems = uniqueHomeItems(items).slice(0, 12);

  if (!visibleItems.length) return null;

  const scroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const distance = Math.max(track.clientWidth * 0.78, 280);
    track.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <section className="w-full py-9 md:py-10 bg-[#F0EEE9]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-7 md:mb-8 flex items-center justify-between gap-4">
          <h2 className="font-normal tracking-[0.18em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-none">
            {title}
          </h2>

          <div className="flex items-center gap-4 md:gap-5">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1C1C1C]/15 bg-white/70 text-[#1C1C1C] hover:bg-[#006039] hover:text-white transition-colors"
              aria-label={`Previous ${title}`}
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#1C1C1C]/15 bg-white/70 text-[#1C1C1C] hover:bg-[#006039] hover:text-white transition-colors"
              aria-label={`Next ${title}`}
            >
              →
            </button>

            <Link
              to={linkTo}
              className="shrink-0 text-[12px] md:text-[14px] font-semibold tracking-[0.24em] text-[#1C1C1C] uppercase hover:text-[#006039] transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleItems.map((item, index) => {
            const image = getHomeProductImage(item);
            const titleText = getHomeProductTitle(item);
            const brandText = getHomeProductBrand(item);
            const finalPrice = getHomeProductPrice(item);
            const originalPrice = safeNumber(item.original_price) || safeNumber((item as any).originalPrice);
            const hasOffer = originalPrice > 0 && originalPrice > finalPrice;
            const offerLabel = String((item as any)?.active_offer?.label || (item as any)?.offer_label || "").trim();

            if (!image) return null;

            return (
              <Link
                key={`${item.product_type || "home"}-${item.id || index}`}
                to={getHomeProductLink(item, linkTo)}
                className="group block shrink-0 w-[68vw] max-w-[300px] sm:w-[250px] md:w-[270px] lg:w-[285px] xl:w-[300px] snap-start"
              >
                <article className="w-full">
                  <div className="relative w-full rounded-[14px] overflow-hidden bg-white flex items-center justify-center">
                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="absolute top-4 right-4 z-10 text-[#1C1C1C]/70 hover:text-[#006039] transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="w-5 h-5" strokeWidth={1.6} />
                    </button>

                    <img
                      src={getFullImageUrl(image)}
                      alt={titleText}
                      className="block w-full h-auto max-h-[360px] object-contain rounded-[14px] transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                      <div className="min-w-0">
                        <p className="text-[12px] md:text-[14px] text-[#1C1C1C]/45 font-medium truncate">
                          {brandText}
                        </p>
                        <h3 className="mt-1 text-[14px] md:text-[15px] font-medium text-[#1C1C1C] leading-snug line-clamp-2 min-h-[40px]">
                          {titleText}
                        </h3>
                      </div>

                      <p className="text-[12px] md:text-[14px] text-[#1C1C1C]/45 font-medium shrink-0">
                        New
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {hasOffer && (
                        <span className="text-[12px] md:text-[13px] text-[#1C1C1C]/35 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}

                      <span className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                        {formatPrice(finalPrice)}
                      </span>

                      {hasOffer && offerLabel && (
                        <span className="text-[10px] md:text-[11px] font-bold text-[#006039] uppercase tracking-[0.16em]">
                          {offerLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Index: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<ProductItem[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeContent>(emptyHomeContent());
  const [homeNewArrivals, setHomeNewArrivals] = useState<HomeProduct[]>([]);
  const [homePostcards, setHomePostcards] = useState<HomeProduct[]>([]);
  const [homeCutouts, setHomeCutouts] = useState<HomeProduct[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);

  const heroSlides = useMemo(() => homeContent.hero_slides.length > 0 ? homeContent.hero_slides : defaultHeroSlides, [homeContent.hero_slides]);
  const categoryTiles = useMemo(() => homeContent.category_tiles.length > 0 ? homeContent.category_tiles : defaultCategoryTiles, [homeContent.category_tiles]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % Math.max(heroSlides.length, 1));
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (activeHeroIndex >= heroSlides.length) {
      setActiveHeroIndex(0);
    }
  }, [activeHeroIndex, heroSlides.length]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoadingBestsellers(true);

      try {
        const [homeRes, productsRes, offerRes, postcardRes, cutoutRes]: any = await Promise.all([
          fetchHomeContent(),
          fetchPublicItems("/products?limit=80"),
          fetchActiveOffer(),
          fetchPublicItems("/postcards"),
          fetchPublicItems("/cutouts"),
        ]);

        const posterPool = uniqueHomeItems(
          (Array.isArray(productsRes) ? productsRes : [])
            .map((item: any) => normalizePosterProductForHome(item))
            .filter(Boolean) as HomeProduct[]
        );

        const postcardPool = uniqueHomeItems(
          (Array.isArray(postcardRes) ? postcardRes : [])
            .map((item: any) => normalizePostcardProductForHome(item, "postcard"))
            .filter(Boolean) as HomeProduct[]
        );

        const cutoutPool = uniqueHomeItems(
          (Array.isArray(cutoutRes) ? cutoutRes : [])
            .map((item: any) => normalizePostcardProductForHome(item, "cutout"))
            .filter(Boolean) as HomeProduct[]
        );

        const newArrivalItems = await resolveFeaturedHomeItems({
          provided: homeRes.featured_new_arrivals || [],
          selectedIds: homeRes.featured_new_arrival_ids || [],
          pool: posterPool,
          type: "poster",
        });

        const postcardItems = await resolveFeaturedHomeItems({
          provided: homeRes.featured_postcards || [],
          selectedIds: homeRes.featured_postcard_ids || [],
          pool: postcardPool,
          type: "postcard",
        });

        const cutoutItems = await resolveFeaturedHomeItems({
          provided: homeRes.featured_cutouts || [],
          selectedIds: homeRes.featured_cutout_ids || [],
          pool: cutoutPool,
          type: "cutout",
        });

        setHomeContent(homeRes);
        setActiveOffer(offerRes);
        setBestsellers(posterPool.slice(0, 5) as ProductItem[]);
        setHomeNewArrivals(newArrivalItems);
        setHomePostcards(postcardItems);
        setHomeCutouts(cutoutItems);
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      } finally {
        setLoadingBestsellers(false);
      }
    };

    fetchHomeData();
  }, []);

  const activeHero = heroSlides[activeHeroIndex] || defaultHeroSlides[0];

  return (
    <main
      className="min-h-screen overflow-x-hidden font-sans selection:text-white"
      style={{
        backgroundColor: COLORS.cloud,
        color: COLORS.blackboard,
      }}
    >
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHeroIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 1.1, ease: smoothEase }}
            className="absolute inset-0"
          >
            <img
              src={getFullImageUrl(activeHero.image_url)}
              alt={activeHero.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-8 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${activeHeroIndex}`}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl mx-auto md:mx-0 text-center md:text-left"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-8xl text-white mb-6 drop-shadow-md leading-[1.05] font-semibold tracking-[-0.04em]"
              >
                {activeHero.title}
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-white text-lg md:text-2xl mb-8 font-normal">
                {activeHero.subtitle}
              </motion.p>

              <motion.div variants={fadeInUp}>
                <Link
                  to={activeHero.button_link || "/products"}
                  className="inline-flex items-center justify-center bg-white text-[#1C1C1C] px-10 py-4 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#006039] hover:text-white transition-all"
                >
                  {activeHero.button_text || "Explore"}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute left-0 right-0 bottom-8 z-20 flex items-center justify-center gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={`${slide.title}-${index}`}
              type="button"
              onClick={() => setActiveHeroIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-[8px] rounded-full transition-all duration-300 ${
                activeHeroIndex === index ? "w-[34px] bg-white" : "w-[8px] bg-white/55 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="w-full py-12">
        <div className="max-w-[1400px] mx-auto px-2 md:px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 items-start">
            {moods.map(({ label, cat, img }) => (
              <Link key={label} to={`/products?cat=${encodeURIComponent(cat)}`} className="group flex flex-col gap-2 text-center">
                <div className="relative overflow-hidden rounded-xl aspect-square bg-white">
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl" />
                </div>

                <p className="min-h-[38px] text-[14px] font-medium text-[#1C1C1C] tracking-tight flex items-center justify-center gap-1 group-hover:gap-2 transition-all duration-200 text-center flex-wrap leading-snug">
                  {label}
                  <span className="text-[#006039] transition-opacity">→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-10 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-normal tracking-[0.18em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-none">
              Best Sellers
            </h2>

            <Link
              to="/products"
              className="shrink-0 text-[12px] md:text-[14px] font-medium tracking-[0.18em] text-[#1C1C1C] uppercase hover:text-[#006039] transition-colors"
            >
              View All
            </Link>
          </div>

          {loadingBestsellers ? (
            <div className="h-[30vh] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="h-[20vh] flex items-center justify-center text-[#1C1C1C]/45">
              <p className="text-sm tracking-widest uppercase">No products with uploaded images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-start">
              {bestsellers.map((item, index) => {
                const productTitle = getProductTitle(item);
                const posterImage = getUploadedProductImage(item);
                const productPrice = getLowestSizePrice(item);
                const offerPrice = getOfferPrice(productPrice, (item as any).active_offer || activeOffer);
                const productId = getProductId(item);

                if (!posterImage || !productId) return null;

                return (
                  <Link key={productId || index} to={`/product/${productId}`} state={{ productData: item }} className="group cursor-pointer block w-full">
                    <article className="w-full">
                      <img
                        src={getFullImageUrl(posterImage)}
                        alt={productTitle}
                        className="block w-full h-auto rounded-[14px] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                      />

                      <div className="mt-4">
                        <h3 className="text-[14px] md:text-[15px] font-medium text-[#1C1C1C] leading-snug min-h-[42px]">
                          {productTitle}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">
                          {offerPrice.hasOffer && (
                            <span className="text-[12px] text-[#1C1C1C]/35 line-through">
                              {formatPrice(offerPrice.originalPrice)}
                            </span>
                          )}

                          <span className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                            {formatPrice(offerPrice.finalPrice)}
                          </span>

                          {((item as any).active_offer || activeOffer) && offerPrice.hasOffer && (
                            <span className="text-[10px] font-bold text-[#006039] uppercase tracking-[0.12em]">
                              {((item as any).active_offer || activeOffer)?.label}
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
        </div>
      </section>

      <section className="w-full py-12 md:py-14 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {categoryTiles.map((item, index) => (
              <Link
                key={`${item.title}-${index}`}
                to={item.button_link || "/products"}
                className="relative group overflow-hidden rounded-[26px] aspect-[4/5] block bg-white"
              >
                <img
                  src={getFullImageUrl(item.image_url)}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

                <div className="absolute inset-x-7 bottom-[18%] flex flex-col items-center text-center text-white">
                  {item.subtitle && (
                    <p className="text-[13px] md:text-[15px] font-medium leading-snug mb-4 text-white/95 drop-shadow">
                      {item.subtitle}
                    </p>
                  )}

                  <span className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-white px-8 py-4 text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#1C1C1C] shadow-lg transition-all group-hover:bg-[#006039] group-hover:text-white">
                    {item.button_text || item.title || "Explore"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeProductSlider title="New Arrivals" items={homeNewArrivals} linkTo="/products" />
      <HomeProductSlider title="Postcards" items={homePostcards} linkTo="/postcards" />
      <HomeProductSlider title="CutOuts" items={homeCutouts} linkTo="/cutouts" />

      <section className="w-full py-12 md:py-14 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#006039] font-semibold mb-3">
                Why Muro
              </p>

              <h2 className="font-normal tracking-[0.12em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-snug">
                Simple reasons to buy from us
              </h2>
            </div>

            <p className="text-[14px] md:text-[15px] text-[#1C1C1C]/65 leading-relaxed max-w-[470px]">
              Premium posters, safe delivery and easy support — everything kept clean, simple and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {whyBuyItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[22px] bg-white/70 border border-[#1C1C1C]/10 p-6 md:p-7 min-h-[190px] flex flex-col justify-between hover:bg-white transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-[#006039]/10 flex items-center justify-center mb-8">
                    <Icon className="w-5 h-5 text-[#006039]" strokeWidth={1.8} />
                  </div>

                  <div>
                    <h3 className="text-[18px] md:text-[20px] text-[#1C1C1C] font-semibold mb-2 tracking-[-0.02em]">
                      {item.title}
                    </h3>

                    <p className="text-[14px] leading-relaxed text-[#1C1C1C]/65">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full py-10 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-normal tracking-[0.18em] text-[22px] text-[#1C1C1C] hover:text-[#006039] transition-colors uppercase leading-snug">
              Designed For Every Wall
            </h2>

            <Link
              to="/categories"
              className="shrink-0 text-[12px] md:text-[14px] font-medium tracking-[0.18em] text-[#1C1C1C] uppercase hover:text-[#006039] transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-start">
            {wallRooms.map((item) => (
              <div key={item.name} className="group cursor-pointer flex flex-col">
                <div className="relative aspect-[3/4] bg-white overflow-hidden mb-3 rounded-[18px]">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500 z-10" />
                </div>

                <div className="flex flex-col items-start text-left w-full mt-1">
                  <h3 className="text-[13px] font-medium text-[#1C1C1C] leading-snug mb-1 w-full uppercase tracking-[0.12em]">
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-10 md:py-12 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-normal tracking-[0.18em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-snug">
              Frequently Asked Questions
            </h2>

            <p className="hidden md:block text-[14px] md:text-[15px] text-[#1C1C1C]/60 leading-relaxed max-w-[460px]">
              Quick answers about posters, shipping, payments, support and order handling.
            </p>
          </div>

          <FAQSection id="faqs" />
        </div>
      </section>
    </main>
  );
};

export default Index;
