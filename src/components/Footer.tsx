import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-[#F0EEE9] border-t border-white/5 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          {/* Column 1: Text Logo + About */}
          <div className="text-left">
            <Link
              to="/"
              className="block w-[360px] max-w-full h-[42px] mb-9 overflow-hidden"
              aria-label="MURO POSTER"
            >
              <div
                className="h-full flex items-center text-white uppercase whitespace-nowrap leading-none"
                style={{
                  fontFamily: '"Coolvetica", "Coolvetica Regular", Arial, sans-serif',
                  fontSize: "28px",
                  fontWeight: 400,
                  letterSpacing: "0.034em",
                }}
              >
                MURO POSTER
              </div>
            </Link>

            <p className="w-[360px] max-w-full leading-[1.75] text-[13px] opacity-70 mb-10">
              We don't design decorations. We design reminders. Environment
              creates identity.
            </p>

            <h5 className="text-[16px] mb-5 tracking-wide opacity-80">
              Follow Us
            </h5>

            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2F4F4F] hover:bg-white bg-white/10 p-2.5 rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2F4F4F] hover:bg-white bg-white/10 p-2.5 rounded-full transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="text-left">
            <h4 className="h-[42px] flex items-center text-[24px] md:text-[26px] mb-9 tracking-wide text-white">
              Shop
            </h4>

            <div className="flex flex-col gap-4 text-[14px] opacity-70">
              <Link
                to="/shop"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                All Products
              </Link>

              <Link
                to="/bestsellers"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Bestsellers
              </Link>

              <Link
                to="/new-arrivals"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                New Arrivals
              </Link>

              <Link
                to="/shop"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Shop by Mood
              </Link>

              <Link
                to="/gift-ideas"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Gift Ideas
              </Link>
            </div>
          </div>

          {/* Column 3: Policies */}
          <div className="text-left">
            <h4 className="h-[42px] flex items-center text-[24px] md:text-[26px] mb-9 tracking-wide text-white">
              Policies
            </h4>

            <div className="flex flex-col gap-4 text-[14px] opacity-70">
              <Link
                to="/shipping-policy"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Shipping Policy
              </Link>

              <Link
                to="/cancellation-refund"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Cancellation & Refund
              </Link>

              <Link
                to="/terms"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/privacy"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Privacy Policy
              </Link>

              <Link
                to="/#faqs"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                FAQ
              </Link>

              <Link
                to="/disclaimer"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Website Disclaimer
              </Link>
            </div>
          </div>

          {/* Column 4: Support */}
          <div className="text-left">
            <h4 className="h-[42px] flex items-center text-[24px] md:text-[26px] mb-9 tracking-wide text-white">
              Support
            </h4>

            <div className="flex flex-col gap-4 text-[14px] opacity-70">
              <Link
                to="/contact"
                className="hover:opacity-100 hover:text-white transition-all w-fit"
              >
                Contact Page
              </Link>

              <a
                href="mailto:helpmuroposter@gmail.com"
                className="flex items-center gap-3 hover:opacity-100 hover:text-white transition-all w-fit"
              >
                <Mail size={16} /> helpmuroposter@gmail.com
              </a>

              <a
                href="https://wa.me/918059700876"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-100 hover:text-white transition-all w-fit"
              >
                <Phone size={16} /> +91 80597 00876
              </a>

              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Mon – Fri
                  <br />
                  10:00 AM – 6:00 PM (IST)
                </span>
              </div>

              <Link
                to="/track-order"
                className="hover:opacity-100 hover:text-white transition-all w-fit mt-2 font-semibold border-b border-white/30 pb-0.5"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-[10px] md:text-xs uppercase tracking-widest opacity-40">
          <div className="text-left">
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