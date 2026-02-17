import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Heart, Zap, MessageCircle, Leaf } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg"; 

const Index = () => {
  const moods = [
    "Motivational & Mindset", "Aesthetic & Vibe", "Love & Connection", "Kids – Learning",
    "Calm & Inner Balance", "Fandom & Passion", "Kitchen & Dining", "Customization"
  ];

  return (
    <main className="bg-[#F0EEE9] text-[#222222] font-sans selection:bg-[#2F4F4F] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <img
          src={heroBanner}
          alt="MURO Environment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-light leading-[1.1] text-white mb-6">
              Transform Your Walls Into Stories.
            </h1>
            <p className="font-sans text-white/90 text-lg md:text-xl font-light mb-8 max-w-lg leading-relaxed">
              Premium poster prints curated for those who appreciate the art of living beautifully.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-white text-[#222222] px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#2F4F4F] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Curating <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="border-b border-[#222222]/10 bg-white py-6">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap md:flex-wrap justify-between md:justify-center gap-8 md:gap-16 min-w-[600px] md:min-w-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#222222]/70">
            <div className="flex items-center gap-2 whitespace-nowrap"><Truck className="w-4 h-4" /> 2–4 Day Processing</div>
            <div className="flex items-center gap-2 whitespace-nowrap"><ShieldCheck className="w-4 h-4" /> Secure Packaging</div>
            <div className="flex items-center gap-2 whitespace-nowrap"><Leaf className="w-4 h-4" /> Premium Quality</div>
            <div className="flex items-center gap-2 whitespace-nowrap text-[#2F4F4F]"><MessageCircle className="w-4 h-4" /> WhatsApp Support</div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY MOOD */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-5xl font-light text-center mb-16"
          >
            Shop by Mood
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {moods.map((mood, index) => (
              <Link
                key={index}
                to={`/shop?cat=${mood}`}
                className="group relative bg-white overflow-hidden h-40 md:h-64 flex flex-col items-center justify-center text-center border border-[#222222]/5 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="absolute inset-0 bg-[#2F4F4F] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                <div className="relative z-10 p-4">
                  <h3 className="font-serif text-lg md:text-2xl mb-2 leading-tight group-hover:text-white transition-colors duration-300">
                    {mood}
                  </h3>
                  <span className="inline-block w-8 h-[1px] bg-[#222222] group-hover:bg-white/50 mb-3 transition-colors duration-300" />
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-white/80">
                    Explore
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DESIGNED FOR EVERY WALL */}
      <section className="py-20 bg-white border-t border-[#222222]/5">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-10">Designed for Every Wall</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
             {["Bedroom", "Living Room", "Office", "Gyms", "Kitchen", "Kids Room"].map((room) => (
               <Link 
                 to={`/shop?room=${room}`} 
                 key={room} 
                 className="relative text-sm md:text-base uppercase tracking-widest text-[#222222]/60 hover:text-[#2F4F4F] transition-colors pb-1 group"
               >
                 {room}
                 <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#2F4F4F] transition-all duration-300 group-hover:w-full" />
               </Link>
             ))}
          </div>
        </div>
      </section>

      {/* 5. WHY MURO? */}
      <section className="py-24 bg-[#F0EEE9]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">Why MURO?</h2>
            <p className="text-[#222222]/60 max-w-md mx-auto font-light">
              Because your space deserves better than ordinary.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <Feature icon={Zap} title="Premium Quality" sub="Gallery Grade Paper" />
            <Feature icon={ShieldCheck} title="Secure Packaging" sub="Damage-Free Guarantee" />
            <Feature icon={Heart} title="Intention" sub="Art with Meaning" />
            <Feature icon={MessageCircle} title="Support" sub="Always Here to Help" />
          </div>
        </div>
      </section>

      {/* 6. EMOTIONAL BRAND STORY (Light & Minimal Version) */}
      <section className="py-32 bg-white px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#2F4F4F] mb-6">
              Our Philosophy
            </span>
            
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-[#222222] mb-8">
              We don’t design decorations. <br />
              <span className="italic text-[#222222]/80">We design reminders.</span>
            </h2>
            
            <p className="text-lg md:text-xl font-light text-[#222222]/60 leading-relaxed max-w-xl mx-auto">
              Your wall is the most silent influence in your room. 
              Choose what speaks to you daily.
            </p>
          </motion.div>
        </div>
      </section>

    </main>
  );
};

// Reusable Feature Component
const Feature = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="w-12 h-12 rounded-full bg-[#2F4F4F]/5 flex items-center justify-center mb-6 group-hover:bg-[#2F4F4F] transition-colors duration-300">
      <Icon className="w-5 h-5 text-[#2F4F4F] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
    </div>
    <h3 className="font-serif text-lg mb-2">{title}</h3>
    <p className="text-xs uppercase tracking-wider text-[#222222]/50 font-bold">{sub}</p>
  </div>
);

export default Index;