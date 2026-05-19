import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  Heart,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Check,
  ArrowRight
} from "lucide-react";
import { API } from "@/services/api";
import { Award, Globe, Image as ImageIcon, Package, } from "lucide-react";
import FAQSection from "../components/FAQSection";
import heroBanner from "@/assets/hero-banner.jpg"; 


// ─── Image URL Helper ─────────────────────────────────────────────
const getFullImageUrl = (path: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http")) return path;
  let cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (!cleanPath.includes("uploads/product")) cleanPath = `uploads/product/${cleanPath}`;
  return `https://muroposter.com/${cleanPath}`;
};

// ─── Hero Animations ──────────────────────────────────────────────
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: smoothEase } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

// ─── Mood Data ────────────────────────────────────────────────────
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

// ─── Star Rating ──────────────────────────────────────────────────
const StarRating = ({
  rating = 5,
  count = 0,
}: {
  rating?: number;
  count?: number;
}) => (
  <div className="flex items-center justify-center gap-0.5 mt-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= Math.round(rating) ? "text-[#e63946]" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    {count > 0 && (
      <span className="text-[11px] text-gray-500 ml-1">({count})</span>
    )}
  </div>
);

// ─── Page Component ───────────────────────────────────────────────
const Index: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);
  useEffect(() => {
  const slider = document.getElementById("wall-slider");
  let scrollAmount = 0;

  const slideTimer = setInterval(() => {
    if (slider) {
      slider.scrollLeft += 1;
    }
  }, 20);

  return () => clearInterval(slideTimer);
}, []);

  useEffect(() => {
    const fetchBestsellers = async () => {
      setLoadingBestsellers(true);
      try {
        const res = await API.adminGetProducts().catch(() => []);
        const all = Array.isArray(res)
          ? res
          : res?.data?.items || res?.data || [];

        // 🔍 DEBUG: check exact field names your API returns
        console.log("Total products fetched:", all.length);
        console.log("First product object:", all[0]);
        console.log("All product keys:", all[0] ? Object.keys(all[0]) : "no data");

        setBestsellers(all.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch bestsellers:", err);
      } finally {
        setLoadingBestsellers(false);
      }
    };
    fetchBestsellers();
  }, []);

  // ─── Trending Products State ───
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const res = await API.adminGetProducts().catch(() => []);
        const all = Array.isArray(res)
          ? res
          : res?.data?.items || res?.data || [];
        
        // Showing top 8 products for the scrollable row
        setTrendingProducts(all.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch trending products:", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - clientWidth / 2
            : scrollLeft + clientWidth / 2,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="bg-[#F0EEE9] text-[#222] font-sans selection:bg-[#a0b695] selection:text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          1. HERO SECTION
          ══════════════════════════════════════════ */}
          <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">

  {/* Background Image Zoom Animation */}
  <motion.div
    initial={{ scale: 1.15 }}
    animate={{ scale: 1 }}
    transition={{ duration: 12, ease: [0.25, 0.1, 0.25, 1] }}
    className="absolute inset-0"
  >
    <img
      src={heroBanner}
      alt="Hero"
      className="w-full h-full object-cover"
    />
  </motion.div>

  {/* Dark Overlay Fade */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 2 }}
    className="absolute inset-0 bg-black/30"
  />

  {/* Text Content */}
  <div className="relative container mx-auto px-4 md:px-8">
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-2xl text-center md:text-left"
    >
      <motion.h1
        variants={fadeInUp}
        className="font-serif text-5xl md:text-8xl text-white mb-6 drop-shadow-md leading-[1.1]"
      >
        Transform Your Walls.
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        className="text-white text-lg md:text-2xl mb-8 font-light"
      >
        Premium poster prints curated for beautiful living.
      </motion.p>

      <motion.div variants={fadeInUp}>
        <Link
          to="/products"
          className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#a0b695] hover:text-white transition-all rounded-none"
        >
          Start Curating →
        </Link>
      </motion.div>
    </motion.div>
  </div>
</section>
      {/* <section className="flex h-[60vh] min-h-[380px] overflow-hidden">
        <div className="w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop"
            alt="Gallery Wall"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-1/2 bg-[#57663D] flex items-center justify-center px-10 md:px-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.h1
              variants={fadeInUp}
              className="coolvetica font-serif text-4xl md:text-6xl text-white mb-6 leading-[1.15] whitespace-nowrap"
            >
              MURO STARTS WITH ART
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-white/70 text-base md:text-[1.5rem] mb-10 font-light leading-relaxed"
            >
              Refresh your space with made-to-order art from the world's best
              independent artists.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/gallery-walls"
                className="flex-1 text-center border border-white text-white px-8 py-4 text-sm tracking-wider hover:bg-white hover:text-[#57663D] transition-all duration-300"
              >
                Gallery Walls
              </Link>
              <Link
                to="/products"
                className="flex-1 text-center border border-white text-white px-8 py-4 text-sm tracking-wider hover:bg-white hover:text-[#57663D] transition-all duration-300"
              >
                Shop All Art
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section> */}

      {/* ══════════════════════════════════════════
          2. MARQUEE TRUST BAR
          ══════════════════════════════════════════ */}
      {/* <div className="bg-[#1c1c1c] text-white py-2.5 overflow-hidden whitespace-nowrap">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center shrink-0">
              <span className="flex items-center gap-2 mx-10 text-[14px] font-black tracking-widest uppercase">
                🎉 40% OFF Posters &amp; 20% OFF Frames*
              </span>
              <span className="text-white/40 mx-2">•</span>
              <span className="flex items-center gap-2 mx-10 text-[14px] font-black tracking-widest uppercase">
                <Truck className="w-4 h-4 shrink-0" strokeWidth={2.5} /> Free
                shipping over ₹2999
              </span>
              <span className="text-white/40 mx-2">•</span>
              <span className="flex items-center gap-2 mx-10 text-[14px] font-black tracking-widest uppercase">
                <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={2.5} />{" "}
                Happiness Guarantee
              </span>
              <span className="text-white/40 mx-2">•</span>
              <span className="flex items-center gap-2 mx-10 text-[14px] font-black tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2.5} />{" "}
                Delivery in 2–4 business days
              </span>
              <span className="text-white/40 mx-2">•</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* ══════════════════════════════════════════
          3. SHOP BY MOOD
          ══════════════════════════════════════════ */}
      <section className="w-full px-2 md:px-4 py-12">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2">
          {moods.map(({ label, cat, img }) => (
            <Link
              key={label}
              to={`/products?cat=${encodeURIComponent(cat)}`}
              className="group flex flex-col gap-2"
            >
              <div className="relative overflow-hidden rounded-xl aspect-square bg-[#F0F0F0]">
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl" />
              </div>
              <p className="text-[14px] font-medium text-[#111] tracking-tight flex items-center justify-center gap-1 group-hover:gap-2 transition-all duration-200 text-center flex-wrap">
                {label}
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section> 

      {/* ══════════════════════════════════════════
          4. BESTSELLERS
          ══════════════════════════════════════════ */}
      <section className="w-full py-10">
  {/* Header Section */}
  <div className="max-w-[1400px] mx-auto px-6 mb-8 flex items-center justify-between">
    <p
      className="font-montserrat font-light tracking-[1px] text-[22px] text-black hover:text-[#57663D] transition-colors uppercase"
    
    >
    BEST SELLERS
    </p>
    <Link
      to="/products"
      className="text-[12px] md:text-[14px] font-medium tracking-[1px] text-[#1C1C1C] uppercase hover:underline"
      style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
    >
      View All
    </Link>
  </div>

  {/* Grid */}
  <div className="max-w-[1400px] mx-auto px-6">
    {loadingBestsellers ? (
      <div className="h-[30vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    ) : bestsellers.length === 0 ? (
      <div className="h-[20vh] flex items-center justify-center text-gray-400">
        <p className="text-sm tracking-widest uppercase">No products found</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {bestsellers.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group cursor-pointer flex flex-col"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-[#f4f4f4] overflow-hidden mb-3 rounded-xl">
              {/* Background / hover image */}
              <img
                src={getFullImageUrl(
                  item.wall_poster_url ||
                    item.hoverImg ||
                    item.main_poster_url ||
                    item.image_url
                )}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
              />

              {/* Front / default image — fades out on hover */}
              <div className="absolute inset-0 z-10 transition-opacity duration-500 ease-in-out group-hover:opacity-0">
                <img
                  src={getFullImageUrl(
                    item.main_poster_url ||
                      item.defaultImg ||
                      item.image_url
                  )}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Top Left Yellow Discount Badge */}
              {/* <div className="absolute top-3 left-3 bg-[#fdf2a6] text-black text-[10px] font-semibold px-2 py-1 rounded-full z-20 shadow-sm">
                -40%
              </div> */}

              {/* Bottom Left White Badge (Conditional example for New Arrivals) */}
              {/* You can wrap this in a condition like: {item.isNew && (...)} */}
              <div className="absolute bottom-3 left-3 bg-white text-black text-[10px] font-semibold px-2 py-1 rounded-full z-20 shadow-sm">
                New Arrivals
              </div>
            </div>

            {/* Info Section (Left Aligned) */}
            <div className="flex flex-col items-start text-left w-full">
              
              
              <h3
                className="text-[13px] font-medium text-[#1C1C1C] leading-snug mb-1 w-full pr-2"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {item.title || item.name}
              </h3>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[12px] font-medium text-black">
                  As low as ₹{item.price || item.base_price}
                </span>
                {(item.original_price || item.originalPrice) && (
                  <span className="text-[12px] text-gray-400 line-through">
                    ₹{item.original_price || item.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
</section>

<br />
<br />
{/* ─── PROMO BANNER & CATEGORY GRID ─── */}
<section className="w-full">
  {/* Red Spring Sale Banner */}
  
  {/* 3-Column Image Grid with NEW Compact Height & Images */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full">
    {/* Item 1: New Arrivals (Gallery Wall Aesthetic) */}
    <Link to="/new-arrivals" className="relative group overflow-hidden h-[620px]">
      <img 
        src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1200&auto=format&fit=crop" 
        alt="New Arrivals"
        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-10 left-8">
        <h3 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
          Posters
        </h3>
      </div>
    </Link>

    {/* Item 2: Canvas Art (Texture Focus) */}
    <Link to="/canvas-art" className="relative group overflow-hidden h-[620px]">
      <img 
        src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop" 
        alt="Canvas Art"
        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-10 left-8">
        <h3 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
          Cutouts
        </h3>
      </div>
    </Link>

    {/* Item 3: Picture Frames (Frame Collage) */}
    <Link to="/frames" className="relative group overflow-hidden h-[620px]">
      <img 
        src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1200&auto=format&fit=crop" 
        alt="Picture Frames"
        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-10 left-8">
        <h3 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
          Postcards
        </h3>
      </div>
    </Link>
  </div>
</section>
<br />
<br />


<section className="max-w-7xl mx-auto p-4 sm:p-8 font-sans">
      
      {/* Heading */}
      <h2 className="text-center text-[56px] tracking-wide mb-10 text-[#1c1c1c]">
        WHY BUY FROM <span className="font-extrabold text-[#1c1c1c]">MURO</span>?
      </h2>

      <div className="relative">
        {/* Background Image Container */}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 ml-2 mr-2">
      
      {/* 1 Premium print quality */}
      <div className="bg-[#Fff] rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
        <Award className="w-9 h-9 mb-4 stroke-[1.2] text-[#111]" />
        <h3 
          className="text-[17px] font-bold mb-2 text-[#111]" 
          style={{ fontFamily: "Georgia, serif" }}
        >
          Premium print quality
        </h3>
        <p className="text-[14px] text-[#555] leading-relaxed">
          We use high-resolution printing and premium materials to ensure every artwork looks sharp, vibrant, and long-lasting.
        </p>
      </div>

      {/* 2 Secure packaging */}
      <div className="bg-[#Fff] rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
        <Package className="w-9 h-9 mb-4 stroke-[1.2] text-[#111]" />
        <h3 
          className="text-[17px] font-bold mb-2 text-[#111]" 
          style={{ fontFamily: "Georgia, serif" }}
        >
          Secure packaging
        </h3>
        <p className="text-[13px] text-[#555] leading-relaxed">
          Every order is carefully packed with protective materials so your frames arrive safely and in perfect condition.
        </p>
      </div>

      {/* 3 Designed with intention */}
      <div className="bg-[#Fff] rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
        <Heart className="w-9 h-9 mb-4 stroke-[1.2] text-[#111]" />
        <h3 
          className="text-[17px] font-bold mb-2 text-[#111]" 
          style={{ fontFamily: "Georgia, serif" }}
        >
          Designed with intention
        </h3>
        <p className="text-[13px] text-[#555] leading-relaxed">
          Each design is thoughtfully created to bring balance, warmth, and personality to your living space.
        </p>
      </div>

      {/* 4 Easy support */}
      <div className="bg-[#Fff] rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">
        <Star className="w-9 h-9 mb-4 stroke-[1.2] text-[#111]" />
        <h3 
          className="text-[17px] font-bold mb-2 text-[#111]" 
          style={{ fontFamily: "Georgia, serif" }}
        >
          Easy support via Email & WhatsApp
        </h3>
        <p className="text-[13px] text-[#555] leading-relaxed">
          Need help with your order or choosing a design? Our team is always available via Email and WhatsApp.
        </p>
      </div>

    </div>
      </div>
      
    </section>
<br /><br /><br />
<section className="w-full py-10">
  {/* Header Section */}
  <div className="max-w-[1400px] mx-auto px-6 mb-8 flex items-center justify-between">
    <h2
    className="font-montserrat font-light tracking-[1px] text-[22px] text-black hover:text-[#57663D] transition-colors uppercase"
    >
      Designed For Every Wall
    </h2>
    <Link
      to="/categories"
      className="text-[12px] md:text-[14px] font-medium tracking-[1px] text-[#1C1C1C] uppercase hover:underline"
      style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
    >
      View All
    </Link>
  </div>

  {/* Cards Grid */}
  <div className="max-w-[1400px] mx-auto px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {[
        { name: "Bedroom", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85" },
        { name: "Living Room", img: "https://images.unsplash.com/photo-1493666438817-866a91353ca9" },
        { name: "Office", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174" },
        { name: "Gym", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438" },
        { name: "Kitchen", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836" },
        { name: "Kids Room", img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9" },
        { name: "Hallway", img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7" },
        { name: "Dining Room", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511" },
        { name: "Studio", img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7" },
        { name: "Bathroom", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85" },
      ].map((item, index) => (
        <div key={index} className="group cursor-pointer flex flex-col">
          
          {/* Image Container */}
          <div className="relative aspect-[3/4] bg-[#f4f4f4] overflow-hidden mb-3 rounded-xl">
            <img
              src={item.img}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            />
            
            {/* Darken Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500 z-10"></div>
          </div>

          {/* Info Section (Left Aligned) */}
          <div className="flex flex-col items-start text-left w-full mt-1">
            <h3
              className="text-[13px] font-medium text-[#1C1C1C] leading-snug mb-1 w-full pr-2 uppercase tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {item.name}
            </h3>
          </div>

        </div>
      ))}
    </div>
  </div>
</section>
{/* ══════════════════════════════════════════
    BRAND MESSAGE SECTION
    ══════════════════════════════════════════ */}

      <FAQSection id="faqs"/>
    </main>
  );
};

export default Index;
