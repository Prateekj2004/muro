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
} from "lucide-react";
import { API } from "@/services/api";

// ─── Image URL Helper ─────────────────────────────────────────────
const getFullImageUrl = (path: string): string => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (
    path.startsWith("http") ||
    path.startsWith("/") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  )
    return path;
  let cleanPath = path;
  if (!cleanPath.includes("uploads/product")) {
    cleanPath = `uploads/product/${cleanPath}`;
  }
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
    <main className="bg-white text-[#222] font-sans selection:bg-[#a0b695] selection:text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════
          1. HERO SECTION
          ══════════════════════════════════════════ */}
      <section className="flex h-[60vh] min-h-[380px] overflow-hidden">
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
            className="max-w-md"
          >
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-4xl md:text-6xl text-white mb-6 leading-[1.15]"
            >
              It starts with art
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-white/70 text-base md:text-lg mb-10 font-light leading-relaxed"
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
                className="flex-1 text-center border border-white text-white px-8 py-4 text-sm font-semibold tracking-wider hover:bg-white hover:text-[#57663D] transition-all duration-300"
              >
                Gallery Walls
              </Link>
              <Link
                to="/products"
                className="flex-1 text-center border border-white text-white px-8 py-4 text-sm font-semibold tracking-wider hover:bg-white hover:text-[#57663D] transition-all duration-300"
              >
                Shop All Art
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. MARQUEE TRUST BAR
          ══════════════════════════════════════════ */}
      <div className="bg-[#a0b695] text-white py-2.5 overflow-hidden whitespace-nowrap">
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
      </div>

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
              <p className="text-[15px] font-medium text-[#111] tracking-tight flex items-center justify-center gap-1 group-hover:gap-2 transition-all duration-200 text-center flex-wrap">
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
      <section className="w-full px-2 md:px-3 py-10">

        {/* Graphic Heading */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 w-full max-w-2xl mb-1">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="flex gap-1.5">
              {["★", "★", "★"].map((s, i) => (
                <span key={i} className="text-[#e63946] text-[11px] leading-none">
                  {s}
                </span>
              ))}
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="flex items-stretch select-none">
            <div className="relative bg-white px-8 py-3 z-10">
              <span
                className="text-[44px] md:text-[64px] font-extrabold text-black uppercase leading-none tracking-tight"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                BEST
              </span>
              <div className="absolute -right-[28px] top-0 h-full w-14 bg-white skew-x-[-35deg] z-20" />
            </div>
            <div className="bg-[#57663D] pl-16 pr-10 py-3 -ml-5 relative z-0">
              <span
                className="text-[44px] md:text-[64px] font-black text-white uppercase leading-none tracking-tight"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                SELLERS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full max-w-2xl mt-1">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="flex gap-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="text-[#e63946] text-[9px] leading-none">
                  ★
                </span>
              ))}
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        </div>

        {/* Grid */}
        {loadingBestsellers ? (
          <div className="h-[30vh] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="h-[20vh] flex items-center justify-center text-gray-400">
            <p className="text-sm tracking-widest uppercase">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-1.5">
            {bestsellers.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group cursor-pointer flex flex-col"
              >
                {/* Image with hover swap */}
                <div className="relative aspect-[3/4] bg-[#f2f2f2] overflow-hidden rounded-md mb-2">

                  {/* Background / hover image */}
                  <img
                    src={getFullImageUrl(
                      item.wall_poster_url ||
                      item.hoverImg ||
                      item.main_poster_url ||
                      item.image_url
                    )}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover
                               transition-transform duration-700 ease-out
                               group-hover:scale-105 z-0"
                  />

                  {/* Front / default image — fades out on hover */}
                  <div
                    className="absolute inset-0 z-10 bg-white
                               transition-opacity duration-500 ease-in-out
                               group-hover:opacity-0"
                  >
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

                  {/* Sale pill */}
                  <div className="absolute bottom-2 left-2 bg-[#e63946] text-white text-[10px] font-black px-3 py-1 rounded-full z-20 uppercase tracking-wide shadow">
                    Sale
                  </div>

                  {/* Wishlist heart */}
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#e63946]" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex flex-col items-center text-center px-1">
                  <h3
                    className="text-[15px] font-medium text-black leading-snug mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {item.title || item.name}
                  </h3>
                  <StarRating
                    rating={item.rating || 5}
                    count={item.reviews || 0}
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap justify-center">
                    <span className="text-[13px] text-gray-400 line-through">
                      ₹{item.original_price || item.originalPrice || ""}
                    </span>
                    <span className="text-[15px] font-medium text-black">
                      From ₹{item.price || item.base_price}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination + View All */}
        <div className="flex flex-col items-center gap-4 mt-10">
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-black transition-colors">
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <span className="text-[15px] font-medium text-[#111] tracking-wide">
              1 / {bestsellers.length}
            </span>
            <button className="text-gray-400 hover:text-black transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <Link
            to="/products"
            className="bg-black text-white text-[15px] font-medium px-10 py-4 rounded-xl hover:bg-[#222] transition-colors tracking-wide"
          >
            View all
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. POPULAR CATEGORIES
          ══════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 bg-[#fcfcfc]">
        <div className="text-center mb-12">
          <p
            className="m-0 opacity-80 text-[32px] md:text-[42px]"
            style={{ fontFamily: "Arsenal" }}
          >
            Popular Categories
          </p>
        </div>
        <div className="flex overflow-x-auto gap-8 no-scrollbar justify-start md:justify-center px-4">
          {[
            "Iconic",
            "Illustration",
            "Artists",
            "Personalised",
            "Photo Art",
            "Nature",
          ].map((cat, i) => (
            <Link
              to={`/products?cat=${cat.toLowerCase()}`}
              key={i}
              className="flex flex-col items-center min-w-[120px] group"
            >
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-[#a0b695] transition-all p-1">
                <img
                  src={
                    bestsellers[i]
                      ? getFullImageUrl(
                          bestsellers[i].main_poster_url ||
                          bestsellers[i].image_url
                        )
                      : "https://via.placeholder.com/160?text=Art"
                  }
                  alt={cat}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-all duration-700"
                />
              </div>
              <span className="text-[14px] font-bold uppercase tracking-widest text-center group-hover:text-[#a0b695]">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. CUSTOMER REVIEWS
          ══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <p
            className="m-0 opacity-80 text-[28px] md:text-[36px]"
            style={{ fontFamily: "Arsenal" }}
          >
            Customer Reviews
          </p>
        </div>
        <div className="bg-[#f9f7f2] p-10 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-10 items-center">
          <div className="text-center md:border-r border-gray-200 md:pr-10">
            <p className="text-5xl font-bold mb-2">4.3</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Excellent
            </p>
            <div className="flex justify-center text-[#222] mb-2">
              <Star className="fill-black" />
              <Star className="fill-black" />
              <Star className="fill-black" />
              <Star className="fill-black" />
              <Star className="text-gray-300" />
            </div>
            <p className="text-[11px] text-gray-400">Based on 70,914 ratings</p>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-6">
            <div className="italic text-[15px] text-gray-700">
              "Very quick delivery and fab poster thank you. Had this made up
              for my wedding and I can't wait to share it with all of our
              guests."
              <p className="not-italic text-xs font-bold mt-4 uppercase tracking-widest text-[#a0b695] flex items-center gap-2">
                <Check className="w-3 h-3" /> Verified buyer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. NEWSLETTER
          ══════════════════════════════════════════ */}
      <section className="bg-[#C2D8B8] py-20 text-center">
        <div className="max-w-[600px] mx-auto px-4">
          <p
            className="m-0 opacity-100 px-3 sm:px-[52px] text-[32px] md:text-[42px] mb-4 text-white leading-tight"
            style={{ fontFamily: "Arsenal" }}
          >
            Stay up to date
          </p>
          <p className="text-[15px] text-white/80 mb-10 font-medium tracking-wide">
            Receive exclusive offers and discover new arrivals.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="example@mail.com"
              className="flex-1 py-4 px-6 text-sm outline-none rounded-s-full sm:rounded-s-full rounded-none"
            />
            <button className="bg-black text-white px-10 py-4 text-xs font-bold tracking-widest uppercase rounded-e-full sm:rounded-e-full rounded-none hover:bg-gray-900 transition-all">
              Send
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. SEO CONTENT
          ══════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center border-t border-gray-100">
        <h2
          className="text-[24px] md:text-[30px] font-bold mb-8"
          style={{ fontFamily: "Arsenal" }}
        >
          Wall art online at Muro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left text-[14px] text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-bold text-black mb-2 uppercase tracking-widest">
              Large selection
            </h3>
            <p>
              Muro offers wall art for every occasion, season, and style, with
              posters, prints, and canvas art prints designed for
              self-expression. From Scandinavian-inspired designs to modern
              photography.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-black mb-2 uppercase tracking-widest">
              Affordable Art
            </h3>
            <p>
              We make it fun to decorate with high-quality wall art - at
              affordable prices to make you smile. Find fantastic art at happy
              prices with wall art from Muro!
            </p>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Index;
