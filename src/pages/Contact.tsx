import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Youtube, Instagram, Twitter, Send } from "lucide-react";
import { toast } from "sonner"; // Agar sonner use kar rahe ho, nahi toh alert use kar lena

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
      // Payload jo backend pe jayega
      const payload = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        source: "MURO_CONTACT_FORM",
        timestamp: new Date().toISOString()
      };

      // Backend Route: /api/contact
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
    <main className="bg-[#F0EEE9] min-h-screen text-[#1c1c1c] font-sans pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-montserrat text-5xl md:text-7xl mb-6"
          >
            Contact Us
          </motion.h1>
          <p className="text-gray-500 max-w-lg mx-auto text-lg">
            We're here to help! Whether you have questions, feedback, or need support, our team is ready to assist you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-20">
          
          {/* Left Side: Contact Details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <h2 className="font-montserrat text-4xl mb-8">Get in touch</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 mt-1 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Email</p>
                  <p className="text-xl font-medium">helpmuroposter@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 mt-1 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-xl font-medium">(123) 1221 2323</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 mt-1 text-gray-400" />
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Address</p>
                  <p className="text-xl font-medium leading-relaxed">
                    123 Innovation Avenue, Suite 456<br />
                    Tech District, San Francisco, CA 94107
                  </p>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Side: Form */}
          <motion.form 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-4">Your Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/50 border-none rounded-full py-4 px-6 focus:ring-2 focus:ring-[#064e3b] outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-4">Email address</label>
                <input 
                  required
                  type="email" 
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white/50 border-none rounded-full py-4 px-6 focus:ring-2 focus:ring-[#064e3b] outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium ml-4">Message</label>
              <textarea 
                required
                rows={5} 
                placeholder="Write something...."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="bg-white/50 border-none rounded-[30px] py-4 px-6 focus:ring-2 focus:ring-[#064e3b] outline-none transition-all shadow-sm resize-none"
              ></textarea>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#1c1c1c] text-white font-bold py-5 rounded-full hover:bg-emerald-900 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              {loading ? "Sending..." : "Send Message"}
              {!loading && <Send className="w-4 h-4" />}
            </button>
          </motion.form>

        </div>
      </div>
    </main>
  );
};

export default Contact;