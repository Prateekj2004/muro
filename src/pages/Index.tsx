import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Heart, 
  Zap, 
  MessageCircle, 
  Leaf, 
  LucideIcon,
  ShoppingBag,
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg"; 
import abc from './Unstoppable Mindset - Built for storms, not silence. A4Poster.com (1).jpg'
import def from './Unstoppable Mindset - Born tired, trained relentless. 1 A4Poster.com.jpg'
import ghi from './Unstoppable Mindset - Action over anxiety. Always.2 A4Poster.com.jpg'
import jkl from './Unstoppable Mindset - Built for storms, not silence.1 A4Poster.com.jpg'

// --- Types & Interfaces ---
interface MoodCategory {
  title: string;
  subtitle: string;
  img: string;
  link: string;
}

interface Product {
  id: number;
  title: string;
  price: string;
  img: string;
  category: string;
}

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  sub: string;
}

// --- Animation Constants ---
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]; 

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: smoothEase } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: smoothEase } 
  }
};

const Index: React.FC = () => {
  // 1. DATA: Categories
  const moodCategories: MoodCategory[] = [
    { title: "Motivational & Mindset", subtitle: "Focus & Ambition", img: "https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=800", link: "motivational" },
    { title: "Aesthetic & Vibe", subtitle: "Curated Spaces", img: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800", link: "aesthetic" },
    { title: "Love & Connection", subtitle: "Better Together", img: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=800", link: "love" },
    { title: "Kids – Learning", subtitle: "Playful Growth", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800", link: "kids" },
    { title: "Calm & Inner Balance", subtitle: "Zen & Serenity", img: "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&q=80&w=800", link: "calm" },
    { title: "Fandom & Passion", subtitle: "What Moves You", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800", link: "fandom" },
    { title: "Kitchen & Dining", subtitle: "Gather & Taste", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800", link: "kitchen" },
    { title: "Customization", subtitle: "Your Unique Story", img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800", link: "custom" }
  ];

  // 2. DATA: Best Sellers (NEW)
  const trendingProducts: Product[] = [
    { id: 1, title: "The Hustle Mindset", price: "₹1,299", category: "Office", img: abc},
    { id: 2, title: "Abstract Serenity", price: "₹999", category: "Living Room", img: def },
    { id: 3, title: "Morning Coffee Brew", price: "₹899", category: "Kitchen", img: ghi },
    { id: 4, title: "Urban Dreams", price: "₹1,499", category: "Bedroom", img: jkl },
  ];

  // --- NAYA DATA: Room Slider ke liye ---
  const roomSlides = [
    { title: "Living Room", img: "https://tse1.mm.bing.net/th/id/OIP.Jzod_EnLBcbYmSGO7RMuugHaE8?rs=1&pid=ImgDetMain&o=7&rm=3", link: "living-room" },
    { title: "Bedroom", img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800", link: "bedroom" },
    { title: "Office", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800", link: "office" },
    { title: "Kids Room", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800", link: "kids" },
    { title: "Kitchen", img: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=800", link: "kitchen" },
  ];

  // --- PREMIUM 3D SLIDER LOGIC ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % roomSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + roomSlides.length) % roomSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000); // 3 seconds autoplay
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="bg-[#F0EEE9] text-[#222222] font-sans selection:bg-[#2F4F4F] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden font-sans">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={heroBanner}
            alt="MURO Environment"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[#222222]/30" />
        
        <div className="relative container mx-auto px-4 md:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.h1 
              variants={fadeInUp} 
              className="font-serif text-5xl md:text-7xl font-normal leading-[1.3] text-white mb-6 drop-shadow-md"
            >
              Transform Your Walls Into Stories.
            </motion.h1>
            <motion.p 
              variants={fadeInUp} 
              className="text-white text-lg md:text-2xl font-normal mb-8 max-w-lg leading-relaxed drop-shadow-md"
            >
              Premium poster prints curated for those who appreciate the art of living beautifully.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-white text-[#222222] px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#2F4F4F] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-sm"
              >
                Start Curating <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6, ease: smoothEase }}
        className="border-b border-[#222222]/5 bg-white py-6"
      >
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap md:flex-wrap justify-between md:justify-center gap-8 md:gap-16 min-w-[600px] md:min-w-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#222222]/60">
            <div className="flex items-center gap-2 whitespace-nowrap"><Truck className="w-4 h-4" /> 2–4 Day Processing</div>
            <div className="flex items-center gap-2 whitespace-nowrap"><ShieldCheck className="w-4 h-4" /> Secure Packaging</div>
            <div className="flex items-center gap-2 whitespace-nowrap"><Leaf className="w-4 h-4" /> Premium Quality</div>
            <div className="flex items-center gap-2 whitespace-nowrap"><MessageCircle className="w-4 h-4" /> WhatsApp Support</div>
          </div>
        </div>
      </motion.section>

      {/* 3. SHOP BY MOOD */}
      <section className="py-24 font-sans">
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl font-light text-center mb-16 text-[#222222]"
          >
            Shop by Mood
          </motion.h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {moodCategories.map((mood, index) => (
              <motion.div key={index} variants={cardItemVariants}>
                <Link
                  to={`/products?cat=${encodeURIComponent(mood.title)}`}
                  className="group relative block w-full aspect-[2/3] overflow-hidden bg-[#E5E5E5] shadow-sm hover:shadow-2xl transition-all duration-700 rounded-sm"
                >
                  <img 
                    src={mood.img} 
                    alt={mood.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2F4F4F]/90 via-[#2F4F4F]/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-center z-10">
                    <h3 className="font-serif text-xl text-white mb-1 drop-shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      {mood.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/80 mb-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300 absolute bottom-12 left-0 right-0">
                      {mood.subtitle}
                    </p>
                    <div className="h-[1px] w-8 bg-white/60 group-hover:w-full transition-all duration-700 ease-in-out mx-auto mb-3" />
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                      View Collection
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- NEW SECTION 1: TRENDING NOW --- */}
      <section className="py-20 bg-white font-sans border-t border-[#222222]/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
                <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-xs font-bold uppercase tracking-widest text-[#2F4F4F] mb-2 block"
                >
                    Customer Favorites
                </motion.span>
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                    className="font-serif text-3xl md:text-4xl font-light text-[#222222]"
                >
                    Trending Now
                </motion.h2>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#2F4F4F] transition-colors">
                View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
          >
            {trendingProducts.map((product) => (
                <motion.div key={product.id} variants={cardItemVariants} className="group cursor-pointer">
                    <div className="relative w-full aspect-[5/7] bg-gray-100 overflow-hidden mb-4">
                        <img 
                            src={product.img} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <button className="absolute bottom-4 right-4 bg-white text-[#222222] p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#2F4F4F] hover:text-white">
                            <ShoppingBag className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-[#222222]/50 mb-1">{product.category}</span>
                        <h3 className="font-serif text-lg text-[#222222] group-hover:text-[#2F4F4F] transition-colors">{product.title}</h3>
                        <span className="text-sm font-medium mt-1">{product.price}</span>
                    </div>
                </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-[#222222] pb-1">
                View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* 4. DESIGNED FOR EVERY WALL (3D CAROUSEL WITH 5 VISIBLE IMAGES) */}
      <section className="py-24 bg-[#F9F9F9] font-sans overflow-hidden border-t border-[#E5E5E5]">
        <div className="container mx-auto px-4 md:px-8 text-center mb-16">
          <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-widest text-[#2F4F4F] mb-2 block"
          >
              Spaces
          </motion.span>
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl font-light text-[#222222]"
          >
            Designed for Every Wall
          </motion.h2>
        </div>

        {/* 3D Slider Container */}
        <div className="relative w-full max-w-[1400px] mx-auto h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
          
          {/* Left Arrow */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 md:left-8 z-50 w-12 h-12 bg-white/80 backdrop-blur-md border border-[#E5E5E5] flex items-center justify-center rounded-full hover:bg-[#222222] hover:text-white transition-all shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={nextSlide}
            className="absolute right-2 md:right-8 z-50 w-12 h-12 bg-white/80 backdrop-blur-md border border-[#E5E5E5] flex items-center justify-center rounded-full hover:bg-[#222222] hover:text-white transition-all shadow-lg"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Carousel Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {roomSlides.map((room, index) => {
              const total = roomSlides.length;
              // Find circular relative position to the active center
              let diff = (index - currentSlide) % total;
              if (diff < -Math.floor(total / 2)) diff += total;
              if (diff > Math.floor(total / 2)) diff -= total;

              // Apply styles based on position (0 is center, 1 is right1, 2 is right2, -1 is left1, -2 is left2)
              let positionClasses = "opacity-0 scale-50 z-0 pointer-events-none translate-x-0";
              
              if (diff === 0) {
                // ACTIVE / CENTER
                positionClasses = "opacity-100 scale-100 z-30 translate-x-0 shadow-2xl"; 
              } else if (diff === 1) {
                // RIGHT SIDE 1
                positionClasses = "opacity-80 scale-[0.80] md:scale-[0.85] z-20 translate-x-[55%] md:translate-x-[65%] cursor-pointer hover:opacity-100"; 
              } else if (diff === -1) {
                // LEFT SIDE 1
                positionClasses = "opacity-80 scale-[0.80] md:scale-[0.85] z-20 -translate-x-[55%] md:-translate-x-[65%] cursor-pointer hover:opacity-100"; 
              } else if (diff === 2) {
                // RIGHT SIDE 2 (Extreme Right)
                positionClasses = "opacity-40 scale-[0.60] md:scale-[0.70] z-10 translate-x-[105%] md:translate-x-[125%] cursor-pointer hover:opacity-70 hidden sm:block"; 
              } else if (diff === -2) {
                // LEFT SIDE 2 (Extreme Left)
                positionClasses = "opacity-40 scale-[0.60] md:scale-[0.70] z-10 -translate-x-[105%] md:-translate-x-[125%] cursor-pointer hover:opacity-70 hidden sm:block"; 
              }

              return (
                <motion.div
                  key={index}
                  className={`absolute w-[65vw] md:w-[380px] aspect-[4/5] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${positionClasses}`}
                  onClick={() => {
                    // Agar user un-active image pe click kare to wo auto-center me aa jaye
                    if (diff !== 0) setCurrentSlide(index);
                  }}
                >
                  <div className="block w-full h-full relative group overflow-hidden bg-gray-100 rounded-sm">
                    {diff === 0 && (
                      <Link to={`/products?room=${room.title}`} className="absolute inset-0 z-40" />
                    )}
                    <img src={room.img} alt={room.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center justify-center text-center">
                      <h3 className="text-white font-serif text-2xl md:text-3xl font-light mb-2">{room.title}</h3>
                      <div className="h-[1px] w-0 bg-white group-hover:w-12 transition-all duration-500 ease-out" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHY MURO? */}
      <section className="py-24 bg-white font-sans">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">Why MURO?</h2>
            <p className="text-[#222222]/60 max-w-md mx-auto font-light">Because your space deserves better than ordinary.</p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <Feature icon={Zap} title="Premium Quality" sub="Gallery Grade Paper" />
            <Feature icon={ShieldCheck} title="Secure Packaging" sub="Damage-Free Guarantee" />
            <Feature icon={Heart} title="Intention" sub="Art with Meaning" />
            <Feature icon={MessageCircle} title="Support" sub="Always Here to Help" />
          </motion.div>
        </div>
      </section>

      {/* --- NEW SECTION 2: NEWSLETTER (The Club) --- */}
      <section className="py-24 bg-[#222222] text-white font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2F4F4F] opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-xl mx-auto">
                <h2 className="font-serif text-3xl md:text-5xl font-light mb-4">Join the Collective</h2>
                <p className="text-white/60 mb-8 font-light leading-relaxed">
                    Get early access to new drops, interior design tips, and an exclusive <span className="text-white font-medium"> 10% off</span> your first order.
                </p>
                <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Your email address" className="flex-1 bg-transparent border-b border-white/30 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors text-center md:text-left" />
                    <button type="submit" className="bg-white text-[#222222] px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#2F4F4F] hover:text-white transition-all duration-300">Subscribe</button>
                </form>
                <p className="text-[10px] text-white/30 mt-4 uppercase tracking-wider">No spam. Unsubscribe anytime.</p>
            </motion.div>
        </div>
      </section>

      {/* 6. EMOTIONAL BRAND STORY */}
      <section className="py-32 bg-white px-6 font-sans">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.span variants={fadeInUp} className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#2F4F4F] mb-6">Our Philosophy</motion.span>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-[#222222] mb-8">
              <div className="overflow-hidden"><motion.div variants={fadeInUp}>We don’t design decorations.</motion.div></div>
              <div className="overflow-hidden"><motion.span variants={fadeInUp} className="italic text-[#2F4F4F]/90 block">We design reminders.</motion.span></div>
            </h2>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light text-[#222222]/70 leading-relaxed max-w-xl mx-auto">
              Your wall is the most silent influence in your room. Choose what speaks to you daily.
            </motion.p>
          </motion.div>
        </div>
      </section>

    </main>
  );
};

const Feature: React.FC<FeatureProps> = ({ icon: Icon, title, sub }) => (
  <motion.div variants={fadeInUp} className="flex flex-col items-center text-center group cursor-default">
    <div className="w-12 h-12 rounded-full bg-[#2F4F4F]/5 flex items-center justify-center mb-6 group-hover:bg-[#2F4F4F] transition-all duration-500 ease-in-out">
      <Icon className="w-5 h-5 text-[#2F4F4F] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
    </div>
    <h3 className="font-serif text-lg mb-2 text-[#222222]">{title}</h3>
    <p className="text-xs uppercase tracking-wider text-[#222222]/50 font-bold">{sub}</p>
  </motion.div>
);

export default Index;