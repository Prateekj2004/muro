import React from "react";
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
  LucideIcon 
} from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg"; 

// --- Types & Interfaces ---
interface MoodCategory {
  title: string;
  subtitle: string;
  img: string;
  link: string;
}

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  sub: string;
}

// --- Animation Constants ---
// FIXED: Strictly typed as a tuple of 4 numbers for Framer Motion's ease property
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
  // 1. UPDATED IMAGES (Reliable Links)
  const moodCategories: MoodCategory[] = [
    { 
      title: "Motivational & Mindset", 
      subtitle: "Focus & Ambition",
      // Lion/Dark Moody Vibe
      img: "https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=800",
      link: "motivational"
    },
    { 
      title: "Aesthetic & Vibe", 
      subtitle: "Curated Spaces",
      // Abstract Beige/Green Art
      img: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
      link: "aesthetic"
    },
    { 
      title: "Love & Connection", 
      subtitle: "Better Together",
      // Hands/Warmth
      img: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=800",
      link: "love"
    },
    { 
      title: "Kids – Learning", 
      subtitle: "Playful Growth",
      // Cute Minimalist Room
      img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
      link: "kids"
    },
    { 
      title: "Calm & Inner Balance", 
      subtitle: "Zen & Serenity",
      // Nature/Plants
      img: "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&q=80&w=800",
      link: "calm"
    },
    { 
      title: "Fandom & Passion", 
      subtitle: "What Moves You",
      // Music/Vinyl Records vibe
      img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
      link: "fandom"
    },
    { 
      title: "Kitchen & Dining", 
      subtitle: "Gather & Taste",
      // Coffee/Clean Kitchen
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
      link: "kitchen"
    },
    { 
      title: "Customization", 
      subtitle: "Your Unique Story",
      // Frames on Wall
      img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800",
      link: "custom"
    }
  ];

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
              className="font-serif text-5xl md:text-7xl font-light leading-[1.1] text-white mb-6 drop-shadow-md"
            >
              Transform Your Walls Into Stories.
            </motion.h1>
            <motion.p 
              variants={fadeInUp} 
              className="text-white/90 text-lg md:text-xl font-light mb-8 max-w-lg leading-relaxed drop-shadow-md"
            >
              Premium poster prints curated for those who appreciate the art of living beautifully.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                to="/shop"
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

      {/* 3. SHOP BY MOOD (FIXED: Images & Animation) */}
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
                  to={`/shop?cat=${mood.link}`}
                  className="group relative block w-full aspect-[2/3] overflow-hidden bg-[#E5E5E5] shadow-sm hover:shadow-2xl transition-all duration-700 rounded-sm"
                >
                  {/* Image (Should load now) */}
                  <img 
                    src={mood.img} 
                    alt={mood.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2F4F4F]/90 via-[#2F4F4F]/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Content Container */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-center z-10">
                    <h3 className="font-serif text-xl text-white mb-1 drop-shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      {mood.title}
                    </h3>
                    
                    {/* Subtitle (Initial State: Visible) */}
                    <p className="text-[10px] uppercase tracking-widest text-white/80 mb-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300 absolute bottom-12 left-0 right-0">
                      {mood.subtitle}
                    </p>
                    
                    {/* Animated Separator */}
                    <div className="h-[1px] w-8 bg-white/60 group-hover:w-full transition-all duration-700 ease-in-out mx-auto mb-3" />
                    
                    {/* FIXED: View Collection Text (No clipping) */}
                    {/* Using simple translate/opacity instead of overflow-hidden mask */}
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

      {/* 4. DESIGNED FOR EVERY WALL */}
      <section className="py-20 bg-white border-t border-[#2F4F4F]/5 font-sans">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl font-light mb-10"
          >
            Designed for Every Wall
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
             {["Bedroom", "Living Room", "Office", "Gyms", "Kitchen", "Kids Room"].map((room, i) => (
               <Link 
                 to={`/shop?room=${room}`} 
                 key={room} 
                 className="relative text-sm md:text-base uppercase tracking-widest text-[#222222]/60 hover:text-[#2F4F4F] transition-colors pb-1 group"
               >
                 <motion.span
                   initial={{ opacity: 0, y: 15 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.08, ease: smoothEase, duration: 0.6 }}
                   className="block"
                 >
                   {room}
                 </motion.span>
                 <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#2F4F4F] transition-all duration-500 ease-in-out group-hover:w-full" />
               </Link>
             ))}
          </div>
        </div>
      </section>

      {/* 5. WHY MURO? */}
      <section className="py-24 bg-[#F0EEE9] font-sans">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">Why MURO?</h2>
            <p className="text-[#222222]/60 max-w-md mx-auto font-light">
              Because your space deserves better than ordinary.
            </p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-10"
          >
            <Feature icon={Zap} title="Premium Quality" sub="Gallery Grade Paper" />
            <Feature icon={ShieldCheck} title="Secure Packaging" sub="Damage-Free Guarantee" />
            <Feature icon={Heart} title="Intention" sub="Art with Meaning" />
            <Feature icon={MessageCircle} title="Support" sub="Always Here to Help" />
          </motion.div>
        </div>
      </section>

      {/* 6. EMOTIONAL BRAND STORY */}
      <section className="py-32 bg-white px-6 font-sans">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="show"
             viewport={{ once: true }}
          >
            <motion.span variants={fadeInUp} className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#2F4F4F] mb-6">
              Our Philosophy
            </motion.span>
            
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-[#222222] mb-8">
              <div className="overflow-hidden">
                <motion.div variants={fadeInUp}>We don’t design decorations.</motion.div>
              </div>
              <div className="overflow-hidden">
                 <motion.span variants={fadeInUp} className="italic text-[#2F4F4F]/90 block">We design reminders.</motion.span>
              </div>
            </h2>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-light text-[#222222]/70 leading-relaxed max-w-xl mx-auto">
              Your wall is the most silent influence in your room. 
              Choose what speaks to you daily.
            </motion.p>
          </motion.div>
        </div>
      </section>

    </main>
  );
};

// Reusable Feature Component
const Feature: React.FC<FeatureProps> = ({ icon: Icon, title, sub }) => (
  <motion.div 
    variants={fadeInUp}
    className="flex flex-col items-center text-center group cursor-default"
  >
    <div className="w-12 h-12 rounded-full bg-[#2F4F4F]/5 flex items-center justify-center mb-6 group-hover:bg-[#2F4F4F] transition-all duration-500 ease-in-out">
      <Icon className="w-5 h-5 text-[#2F4F4F] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
    </div>
    <h3 className="font-serif text-lg mb-2 text-[#222222]">{title}</h3>
    <p className="text-xs uppercase tracking-wider text-[#222222]/50 font-bold">{sub}</p>
  </motion.div>
);

export default Index;