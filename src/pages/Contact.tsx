// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { 
//   Mail, Phone, MapPin, Youtube, Instagram, Twitter, 
//   Send, MessageCircle, Package, HelpCircle, Star 
// } from "lucide-react";
// import { toast } from "sonner"; 

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = {
//         name: formData.name,
//         email: formData.email,
//         message: formData.message,
//         source: "MURO_CONTACT_FORM",
//         timestamp: new Date().toISOString()
//       };

//       const response = await fetch("https://muroposter.com/api/contact", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         toast.success("Message sent successfully!");
//         setFormData({ name: "", email: "", message: "" });
//       } else {
//         throw new Error("Failed to send");
//       }
//     } catch (error) {
//       toast.error("Something went wrong. Please try again.");
//       console.error("Contact Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="bg-[#F0EEE9] min-h-screen text-[#1c1c1c] font-sans pt-20 pb-20 overflow-hidden">
//       <div className="max-w-6xl mx-auto px-6 md:px-12">
        
//         {/* ══════════════════════════════════════════
//             1. HEADER & FORM SECTION
//             ══════════════════════════════════════════ */}
//         <div className="text-center mb-20">
//           <motion.h1 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="font-montserrat text-5xl md:text-7xl mb-6 tracking-tight"
//           >
//             Contact Us
//           </motion.h1>
//           <p className="text-gray-500 max-w-lg mx-auto text-lg">
//             We're here to help! Whether you have questions, feedback, or need support, our team is ready to assist you.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-20">
          
//           {/* Left Side: Contact Details */}
//           <motion.div 
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             className="space-y-10"
//           >
//             <h2 className="font-montserrat text-4xl mb-8">Get in touch</h2>
            
//             <div className="space-y-8">
//               <div className="flex items-start gap-4">
//                 <Mail className="w-5 h-5 mt-1 text-gray-400" />
//                 <div>
//                   <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Email</p>
//                   <p className="text-xl font-medium">helpmuroposter@gmail.com</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <Phone className="w-5 h-5 mt-1 text-gray-400" />
//                 <div>
//                   <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Phone</p>
//                   <p className="text-xl font-medium">(123) 1221 2323</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <MapPin className="w-5 h-5 mt-1 text-gray-400" />
//                 <div>
//                   <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Address</p>
//                   <p className="text-xl font-medium leading-relaxed">
//                     123 Innovation Avenue, Suite 456<br />
//                     Tech District, San Francisco, CA 94107
//                   </p>
//                 </div>
//               </div>
//             </div>

//           </motion.div>

//           {/* Right Side: Form */}
//           <motion.form 
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             onSubmit={handleSubmit}
//             className="space-y-6"
//           >
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-medium ml-4">Your Name</label>
//                 <input 
//                   required
//                   type="text" 
//                   placeholder="Your name"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="bg-white/50 border-none rounded-full py-4 px-6 focus:ring-2 focus:ring-[#064e3b] outline-none transition-all shadow-sm"
//                 />
//               </div>
//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-medium ml-4">Email address</label>
//                 <input 
//                   required
//                   type="email" 
//                   placeholder="Your email address"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   className="bg-white/50 border-none rounded-full py-4 px-6 focus:ring-2 focus:ring-[#064e3b] outline-none transition-all shadow-sm"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col gap-2">
//               <label className="text-sm font-medium ml-4">Message</label>
//               <textarea 
//                 required
//                 rows={5} 
//                 placeholder="Write something...."
//                 value={formData.message}
//                 onChange={(e) => setFormData({...formData, message: e.target.value})}
//                 className="bg-white/50 border-none rounded-[30px] py-4 px-6 focus:ring-2 focus:ring-[#064e3b] outline-none transition-all shadow-sm resize-none"
//               ></textarea>
//             </div>

//             <button 
//               disabled={loading}
//               type="submit"
//               className="w-full bg-[#1c1c1c] text-white font-bold py-5 rounded-full hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
//             >
//               {loading ? "Sending..." : "Send Message"}
//               {!loading && <Send className="w-4 h-4" />}
//             </button>
//           </motion.form>

//         </div>

//         {/* ══════════════════════════════════════════
//             2. QUICK SUPPORT CARDS
//             ══════════════════════════════════════════ */}
//         <motion.div 
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="grid md:grid-cols-3 gap-6 mt-32"
//         >
//           {/* WhatsApp Support */}
//           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:bg-[#1c1c1c] transition-all duration-500">
//             <div className="w-14 h-14 bg-[#F0EEE9] rounded-full flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
//               <MessageCircle className="w-6 h-6 text-[#1c1c1c] group-hover:text-white" />
//             </div>
//             <h3 className="text-lg font-bold mb-2 group-hover:text-white font-montserrat">Chat on WhatsApp</h3>
//             <p className="text-gray-500 text-sm mb-6 group-hover:text-white/80">Get instant reply from our team for any order queries.</p>
//             <a href="https://wa.me/yournumber" target="_blank" rel="noreferrer" className="text-[#1c1c1c] font-bold text-sm uppercase tracking-widest group-hover:text-white border-b border-[#1c1c1c] group-hover:border-white pb-1">Chat Now →</a>
//           </div>

//           {/* Order Tracking */}
//           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:bg-[#1c1c1c] transition-all duration-500">
//             <div className="w-14 h-14 bg-[#F0EEE9] rounded-full flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
//               <Package className="w-6 h-6 text-[#1c1c1c] group-hover:text-white" />
//             </div>
//             <h3 className="text-lg font-bold mb-2 group-hover:text-white font-montserrat">Track Order</h3>
//             <p className="text-gray-500 text-sm mb-6 group-hover:text-white/80">Curious about your posters? Track your shipment in real-time.</p>
//             <Link to="/track-order" className="text-[#1c1c1c] font-bold text-sm uppercase tracking-widest group-hover:text-white border-b border-[#1c1c1c] group-hover:border-white pb-1">Track Here →</Link>
//           </div>

//           {/* FAQ Link */}
//           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:bg-[#1c1c1c] transition-all duration-500">
//             <div className="w-14 h-14 bg-[#F0EEE9] rounded-full flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
//               <HelpCircle className="w-6 h-6 text-[#1c1c1c] group-hover:text-white" />
//             </div>
//             <h3 className="text-lg font-bold mb-2 group-hover:text-white font-montserrat">Visit FAQs</h3>
//             <p className="text-gray-500 text-sm mb-6 group-hover:text-white/80">Find quick answers about shipping, returns, and framing.</p>
//             <a href="#faqs" className="text-[#1c1c1c] font-bold text-sm uppercase tracking-widest group-hover:text-white border-b border-[#1c1c1c] group-hover:border-white pb-1">View FAQs →</a>
//           </div>
//         </motion.div>

//         {/* ══════════════════════════════════════════
//             3. SOCIAL PROOF / REVIEWS
//             ══════════════════════════════════════════ */}
//         <section className="mt-32 border-t border-gray-300 pt-20">
//           <div className="text-center mb-12">
//             <h2 className="font-montserrat text-4xl md:text-5xl uppercase tracking-tighter mb-4">
//               What our <span className="italic font-light text-gray-500">community</span> says
//             </h2>
//             <p className="text-gray-500 max-w-md mx-auto">Join thousands of art lovers who transformed their spaces with Muro posters.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               { name: "Rahul S.", text: "The quality of the paper is insane. It doesn't feel like a normal poster, it's actual premium art.", rating: 5 },
//               { name: "Priya M.", text: "Packaging was so secure, I was worried about the frames but they arrived in perfect condition.", rating: 5 },
//               { name: "Karan D.", text: "Customer support is very responsive. They helped me choose the right size for my living room wall.", rating: 5 }
//             ].map((review, i) => (
//               <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 transition-transform hover:-translate-y-2">
//                 <div className="flex gap-1 mb-4">
//                   {[...Array(review.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
//                 </div>
//                 <p className="text-gray-700 italic mb-6">"{review.text}"</p>
//                 <p className="font-bold text-sm uppercase tracking-widest">— {review.name}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ══════════════════════════════════════════
//             4. INSTAGRAM GRID
//             ══════════════════════════════════════════ */}

//       </div>
//     </main>
//   );
// };

// export default Contact;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Youtube, Instagram, Twitter, 
  Send, MessageCircle, Package, HelpCircle, Star, ArrowRight
} from "lucide-react";
import { toast } from "sonner"; 

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        source: "MURO_CONTACT_FORM",
        timestamp: new Date().toISOString()
      };

      const response = await fetch("https://muroposter.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F0EEE9] min-h-screen text-[#1c1c1c] font-sans pt-24 pb-20 overflow-hidden selection:bg-[#a0b695] selection:text-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* ══════════════════════════════════════════
            1. EDITORIAL HEADER & FORM
            ══════════════════════════════════════════ */}
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-montserrat text-sm tracking-[0.2em] text-[#57663D] uppercase mb-4"
          >
            We are here for you
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-montserrat text-5xl md:text-7xl tracking-tighter uppercase font-light text-[#1c1c1c]"
          >
            Get In <span className="font-bold">Touch</span>
          </motion.h1>
        </div>

        {/* Floating White Canvas Box */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Left Side: Brand Info & Image */}
          <div className="lg:w-2/5 relative bg-[#1c1c1c] text-white p-10 md:p-16 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop" 
                alt="Background Texture" 
                className="w-full h-full object-cover grayscale"
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="font-montserrat text-3xl mb-10 tracking-tight">Contact Information</h2>
              
              <div className="space-y-8 font-light tracking-wide">
                <div className="group flex items-start gap-4 cursor-pointer">
                  <Mail className="w-5 h-5 mt-1 text-[#a0b695] group-hover:text-white transition-colors" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Email</p>
                    <p className="text-lg">helpmuroposter@gmail.com</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 cursor-pointer">
                  <Phone className="w-5 h-5 mt-1 text-[#a0b695] group-hover:text-white transition-colors" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                    <p className="text-lg">(123) 1221 2323</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 cursor-pointer">
                  <MapPin className="w-5 h-5 mt-1 text-[#a0b695] group-hover:text-white transition-colors" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Studio</p>
                    <p className="text-lg leading-relaxed text-gray-300">
                      123 Innovation Avenue, Suite 456<br />
                      Tech District, San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 pt-8 border-t border-white/20 flex gap-6">
              <Youtube className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-3/5 p-10 md:p-16 lg:p-20 bg-white">
            <h3 className="font-montserrat text-2xl mb-2 text-[#1c1c1c]">Send us a message</h3>
            <p className="text-gray-500 mb-10 text-sm">Our team typically responds within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative border-b border-gray-300 focus-within:border-[#1c1c1c] transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Your Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-transparent border-none outline-none text-[#1c1c1c] placeholder-gray-300"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="relative border-b border-gray-300 focus-within:border-[#1c1c1c] transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-transparent border-none outline-none text-[#1c1c1c] placeholder-gray-300"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="relative border-b border-gray-300 focus-within:border-[#1c1c1c] transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Message</label>
                <textarea 
                  required
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border-none outline-none text-[#1c1c1c] placeholder-gray-300 resize-none mt-2"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full md:w-auto px-10 py-4 bg-[#1c1c1c] text-white font-medium hover:bg-[#57663D] transition-colors flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {loading ? "Sending..." : "Send Message"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            2. DIRECT SUPPORT ACTION CARDS
            ══════════════════════════════════════════ */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4 mt-12"
        >
          <a href="https://wa.me/yournumber" target="_blank" rel="noreferrer" className="bg-white p-8 border border-gray-200 hover:border-[#57663D] transition-all group flex flex-col items-center text-center">
            <MessageCircle className="w-8 h-8 text-[#1c1c1c] mb-4 group-hover:text-[#57663D] transition-colors" strokeWidth={1.5} />
            <h3 className="font-montserrat text-lg font-medium mb-2 uppercase tracking-wide">WhatsApp Us</h3>
            <p className="text-gray-500 text-sm">Instant replies for immediate queries.</p>
          </a>

          <Link to="/track-order" className="bg-white p-8 border border-gray-200 hover:border-[#57663D] transition-all group flex flex-col items-center text-center">
            <Package className="w-8 h-8 text-[#1c1c1c] mb-4 group-hover:text-[#57663D] transition-colors" strokeWidth={1.5} />
            <h3 className="font-montserrat text-lg font-medium mb-2 uppercase tracking-wide">Track Order</h3>
            <p className="text-gray-500 text-sm">Check the status of your poster shipment.</p>
          </Link>

          <a href="#faqs" className="bg-white p-8 border border-gray-200 hover:border-[#57663D] transition-all group flex flex-col items-center text-center">
            <HelpCircle className="w-8 h-8 text-[#1c1c1c] mb-4 group-hover:text-[#57663D] transition-colors" strokeWidth={1.5} />
            <h3 className="font-montserrat text-lg font-medium mb-2 uppercase tracking-wide">Read FAQs</h3>
            <p className="text-gray-500 text-sm">Quick answers about shipping and framing.</p>
          </a>
        </motion.div> */}

        {/* ══════════════════════════════════════════
            3. COMMUNITY REVIEWS
            ══════════════════════════════════════════ */}
        {/* <section className="mt-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="font-montserrat font-light tracking-[1px] text-[22px] text-[#1c1c1c] uppercase">
                Community <span className="font-bold">Trust</span>
              </h2>
            </div>
            <Link to="/reviews" className="text-[12px] font-medium tracking-[1px] text-[#1C1C1C] uppercase hover:underline mt-4 md:mt-0">
              View All Reviews
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Rahul S.", text: "The quality of the paper is insane. It doesn't feel like a normal poster, it's actual premium art.", rating: 5 },
              { name: "Priya M.", text: "Packaging was so secure, I was worried about the frames but they arrived in perfect condition.", rating: 5 },
              { name: "Karan D.", text: "Customer support is very responsive. They helped me choose the right size for my living room wall.", rating: 5 }
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-black text-black" />)}
                  </div>
                  <p className="text-[#1c1c1c] font-light leading-relaxed mb-6">"{review.text}"</p>
                </div>
                <p className="font-bold text-xs uppercase tracking-widest text-gray-500">— {review.name}</p>
              </div>
            ))}
          </div>
        </section> */}

        {/* ══════════════════════════════════════════
            4. INSTAGRAM FEATURE WALL
            ══════════════════════════════════════════ */}
        {/* <section className="mt-32">
          <div className="text-center mb-10">
            <h2 className="font-montserrat font-light tracking-[1px] text-[22px] text-[#1c1c1c] uppercase mb-2">
              Featured on <span className="font-bold">Muro</span>
            </h2>
            <p className="text-gray-500 text-sm tracking-wide">Tag @muroposter to show us your walls.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
            {[
              "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600",
              "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600",
              "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600",
              "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600"
            ].map((img, idx) => (
              <a href="https://instagram.com" target="_blank" rel="noreferrer" key={idx} className="relative aspect-square overflow-hidden group bg-gray-100 block">
                <img 
                  src={img} 
                  alt={`Instagram feature ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                />
              </a>
            ))}
          </div>
        </section> */}

      </div>

   
    </main>
  );
};

export default Contact;