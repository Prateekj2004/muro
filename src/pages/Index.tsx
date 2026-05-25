import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { Award, Heart, Package, Star } from "lucide-react";

import { API } from "@/services/api";
import FAQSection from "../components/FAQSection";
import heroBanner from "@/assets/hero-banner.jpg";

type ProductItem = {
  id?: string | number;
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
};

const COLORS = {
  cloud: "#F0EEE9",
  blackboard: "#1C1C1C",
  green: "#006039",
};

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";

  if (path.startsWith("http")) return path;

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (!cleanPath.includes("uploads/product")) {
    cleanPath = `uploads/product/${cleanPath}`;
  }

  return `https://muroposter.com/${cleanPath}`;
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

const categoryTiles = [
  {
    title: "New Arrivals",
    subtitle: "New prints to refresh your walls",
    cta: "Discover",
    to: "/new-arrivals",
    img: "images/posters.webp",
    alt: "New Arrivals",
  },
  {
    title: "Kids Art Prints",
    subtitle: "Playful prints to bring joy to their space",
    cta: "Explore",
    to: "/products?cat=Kids%20Art%20Prints",
    img: "images/cutouts.webp",
    alt: "Kids Art Prints",
  },
  {
    title: "Curated for Spring",
    subtitle: "Fresh shades we’re loving right now",
    cta: "Explore",
    to: "/products?cat=Spring",
    img: "images/postcards.webp",
    alt: "Curated for Spring",
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

const Index: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<ProductItem[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      setLoadingBestsellers(true);

      try {
        const res: any = await API.adminGetProducts().catch(() => []);
        const all: ProductItem[] = Array.isArray(res)
          ? res
          : res?.data?.items || res?.data || [];

        setBestsellers(all.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch bestsellers:", err);
      } finally {
        setLoadingBestsellers(false);
      }
    };

    fetchBestsellers();
  }, []);

  return (
    <main
      className="min-h-screen overflow-x-hidden font-sans selection:text-white"
      style={{
        backgroundColor: COLORS.cloud,
        color: COLORS.blackboard,
      }}
    >
      {/* HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: smoothEase }}
          className="absolute inset-0"
        >
          <img
            src={heroBanner}
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-black/35"
        />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl mx-auto md:mx-0 text-center md:text-left"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-8xl text-white mb-6 drop-shadow-md leading-[1.05] font-semibold tracking-[-0.04em]"
            >
              Transform Your Walls.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-white text-lg md:text-2xl mb-8 font-normal"
            >
              Premium poster prints curated for beautiful living.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-white text-[#1C1C1C] px-10 py-4 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#006039] hover:text-white transition-all"
              >
                Start Curating →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SHOP BY MOOD */}
      <section className="w-full py-12">
        <div className="max-w-[1400px] mx-auto px-2 md:px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 items-start">
            {moods.map(({ label, cat, img }) => (
              <Link
                key={label}
                to={`/products?cat=${encodeURIComponent(cat)}`}
                className="group flex flex-col gap-2 text-center"
              >
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

      {/* BESTSELLERS */}
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
              <p className="text-sm tracking-widest uppercase">
                No products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-start">
              {bestsellers.map((item, index) => {
                const productTitle = item.title || item.name || "Product";

                const posterImage =
                  item.zoom_in_url ||
                  item.wall_poster_url ||
                  item.main_poster_url ||
                  item.hoverImg ||
                  item.defaultImg ||
                  item.image_url;

                const productPrice = item.price || item.base_price || 500;

                return (
                  <Link
                    key={item.id || index}
                    to={`/product/${item.id}`}
                    className="group cursor-pointer block w-full"
                  >
                    <article className="w-full">
                      {/* Direct image only: no wrapper background, no border, no badge */}
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
                          <span className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                            ₹{productPrice}
                          </span>

                          {(item.original_price || item.originalPrice) && (
                            <span className="text-[12px] text-[#1C1C1C]/35 line-through">
                              ₹{item.original_price || item.originalPrice}
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

      {/* CATEGORY IMAGE SECTION */}
      <section className="w-full py-12 md:py-14 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {categoryTiles.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="relative group overflow-hidden rounded-[26px] aspect-[4/5] block bg-white"
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute left-7 right-7 bottom-8 text-white">
                  <h3 className="text-[32px] md:text-[38px] lg:text-[44px] font-semibold leading-tight mb-3 tracking-[-0.035em]">
                    {item.title}
                  </h3>

                  <p className="text-[15px] md:text-[17px] font-medium leading-snug mb-5 text-white/95">
                    {item.subtitle}
                  </p>

                  <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.14em] underline underline-offset-4 decoration-[1.5px] hover:text-white">
                    {item.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY BUY FROM MURO */}
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
              Premium posters, safe delivery and easy support — everything kept
              clean, simple and reliable.
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
                    <Icon
                      className="w-5 h-5 text-[#006039]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h3 className="text-[18px] md:text-[20px] text-[#1C1C1C] font-semibold mb-2 tracking-[-0.02em]">
                      {item.title}
                    </h3>

                    <p className="text-[14px] leading-relaxed text-[#1C1C1C]/65">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESIGNED FOR EVERY WALL */}
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
              <div
                key={item.name}
                className="group cursor-pointer flex flex-col"
              >
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

      {/* FAQ SECTION */}
      <section className="w-full py-10 md:py-12 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-normal tracking-[0.18em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-snug">
              Frequently Asked Questions
            </h2>

            <p className="hidden md:block text-[14px] md:text-[15px] text-[#1C1C1C]/60 leading-relaxed max-w-[460px]">
              Quick answers about posters, shipping, payments, support and
              order handling.
            </p>
          </div>

          <FAQSection id="faqs" />
        </div>
      </section>
    </main>
  );
};

export default Index;