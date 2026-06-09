import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Award, Heart, Package, Star, X } from "lucide-react";

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
  page: "#FFFFFF",
  paper: "#F4F4F2",
  ink: "#101010",
  muted: "#9A9A94",
  line: "#E7E4DC",
  accent: "#ECFF66",
  green: "#006039",
};

const serifFont = '"Coolvetica", "Coolvetica Regular", Arial, sans-serif';

const pageContainerClass =
  "mx-auto w-full max-w-[1400px] px-6 sm:px-8 md:px-10 lg:px-12 xl:px-14 2xl:px-16";

const sectionSpacingClass = "w-full bg-white py-8 md:py-10";

const headingStyle: React.CSSProperties = {
  fontFamily: serifFont,
  letterSpacing: "2px",
};

const NEWSLETTER_SUBMITTED_KEY = "muro_newsletter_popup_submitted";
const NEWSLETTER_CLOSED_KEY = "muro_newsletter_popup_closed";

type NewsletterPopupPayload = {
  firstName: string;
  lastName: string;
  email: string;
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
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: smoothEase },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
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

const collectionHighlightTiles: HomeCategoryTile[] = [
  {
    title: "Muro Poster Collection",
    subtitle: "A curated wall-art story for modern rooms.",
    button_text: "Discover",
    button_link: "/products",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1400&auto=format&fit=crop",
  },
  {
    title: "Bestsellers",
    subtitle: "Our most-loved art prints",
    button_text: "Explore",
    button_link: "/products",
    image_url: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=1400&auto=format&fit=crop",
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

const SectionHeading = ({
  title,
  subtitle,
  center = false,
}: {
  title?: string;
  subtitle?: string;
  linkTo?: string;
  linkLabel?: string;
  center?: boolean;
}) => {
  return (
    <div
      className={`mb-7 md:mb-9 flex gap-5 ${
        center ? "justify-center text-center" : "justify-start text-left"
      }`}
    >
      <div className={center ? "mx-auto min-w-0" : "min-w-0"}>
        {title && (
          <h2
            className="text-[24px] md:text-[34px] leading-none text-[#101010] tracking-[2px]"
            style={headingStyle}
          >
            {title}
          </h2>
        )}

        {subtitle && (
          <p
            className={`mt-2 text-[13px] md:text-[14px] leading-relaxed text-[#77736B] ${
              center ? "mx-auto max-w-[620px]" : "max-w-[520px]"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const HomeHeroSlider = ({ slides }: { slides: HomeHeroSlide[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const cleanSlides = slides.length > 0 ? slides : defaultHeroSlides;

  useEffect(() => {
    if (cleanSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cleanSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [cleanSlides.length]);

  useEffect(() => {
    if (activeIndex >= cleanSlides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, cleanSlides.length]);

  const activeSlide = cleanSlides[activeIndex] || defaultHeroSlides[0];

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="relative w-full overflow-hidden bg-[#F4F4F2]"
    >
      <div className="relative h-[calc(100svh-80px)] min-h-[540px] w-full sm:h-[calc(100svh-116px)] lg:min-h-[620px]">
        <Link to={activeSlide.button_link || "/products"} className="group relative block h-full w-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${activeSlide.image_url}-${activeIndex}`}
              src={getFullImageUrl(activeSlide.image_url)}
              alt={activeSlide.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.8, ease: smoothEase }}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-x-0 bottom-0 h-[74%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          <div className="absolute inset-x-5 bottom-10 z-10 text-white md:inset-x-10 md:bottom-14 lg:bottom-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-content-${activeIndex}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.42, ease: smoothEase }}
                className={`${pageContainerClass} flex flex-col items-start`}
              >
                <h1 className="max-w-[920px] text-[44px] leading-[0.92] tracking-[2px] md:text-[76px] lg:text-[104px]" style={headingStyle}>
                  {activeSlide.title}
                </h1>

                {activeSlide.subtitle && (
                  <p className="mt-5 max-w-[620px] text-[14px] leading-relaxed text-white/90 md:text-[16px]">
                    {activeSlide.subtitle}
                  </p>
                )}

                <span className="mt-7 inline-flex rounded-full border border-white/70 bg-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#101010] transition-colors group-hover:bg-[#ECFF66] group-hover:border-[#ECFF66] md:px-10 md:py-4">
                  {activeSlide.button_text || "Explore"}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>

        {cleanSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev - 1 + cleanSlides.length) % cleanSlides.length)}
              className="absolute left-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#101010] shadow-sm transition-colors hover:bg-white md:inline-flex"
              aria-label="Previous slide"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % cleanSlides.length)}
              className="absolute right-5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#101010] shadow-sm transition-colors hover:bg-white md:inline-flex"
              aria-label="Next slide"
            >
              →
            </button>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-7">
              {cleanSlides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-[7px] rounded-full transition-all duration-300 ${
                    activeIndex === index ? "w-9 bg-white" : "w-[7px] bg-white/55 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
};

const ProductSkeletonCard = ({ index }: { index: number }) => {
  return (
    <div className="animate-pulse" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="aspect-[0.78] rounded-[12px] bg-[#F4F4F2]" />
      <div className="mt-4 h-3 w-2/3 rounded-full bg-[#F4F4F2]" />
      <div className="mt-3 h-3 w-1/2 rounded-full bg-[#F4F4F2]" />
    </div>
  );
};

const PosterProductCard = ({ item, activeOffer, index = 0 }: { item: ProductItem; activeOffer: ActiveOffer | null; index?: number }) => {
  const productTitle = getProductTitle(item);
  const posterImage = getUploadedProductImage(item);
  const productPrice = getLowestSizePrice(item);
  const currentOffer = ((item as any).active_offer || activeOffer) as ActiveOffer | null;
  const offerPrice = getOfferPrice(productPrice, currentOffer);
  const productId = getProductId(item);
  const brandText = item.category || item.subcategory || "Muro Poster";

  if (!posterImage || !productId) return null;

  return (
    <motion.div variants={fadeInUp} custom={index}>
      <Link to={`/product/${productId}`} state={{ productData: item }} className="group block w-full">
        <article className="w-full">
          <div className="relative flex aspect-[0.78] w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#F4F4F2] px-8 py-9 md:px-10 md:py-11">
            <button
              type="button"
              aria-label="Add to wishlist"
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#101010]/70 transition-colors hover:bg-white hover:text-[#006039]"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-5 w-5" strokeWidth={1.45} />
            </button>

            <img
              src={getFullImageUrl(posterImage)}
              alt={productTitle}
              className="max-h-full max-w-full object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.10)] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              loading="lazy"
            />
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 px-1">
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-none text-[#A19D96]">{brandText}</p>
              <h3 className="mt-2 min-h-[38px] text-[14px] font-medium leading-snug text-[#101010] md:text-[14px]">{productTitle}</h3>
            </div>

            <div className="text-right">
              <p className="mb-2 text-[13px] leading-none text-[#A19D96]">New</p>
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

const HomeProductCard = ({ item, index = 0 }: { item: HomeProduct; index?: number }) => {
  const image = getHomeProductImage(item);
  const titleText = getHomeProductTitle(item);
  const brandText = getHomeProductBrand(item);
  const finalPrice = getHomeProductPrice(item);
  const originalPrice = safeNumber(item.original_price) || safeNumber((item as any).originalPrice);
  const hasOffer = originalPrice > 0 && originalPrice > finalPrice;
  const offerLabel = String((item as any)?.active_offer?.label || (item as any)?.offer_label || "").trim();

  if (!image) return null;

  return (
    <motion.div variants={fadeInUp} custom={index}>
      <Link to={getHomeProductLink(item, "/products")} className="group block w-full">
        <article className="w-full">
          <div className="relative flex aspect-[0.78] w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#F4F4F2] px-8 py-9 md:px-10 md:py-11">
            <button
              type="button"
              aria-label="Add to wishlist"
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#101010]/70 transition-colors hover:bg-white hover:text-[#006039]"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-5 w-5" strokeWidth={1.45} />
            </button>

            <img
              src={getFullImageUrl(image)}
              alt={titleText}
              className="max-h-full max-w-full object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.10)] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              loading="lazy"
            />
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 px-1">
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-none text-[#A19D96]">{brandText}</p>
              <h3 className="mt-2 min-h-[38px] text-[14px] font-medium leading-snug text-[#101010] md:text-[14px]">{titleText}</h3>
            </div>

            <div className="text-right">
              <p className="mb-2 text-[13px] leading-none text-[#A19D96]">New</p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-[13px] font-semibold text-[#101010] md:text-[14px]">{formatPrice(finalPrice)}</span>
                {hasOffer && <span className="text-[12px] text-[#A19D96] line-through">{formatPrice(originalPrice)}</span>}
              </div>

              {hasOffer && offerLabel && <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#006039]">{offerLabel}</p>}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

const HomeProductShowcase = ({
  title,
  items,
  linkTo,
  subtitle,
}: {
  title?: string;
  items: HomeProduct[];
  linkTo?: string;
  subtitle?: string;
}) => {
  const visibleItems = uniqueHomeItems(items).slice(0, 8);

  if (!visibleItems.length) return null;

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={sectionSpacingClass}
    >
      <div className={pageContainerClass}>
        {(title || subtitle) && <SectionHeading title={title} subtitle={subtitle} />}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6"
        >
          {visibleItems.map((item, index) => (
            <HomeProductCard key={`${item.product_type || "home"}-${item.id || index}`} item={item} index={index} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

const EditorialTile = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  imageUrl,
  index,
}: {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl: string;
  index: number;
}) => {
  return (
    <motion.div variants={fadeInUp} custom={index}>
      <Link to={buttonLink || "/products"} className="group relative block overflow-hidden rounded-[12px] bg-[#F4F4F2] aspect-[4/5]">
        <img
          src={getFullImageUrl(imageUrl)}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.045]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <div className="absolute inset-x-6 bottom-6 text-white md:inset-x-7 md:bottom-7">
          <h3 className="text-[24px] leading-none tracking-[2px] md:text-[30px]" style={headingStyle}>
            {title}
          </h3>
          {subtitle && <p className="mt-3 max-w-[360px] text-[13px] leading-relaxed text-white/90 md:text-[14px]">{subtitle}</p>}
          <span className="mt-4 inline-flex text-[12px] font-semibold uppercase tracking-[0.12em] underline underline-offset-4">
            {buttonText || "Explore"}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

const CollectionHighlightsSection = () => {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={sectionSpacingClass}
    >
      <div className={pageContainerClass}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:gap-6"
        >
          {collectionHighlightTiles.map((item, index) => (
            <motion.div key={`${item.title}-${index}`} variants={fadeInUp} custom={index}>
              <Link
                to={item.button_link || "/products"}
                className="group relative block aspect-[16/13] overflow-hidden rounded-[12px] bg-[#F4F4F2]"
              >
                <img
                  src={getFullImageUrl(item.image_url)}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.045]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
                <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                <div className="absolute inset-x-6 bottom-6 text-white md:inset-x-7 md:bottom-7">
                  <h3 className="text-[24px] leading-none tracking-[2px] md:text-[30px]" style={headingStyle}>
                    {item.title}
                  </h3>

                  {item.subtitle && <p className="mt-3 max-w-[520px] text-[13px] leading-relaxed text-white/90 md:text-[14px]">{item.subtitle}</p>}

                  <span className="mt-4 inline-flex text-[12px] font-semibold uppercase tracking-[0.12em] underline underline-offset-4">
                    {item.button_text || "Explore"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "What paper quality do you use for posters?",
    answer: "We use 300 GSM matte paper for rich colors and a premium feel.",
  },
  {
    question: "Are your posters waterproof or laminated?",
    answer: "Our posters are printed on premium matte paper. They are not waterproof unless lamination or a protected frame is added.",
  },
  {
    question: "Do the posters come framed?",
    answer: "Frames depend on the selected product option. If a frame is not selected, the poster will be shipped as a print.",
  },
  {
    question: "What sizes are available?",
    answer: "Available sizes are shown on each product page. You can select the size before adding the poster to cart.",
  },
  {
    question: "Are the colors true to what I see online?",
    answer: "We try to display colors accurately, but slight variation may happen because every screen has different brightness and color settings.",
  },
  {
    question: "Is wall adhesive included?",
    answer: "Wall adhesive is not included by default unless it is specifically mentioned on the product page or offer details.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery usually takes 5–10 business days after dispatch, depending on your location and courier service.",
  },
  {
    question: "Do you deliver across India?",
    answer: "Yes, we deliver across India through our shipping partners.",
  },
  {
    question: "Can I track my order after it is shipped?",
    answer: "Yes, once your order is shipped, tracking details will be shared with you.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept secure online payments including UPI, cards, wallets and other supported payment options through our payment gateway.",
  },
];

const HomeFAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question} className="border-b border-[#D7D7D7]">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-8 py-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[16px] font-semibold leading-relaxed text-[#101010] md:text-[18px]">
                {item.question}
              </span>

              <span className="shrink-0 text-[24px] font-light leading-none text-[#77736B]">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: smoothEase }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[760px] pb-7 text-[15px] leading-relaxed text-[#77736B] md:text-[16px]">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

const NewsletterPopup = ({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewsletterPopupPayload) => void;
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();

    if (!cleanFirstName || !cleanLastName || !cleanEmail) {
      setError("Please fill first name, last name and email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    onSubmit({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-white/75 px-4 py-6 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter signup"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: smoothEase }}
            className="relative grid w-full max-w-[860px] overflow-hidden rounded-[16px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:grid-cols-[1.04fr_0.96fr]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close newsletter popup"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#111111] transition-colors hover:bg-[#F2F2F2]"
            >
              <X size={16} strokeWidth={1.8} />
            </button>

            <div className="hidden min-h-[520px] bg-[#F2F2F2] md:block">
              <img
                src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1100&auto=format&fit=crop"
                alt="Muro Poster room inspiration"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex min-h-[520px] flex-col justify-center px-6 py-10 text-center md:px-9 lg:px-10">
              <h2
                className="text-[24px] font-bold leading-tight tracking-[2px] text-[#111111] md:text-[28px]"
                style={headingStyle}
              >
                Your walls deserve better.
              </h2>

              <p className="mx-auto mt-5 max-w-[360px] text-[13px] leading-relaxed text-[#333333]">
                Join the Muro Poster community and get 10% off your first order.
                Discover new artists and collections, interior inspiration, and
                be the first to hear about offers.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-3 text-left">
                <input
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setError("");
                  }}
                  placeholder="First name"
                  className="h-[47px] w-full rounded-[8px] border border-[#D7D7D7]/55 bg-white px-4 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#777777] focus:border-[#D7D7D7]"
                />

                <input
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    setError("");
                  }}
                  placeholder="Last name"
                  className="h-[47px] w-full rounded-[8px] border border-[#D7D7D7]/55 bg-white px-4 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#777777] focus:border-[#D7D7D7]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="Email address"
                  className="h-[47px] w-full rounded-[8px] border border-[#D7D7D7]/55 bg-white px-4 text-[13px] text-[#111111] outline-none transition-colors placeholder:text-[#777777] focus:border-[#D7D7D7]"
                />

                {error && (
                  <p className="text-center text-[12px] font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="h-[48px] w-full rounded-full bg-[#000000] text-[13px] font-semibold text-white transition-colors hover:bg-[#006039]"
                >
                  Get my 10% off
                </button>
              </form>

              <button
                type="button"
                onClick={onClose}
                className="mx-auto mt-6 text-[12px] font-medium text-[#111111] transition-colors hover:text-[#006039]"
              >
                No thanks, maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Index: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<ProductItem[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeContent>(emptyHomeContent());
  const [homeNewArrivals, setHomeNewArrivals] = useState<HomeProduct[]>([]);
  const [homePostcards, setHomePostcards] = useState<HomeProduct[]>([]);
  const [homeCutouts, setHomeCutouts] = useState<HomeProduct[]>([]);
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const newsletterTimerRef = useRef<number | null>(null);

  const isNewsletterCompletedOrClosed = () => {
    return (
      window.localStorage.getItem(NEWSLETTER_SUBMITTED_KEY) === "1" ||
      window.localStorage.getItem(NEWSLETTER_CLOSED_KEY) === "1"
    );
  };

  const clearNewsletterTimer = () => {
    if (newsletterTimerRef.current) {
      window.clearTimeout(newsletterTimerRef.current);
      newsletterTimerRef.current = null;
    }
  };

  const scheduleNewsletterPopup = (delay = 10000) => {
    clearNewsletterTimer();

    if (isNewsletterCompletedOrClosed()) {
      return;
    }

    newsletterTimerRef.current = window.setTimeout(() => {
      if (!isNewsletterCompletedOrClosed()) {
        setNewsletterOpen(true);
      }
    }, delay);
  };

  const handleNewsletterClose = () => {
    window.localStorage.setItem(NEWSLETTER_CLOSED_KEY, "1");
    clearNewsletterTimer();
    setNewsletterOpen(false);
  };

  const handleNewsletterSubmit = (payload: NewsletterPopupPayload) => {
    window.localStorage.setItem(NEWSLETTER_SUBMITTED_KEY, "1");
    window.localStorage.setItem(NEWSLETTER_CLOSED_KEY, "1");
    window.localStorage.setItem(
      "muro_newsletter_popup_data",
      JSON.stringify({
        ...payload,
        submitted_at: new Date().toISOString(),
      })
    );

    clearNewsletterTimer();
    setNewsletterOpen(false);
  };

  const heroSlides = useMemo(() => (homeContent.hero_slides.length > 0 ? homeContent.hero_slides : defaultHeroSlides), [homeContent.hero_slides]);
  const categoryTiles = useMemo(() => (homeContent.category_tiles.length > 0 ? homeContent.category_tiles : defaultCategoryTiles), [homeContent.category_tiles]);

  useEffect(() => {
    scheduleNewsletterPopup(10000);

    return () => {
      clearNewsletterTimer();
    };
  }, []);

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
        setBestsellers(posterPool.slice(0, 8) as unknown as ProductItem[]);
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

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-white text-[#101010] selection:bg-[#101010] selection:text-white"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      <HomeHeroSlider slides={heroSlides} />

      <section className={sectionSpacingClass}>
        <div className={pageContainerClass}>
          {loadingBestsellers ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeletonCard key={index} index={index} />
              ))}
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-[12px] bg-[#F4F4F2] px-6 text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#77736B]">No products with uploaded images found</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6"
            >
              {bestsellers.map((item, index) => (
                <PosterProductCard key={String(getProductId(item) || index)} item={item} activeOffer={activeOffer} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className={sectionSpacingClass}
      >
        <div className={pageContainerClass}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-5 md:grid-cols-3 xl:gap-6"
          >
            {categoryTiles.map((item, index) => (
              <EditorialTile
                key={`${item.title}-${index}`}
                title={item.title}
                subtitle={item.subtitle}
                buttonText={item.button_text}
                buttonLink={item.button_link}
                imageUrl={item.image_url}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <HomeProductShowcase
        title="New Arrivals"
        subtitle="Fresh wall prints selected for quick room refreshes."
        items={homeNewArrivals}
       
      />

      <HomeProductShowcase
        title="Postcards"
        subtitle="Compact artworks with front and back postcard options."
        items={homePostcards}
       
      />

      <HomeProductShowcase
      
        items={homeCutouts}
       
      />

      <CollectionHighlightsSection />

      <section className={sectionSpacingClass}>
        <div className={pageContainerClass}>
          <SectionHeading title="DESIGNED FOR EVERY WALL" subtitle="Browse by room and build a look that feels complete." center />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:gap-6">
            {wallRooms.slice(0, 2).map((item) => (
              <Link key={item.name} to={`/products?cat=${encodeURIComponent(item.name)}`} className="group relative block aspect-[16/8] overflow-hidden rounded-[12px] bg-[#F4F4F2]">
                <img
                  src={item.img}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
                <div className="absolute inset-x-6 bottom-6 text-white">
                  <h3 className="text-[26px] tracking-[2px] md:text-[34px]" style={headingStyle}>
                    {item.name}
                  </h3>
                  <span className="mt-2 inline-flex text-[12px] font-semibold uppercase tracking-[0.12em] underline underline-offset-4">Explore</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-8 xl:gap-6">
            {wallRooms.slice(2, 10).map((item) => (
              <Link key={item.name} to={`/products?cat=${encodeURIComponent(item.name)}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#F4F4F2]">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>
                <h3 className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#101010] transition-colors group-hover:text-[#006039]">{item.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionSpacingClass}>
        <div className={pageContainerClass}>
          <SectionHeading
            title="WHY MURO"
            subtitle="Premium posters, safe delivery and easy support — everything kept clean, simple and reliable."
            center
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
            {whyBuyItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[12px] border border-[#E7E4DC] bg-[#F8F8F6] p-6 text-center md:p-7">
                  <div className="mx-auto mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#101010] shadow-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </div>

                  <h3 className="text-[21px] leading-none tracking-[2px] text-[#101010]" style={headingStyle}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#77736B]">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={sectionSpacingClass}>
        <div className={pageContainerClass}>
          <SectionHeading
            title="FREQUENTLY ASKED QUESTIONS"
            subtitle="Quick answers about posters, shipping, payments, support and order handling."
            center
          />

          <HomeFAQSection />
        </div>
      </section>

      <NewsletterPopup
        open={newsletterOpen}
        onClose={handleNewsletterClose}
        onSubmit={handleNewsletterSubmit}
      />
    </main>
  );
};

export default Index;
