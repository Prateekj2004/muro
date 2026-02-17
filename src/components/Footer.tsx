import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, Clock, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-[#F0EEE9] border-t border-white/5 font-sans">
      <div className="container mx-auto px-6 md:px-12 pt-16 pb-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Shop */}
          <div>
            <h4 className="font-serif text-lg md:text-xl mb-6 tracking-wide">Shop</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70">
              <Link to="/shop" className="hover:opacity-100 hover:text-white transition-all w-fit">All Products</Link>
              <Link to="/bestsellers" className="hover:opacity-100 hover:text-white transition-all w-fit">Bestsellers</Link>
              <Link to="/new-arrivals" className="hover:opacity-100 hover:text-white transition-all w-fit">New Arrivals</Link>
              <Link to="/shop" className="hover:opacity-100 hover:text-white transition-all w-fit">Shop by Mood</Link>
              <Link to="/gift-ideas" className="hover:opacity-100 hover:text-white transition-all w-fit">Gift Ideas</Link>
            </div>
          </div>

          {/* Column 2: Policies */}
          <div>
            <h4 className="font-serif text-lg md:text-xl mb-6 tracking-wide">Policies</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70">
              <Link to="/shipping-policy" className="hover:opacity-100 hover:text-white transition-all w-fit">Shipping Policy</Link>
              <Link to="/cancellation-refund" className="hover:opacity-100 hover:text-white transition-all w-fit">Cancellation & Refund</Link>
              <Link to="/terms" className="hover:opacity-100 hover:text-white transition-all w-fit">Terms & Conditions</Link>
              <Link to="/privacy" className="hover:opacity-100 hover:text-white transition-all w-fit">Privacy Policy</Link>
              <Link to="/faq" className="hover:opacity-100 hover:text-white transition-all w-fit">FAQ</Link>
              <Link to="/disclaimer" className="hover:opacity-100 hover:text-white transition-all w-fit">Website Disclaimer</Link>
            </div>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-serif text-lg md:text-xl mb-6 tracking-wide">Support</h4>
            <div className="flex flex-col gap-4 text-sm opacity-70">
              <Link to="/contact" className="hover:opacity-100 hover:text-white transition-all w-fit">Contact Page</Link>
              
              <a href="mailto:helpmuroposter@gmail.com" className="flex items-center gap-3 hover:opacity-100 hover:text-white transition-all w-fit">
                <Mail size={16} /> helpmuroposter@gmail.com
              </a>
              
              <a href="https://wa.me/918059700876" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-100 hover:text-white transition-all w-fit">
                <Phone size={16} /> +91 80597 00876
              </a>

              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Mon – Fri<br/>
                  10:00 AM – 6:00 PM (IST)
                </span>
              </div>

              <Link to="/track-order" className="hover:opacity-100 hover:text-white transition-all w-fit mt-2 font-semibold border-b border-white/30 pb-0.5">
                Track Your Order
              </Link>
            </div>
          </div>

          {/* Column 4: About & Socials */}
          <div>
            <h4 className="font-serif text-lg md:text-xl mb-6 tracking-wide">About MURO</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70 mb-8">
              <Link to="/about" className="hover:opacity-100 hover:text-white transition-all w-fit">About Us</Link>
              <p className="leading-relaxed text-xs max-w-xs opacity-80">
                We don't design decorations. We design reminders. Environment creates identity.
              </p>
            </div>

            <h5 className="font-serif text-md mb-4 tracking-wide opacity-80">Follow Us</h5>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2F4F4F] hover:bg-white bg-white/10 p-2 rounded-full transition-all duration-300">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2F4F4F] hover:bg-white bg-white/10 p-2 rounded-full transition-all duration-300">
                <Facebook size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Very Bottom Strip */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs uppercase tracking-widest opacity-40">
          <div className="text-center md:text-left">
            <p className="mb-1">© 2026 MURO POSTER. All rights reserved.</p>
            <p>Operated by Saar Graphics, India.</p>
          </div>
          
          <div className="hidden md:flex gap-6">
            <span>Secure Payment Processing</span>
            <span>|</span>
            <span>Efficient Order Handling</span>
            <span>|</span>
            <span>Customer Support Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;