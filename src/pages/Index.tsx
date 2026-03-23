import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Check 
} from "lucide-react";

// --- Local Asset Imports ---
import heroBanner from "@/assets/hero-banner.jpg"; 
import abc from './Unstoppable Mindset - Built for storms, not silence. A4Poster.com (1).jpg';
import def from './Unstoppable Mindset - Born tired, trained relentless. 1 A4Poster.com.jpg';
import ghi from './Unstoppable Mindset - Action over anxiety. Always.2 A4Poster.com.jpg';
import jkl from './Unstoppable Mindset - Built for storms, not silence.1 A4Poster.com.jpg';

// --- Hero Animations (Keeping yours untouched) ---
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]; 
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: smoothEase } }
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const Index: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const bestsellers = [
    { id: 1, title: "Coco Poster", salePrice: "₹1,299", originalPrice: "₹2,165", discount: "-40%*", img: abc },
    { id: 2, title: "Leopard Poster", salePrice: "₹1,999", originalPrice: "₹3,330", discount: "-40%*", img: def },
    { id: 3, title: "Soft Brown Pack", salePrice: "₹2,810", originalPrice: "₹4,685", discount: "-40%*", img: ghi },
    { id: 4, title: "Marble Balcony", salePrice: "₹1,299", originalPrice: "₹2,165", discount: "-40%*", img: jkl },
    { id: 5, title: "Amalfi Coast", salePrice: "₹1,299", originalPrice: "₹2,165", discount: "-40%*", img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <main className="bg-white text-[#222] font-sans selection:bg-[#a0b695] selection:text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION (YOUR ORIGINAL) */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }} className="absolute inset-0">
          <img src={heroBanner} alt="Hero" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 md:px-8">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-2xl text-center md:text-left">
            <motion.h1 variants={fadeInUp} className="font-serif text-5xl md:text-8xl text-white mb-6 drop-shadow-md leading-[1.1]">Transform Your Walls.</motion.h1>
            <motion.p variants={fadeInUp} className="text-white text-lg md:text-2xl mb-8 font-light">Premium poster prints curated for beautiful living.</motion.p>
            <motion.div variants={fadeInUp}>
              <Link to="/products" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#a0b695] hover:text-white transition-all rounded-none">
                Start Curating <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR (EXACT HTML COLORS) */}
      <div className="bg-[#a0b695] text-white py-2.5">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-[14px] md:text-[16px] font-bold tracking-wide uppercase">40% OFF POSTERS & 20% OFF FRAMES*</p>
        </div>
      </div>
      <div className="bg-[#f4f4f4] border-b border-gray-200 py-3">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex justify-center md:justify-between items-center text-[12px] md:text-[13px] font-medium tracking-wide">
            <div className="hidden md:flex items-center gap-2"><Truck className="w-4 h-4" /> Free shipping over ₹2999</div>
            <div className="flex items-center gap-2 font-bold"><MessageCircle className="w-4 h-4" /> Happiness Guarantee</div>
            <div className="hidden md:flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Delivery in 2-4 business days</div>
          </div>
        </div>
      </div>

      {/* 3. DUAL BANNER SECTION (USING YOUR ARSENAL STYLE) */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/collection" className="relative group overflow-hidden aspect-[4/3] md:aspect-[16/10]">
            <img src={abc} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <span className="text-white text-[10px] font-bold tracking-[0.3em] mb-3">ART THAT NEVER GOES OUT OF STYLE</span>
              <p className="m-0 opacity-100 px-3 sm:px-[52px] text-[32px] md:text-[52px] text-white text-center whitespace-nowrap leading-tight" style={{ fontFamily: "Arsenal" }}>
                Famous Favorites
              </p>
              <span className="mt-8 bg-[#a0b695] text-white px-10 py-3 text-xs font-bold tracking-widest uppercase rounded-none">Shop Now</span>
            </div>
          </Link>
          <Link to="/collection" className="relative group overflow-hidden aspect-[4/3] md:aspect-[16/10]">
            <img src={def} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <span className="text-white text-[10px] font-bold tracking-[0.3em] mb-3">NEW ARRIVALS</span>
              <p className="m-0 opacity-100 px-3 sm:px-[52px] text-[32px] md:text-[52px] text-white text-center whitespace-nowrap leading-tight" style={{ fontFamily: "Arsenal" }}>
                Spring Collection
              </p>
              <span className="mt-8 bg-[#a0b695] text-white px-10 py-3 text-xs font-bold tracking-widest uppercase rounded-none">Explore</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. BESTSELLERS (POSTER STORE LAYOUT) */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <p className="m-0 opacity-80 text-[28px] md:text-[36px]" style={{ fontFamily: "Arsenal" }}>Bestsellers</p>
          <Link to="/all" className="text-sm font-bold uppercase tracking-widest hover:underline decoration-[#a0b695] underline-offset-8">Show more</Link>
        </div>

        <div className="relative group/slider">
          <button onClick={() => scroll('left')} className="absolute -left-4 top-[40%] z-20 bg-white border p-2 rounded-full hidden group-hover/slider:block shadow-sm"><ChevronLeft /></button>
          <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 pb-10 no-scrollbar snap-x scroll-smooth">
            {bestsellers.map((item) => (
              <div key={item.id} className="min-w-[200px] md:min-w-[300px] snap-start group cursor-pointer">
                <div className="relative aspect-[3/4] bg-[#f8f8f8] mb-4 overflow-hidden rounded-xl">
                  <div className="absolute top-3 left-3 bg-[#a0b695] text-white text-[11px] font-bold px-3 py-1 rounded-full z-10">{item.discount}</div>
                  <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"><Heart className="w-5 h-5" /></button>
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="text-[16px] font-bold mb-1" style={{ fontFamily: "Arsenal" }}>{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-gray-500 italic">From</span>
                  <span className="text-[16px] font-bold text-[#b21010]">{item.salePrice}</span>
                  <span className="text-[14px] text-gray-400 line-through">{item.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => scroll('right')} className="absolute -right-4 top-[40%] z-20 bg-white border p-2 rounded-full hidden group-hover/slider:block shadow-sm"><ChevronRight /></button>
        </div>
      </section>

      {/* 5. POPULAR CATEGORIES (CIRCLE BUBBLES) */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 bg-[#fcfcfc]">
        <div className="text-center mb-12">
            <p className="m-0 opacity-80 text-[32px] md:text-[42px] sm:px-[52px]" style={{ fontFamily: "Arsenal" }}>Popular Categories</p>
        </div>
        <div className="flex overflow-x-auto gap-8 no-scrollbar justify-start md:justify-center px-4">
          {['Iconic', 'Illustration', 'Artists', 'Personalised', 'Photo Art', 'Nature'].map((cat, i) => (
            <Link to="/category" key={i} className="flex flex-col items-center min-w-[120px] group">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-[#a0b695] transition-all p-1">
                <img src={abc} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-all duration-700" />
              </div>
              <span className="text-[14px] font-bold uppercase tracking-widest text-center group-hover:text-[#a0b695]">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. LIPSCORE REVIEWS CLONE */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
             <p className="m-0 opacity-80 text-[28px] md:text-[36px]" style={{ fontFamily: "Arsenal" }}>Customer Reviews</p>
        </div>
        <div className="bg-[#f9f7f2] p-10 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-10 items-center">
            <div className="text-center md:border-r border-gray-200 md:pr-10">
                <p className="text-5xl font-bold mb-2">4.3</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Excellent</p>
                <div className="flex justify-center text-[#222] mb-2"><Star className="fill-black" /><Star className="fill-black" /><Star className="fill-black" /><Star className="fill-black" /><Star className="text-gray-300" /></div>
                <p className="text-[11px] text-gray-400">Based on 70,914 ratings</p>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-6">
                <div className="italic text-[15px] text-gray-700">
                    "Very quick delivery and fab poster thank you. Had this made up for my wedding and I can’t wait to share it with all of our guests."
                    <p className="not-italic text-xs font-bold mt-4 uppercase tracking-widest text-[#a0b695] flex items-center gap-2"><Check className="w-3 h-3"/> Verified buyer</p>
                </div>
            </div>
        </div>
      </section>

      {/* 7. NEWSLETTER (EXACT SYNTAX) */}
      <section className="bg-[#C2D8B8] py-20 text-center">
        <div className="max-w-[600px] mx-auto px-4">
          <p className="m-0 opacity-100 px-3 sm:px-[52px] text-[32px] md:text-[42px] mb-4 text-white leading-tight" style={{ fontFamily: "Arsenal" }}>
            Stay up to date
          </p>
          <p className="text-[15px] text-white/80 mb-10 font-medium tracking-wide">Receive exclusive offers and discover new arrivals.</p>
          <form className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="example@mail.com" className="flex-1 py-4 px-6 text-sm outline-none rounded-s-full sm:rounded-s-full rounded-none" />
            <button className="bg-black text-white px-10 py-4 text-xs font-bold tracking-widest uppercase rounded-e-full sm:rounded-e-full rounded-none hover:bg-gray-900 transition-all">Send</button>
          </form>
        </div>
      </section>

      {/* 8. SEO CONTENT SECTION */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center border-t border-gray-100">
        <h2 className="text-[24px] md:text-[30px] font-bold mb-8" style={{ fontFamily: "Arsenal" }}>Wall art online at Muro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left text-[14px] text-gray-600 leading-relaxed">
            <div>
                <h3 className="font-bold text-black mb-2 uppercase tracking-widest">Large selection</h3>
                <p>Muro offers wall art for every occasion, season, and style, with posters, prints, and canvas art prints designed for self-expression. From Scandinavian-inspired designs to modern photography.</p>
            </div>
            <div>
                <h3 className="font-bold text-black mb-2 uppercase tracking-widest">Affordable Art</h3>
                <p>We make it fun to decorate with high-quality wall art - at affordable prices to make you smile. Find fantastic art at happy prices with wall art from Muro!</p>
            </div>
        </div>
      </section>

    </main>
  );
};

export default Index;