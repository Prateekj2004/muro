import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MessageCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PolicyProps {
  title: string;
  // Last Updated hata diya gaya hai
  children: React.ReactNode;
}

const PolicyPage: React.FC<PolicyProps> = ({ title, children }) => {
  return (
    <main className="bg-[#F0EEE9] text-[#222222] min-h-screen font-sans selection:bg-[#2F4F4F] selection:text-white border-t border-[#222222]/5">
      
      {/* 1. HEADER SECTION */}
      {/* Reverted: Padding wapas pehle jaisi badi kar di (py-16 md:py-24) */}
      <div className="bg-white border-b border-[#222222]/10 py-16 md:py-24">
  <div className="container mx-auto px-6 md:px-12">
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full" // max-w-4xl hata diya taaki desktop pe jagah mile
    >
      <Link to="/" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-[#222222]/40 hover:text-[#2F4F4F] transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Home
      </Link>
      
      {/* CHANGES:
         1. whitespace-normal: Mobile par lines mein tootne dega.
         2. md:whitespace-nowrap: iPad/Laptop se upar single line force karega.
      */}
      <h1 className="font-coolvetica text-5xl md:text-7xl lg:text-7xl uppercase tracking-tight leading-[0.9] text-[#222222] whitespace-normal md:whitespace-nowrap">
        {title}
      </h1>
      
    </motion.div>
  </div>
</div>

      {/* 2. MAIN LAYOUT (Content + Right Sidebar) */}
      <div className="container mx-auto px-6 md:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* LEFT: MAIN CONTENT */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-8"
          >
            {/* Drop Cap styling (first-letter) retained */}
            <div className="prose prose-lg prose-neutral max-w-none 
              prose-headings:font-coolvetica prose-headings:uppercase prose-headings:tracking-wide prose-headings:text-[#222222] 
              prose-p:font-sans prose-p:text-[#222222]/80 prose-p:leading-8 prose-p:text-[16px] md:prose-p:text-[18px]
              prose-li:text-[#222222]/80 prose-strong:font-bold prose-strong:text-[#222222]"
            >
              {children}
            </div>
          </motion.div>

          {/* RIGHT: SIDEBAR */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-32"
          >
            
            {/* Card 1: Quick Links */}
            <div className="bg-white p-8 border border-[#222222]/5 shadow-sm">
              <h3 className="font-coolvetica uppercase text-xl tracking-wide mb-6">Quick Navigation</h3>
              <nav className="flex flex-col gap-4 text-sm font-medium text-[#222222]/60">
                <Link to="/shipping-policy" className="flex items-center justify-between hover:text-[#2F4F4F] transition-colors group">
                  Shipping Policy <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Link>
                <div className="h-[1px] bg-[#222222]/5" />
                <Link to="/cancellation-refund" className="flex items-center justify-between hover:text-[#2F4F4F] transition-colors group">
                  Cancellation & Refund Policy <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Link>
                <div className="h-[1px] bg-[#222222]/5" />
                <Link to="/privacy-policy" className="flex items-center justify-between hover:text-[#2F4F4F] transition-colors group">
                  Privacy Policy <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Link>
                <div className="h-[1px] bg-[#222222]/5" />
                <Link to="/terms" className="flex items-center justify-between hover:text-[#2F4F4F] transition-colors group">
                  Terms & Conditions <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </Link>
              </nav>
            </div>

            {/* Card 2: Contact Box */}
            <div className="bg-[#222222] text-[#F0EEE9] p-8">
              <h3 className="font-coolvetica uppercase text-xl tracking-wide mb-2">Need Help?</h3>
              <p className="text-xs opacity-70 mb-6 leading-relaxed">
                If you have questions about this policy, our support team is available to assist you.
              </p>
              
              <div className="space-y-4">
                <a href="mailto:helpmuroposter@gmail.com" className="flex items-center gap-3 text-sm font-bold hover:opacity-80 transition-opacity">
                  <Mail size={16} /> helpmuroposter@gmail.com
                </a>
                <a href="https://wa.me/918059700876" className="flex items-center gap-3 text-sm font-bold hover:opacity-80 transition-opacity">
                  <MessageCircle size={16} /> +91 80597 00876
                </a>
              </div>
            </div>

          </motion.aside>

        </div>
      </div>
    </main>
  );
};

export default PolicyPage;