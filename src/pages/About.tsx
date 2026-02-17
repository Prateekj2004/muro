import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";

// Images (Make sure these paths are correct in your project)
// Agar TS error de image import par, toh 'vite-env.d.ts' check karna padega
import aboutHero from "@/assets/about-hero.jpg"; 
import aboutInterior from "@/assets/about-interior.jpg";

const About: React.FC = () => {
  // Animation variants with type safety
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  return (
    <main className="bg-[#F0EEE9] text-[#222222] font-sans selection:bg-[#2F4F4F] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 text-center overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-4xl mx-auto z-10 relative"
        >
          <h1 className="font-serif text-5xl md:text-8xl leading-[0.9] md:leading-[1.1] mb-8">
            Environment is not background. <br />
            <span className="italic text-[#2F4F4F]">It is influence.</span>
          </h1>
          <div className="w-16 h-[1px] bg-[#222222] mx-auto mb-8" />
          <p className="text-lg md:text-xl uppercase tracking-widest font-light opacity-70">
            What surrounds you is shaping you — every day.
          </p>
        </motion.div>
      </section>

      {/* 2. THE CONVICTION */}
      <section className="py-20 px-6 md:px-12 bg-white border-y border-[#222222]/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[500px] md:h-[700px] bg-[#F0EEE9] overflow-hidden"
            >
              <img 
                src={aboutHero} 
                alt="Minimalist Wall Art" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Text Side */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="space-y-8"
            >
              <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                MURO POSTER was built on a simple conviction: <br/>
                <span className="text-[#2F4F4F]">environment creates identity.</span>
              </h2>
              <p className="text-lg leading-relaxed opacity-80 font-light">
                We do not see walls as decoration. We see them as psychological space — a place where repetition becomes a mindset.
              </p>
              <p className="text-lg leading-relaxed opacity-80 font-light">
                Every day you absorb what you repeatedly see: words, structure, form, space. They enter quietly, settle deeply, and begin to guide how you think, decide, and act. 
              </p>
              <div className="pl-6 border-l-2 border-[#2F4F4F]">
                <p className="text-xl font-serif italic">
                  "Most environments are designed for appearance. We design for intention."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. THE PHILOSOPHY */}
      <section className="py-24 px-6 md:px-12 bg-[#222222] text-[#F0EEE9] text-center">
        <div className="container mx-auto max-w-3xl">
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            <Quote className="w-10 h-10 mx-auto text-[#2F4F4F] mb-8 opacity-80" />
            <h3 className="font-serif text-3xl md:text-5xl leading-tight mb-8">
              Not a trend. No noise. <br/>
              <span className="italic text-white">Just Repetition.</span>
            </h3>
            <p className="text-lg md:text-xl font-light opacity-70 leading-relaxed mb-10">
              Each MURO piece exists to reinforce a chosen state — clarity, discipline, focus, calm, strength, growth. Identity is not declared once; it is built daily through what you allow to surround you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. THE MISSION */}
      <section className="py-24 px-6 md:px-12 bg-[#F0EEE9] relative">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 md:order-1">
            <h2 className="font-serif text-4xl md:text-6xl mb-6 leading-none">
              We are not here to fill walls.
            </h2>
            <p className="text-lg opacity-80 mb-6 font-light">
              We are here to shape the atmosphere — to create spaces that support becoming. MURO is for those who understand that growth is a process, and the environment is an active participant in it.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-[#222222] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#2F4F4F] transition-all duration-300 mt-4"
            >
              Start Shaping Your Space <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="order-1 md:order-2 relative h-[400px] md:h-[600px] overflow-hidden group">
            <img 
              src={aboutInterior} 
              alt="Atmosphere" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
             <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur text-[#222222] px-4 py-2 text-[10px] uppercase font-bold tracking-widest border border-[#222222]/10">
                Est. 2026
             </div>
          </div>

        </div>
      </section>

      {/* 5. FINAL REMINDER */}
      <section className="py-20 text-center border-t border-[#222222]/5">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2F4F4F] mb-4">
          Final Thought
        </p>
        <h2 className="font-serif text-3xl md:text-5xl max-w-4xl mx-auto leading-tight mb-8">
          "Choose what surrounds you with intention. <br className="hidden md:block"/> It is already shaping who you are becoming."
        </h2>
      </section>

    </main>
  );
};

export default About;