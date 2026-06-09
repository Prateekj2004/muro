import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, Clock } from "lucide-react";

const Footer = () => {
  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <footer className="bg-[#F1F1F1] text-[#111111] border-t border-[#E4E4E4] font-sans">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          {/* Column 1: Text Logo + About + Newsletter + Social */}
          <div className="text-left">
            <Link
              to="/"
              className="block w-[360px] max-w-full h-[42px] mb-9 overflow-hidden"
              aria-label="MURO POSTER"
            >
              <div
                className="h-full flex items-center text-[#111111] uppercase whitespace-nowrap leading-none"
                style={{
                  fontFamily:
                    '"Coolvetica", "Coolvetica Regular", Arial, sans-serif',
                  fontSize: "28px",
                  fontWeight: 400,
                  letterSpacing: "0.034em",
                }}
              >
                MURO POSTER
              </div>
            </Link>

            <p className="w-[360px] max-w-full leading-[1.75] text-[13px] text-[#111111]/70 mb-7">
              We don't design decorations. We design reminders. Environment
              creates identity.
            </p>

            {/* Small Newsletter Section */}
            <div className="w-[360px] max-w-full mb-9">
              <h5 className="text-[14px] mb-3 font-medium text-[#111111]">
                Join our community and receive 10% off.
              </h5>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex w-full items-center gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-[42px] min-w-0 flex-1 rounded-full border border-[#9A9A9A] bg-white px-4 text-[13px] text-[#111111] outline-none placeholder:text-[#111111]/55 focus:border-[#111111]"
                />

                <button
                  type="submit"
                  className="h-[42px] shrink-0 rounded-full bg-[#1D1818] px-5 text-[13px] text-white transition-colors hover:bg-black"
                >
                  Sign up
                </button>
              </form>

              <p className="mt-3 text-[11px] leading-relaxed text-[#111111]/60">
                By subscribing, you agree to receive our newsletter and our{" "}
                <Link to="/privacy" className="underline hover:text-[#111111]">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <h5 className="text-[16px] mb-5 tracking-wide text-[#111111]/80">
              Follow Us
            </h5>

            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#111111] hover:text-white hover:bg-[#111111] bg-white border border-[#D8D8D8] p-2.5 rounded-full transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#111111] hover:text-white hover:bg-[#111111] bg-white border border-[#D8D8D8] p-2.5 rounded-full transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="text-left">
            <h4 className="h-[42px] flex items-center text-[24px] md:text-[26px] mb-9 tracking-wide text-[#111111]">
              Shop
            </h4>

            <div className="flex flex-col gap-4 text-[14px] text-[#111111]/70">
              <Link
                to="/shop"
                className="hover:text-[#111111] transition-all w-fit"
              >
                All Products
              </Link>

              <Link
                to="/bestsellers"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Bestsellers
              </Link>

              <Link
                to="/new-arrivals"
                className="hover:text-[#111111] transition-all w-fit"
              >
                New Arrivals
              </Link>

              <Link
                to="/shop"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Shop by Mood
              </Link>

              <Link
                to="/gift-ideas"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Gift Ideas
              </Link>
            </div>
          </div>

          {/* Column 3: Policies */}
          <div className="text-left">
            <h4 className="h-[42px] flex items-center text-[24px] md:text-[26px] mb-9 tracking-wide text-[#111111]">
              Policies
            </h4>

            <div className="flex flex-col gap-4 text-[14px] text-[#111111]/70">
              <Link
                to="/shipping-policy"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Shipping Policy
              </Link>

              <Link
                to="/cancellation-refund"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Cancellation & Refund
              </Link>

              <Link
                to="/terms"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/privacy"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Privacy Policy
              </Link>

              <Link
                to="/#faqs"
                className="hover:text-[#111111] transition-all w-fit"
              >
                FAQ
              </Link>

              <Link
                to="/disclaimer"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Website Disclaimer
              </Link>
            </div>
          </div>

          {/* Column 4: Support */}
          <div className="text-left">
            <h4 className="h-[42px] flex items-center text-[24px] md:text-[26px] mb-9 tracking-wide text-[#111111]">
              Support
            </h4>

            <div className="flex flex-col gap-4 text-[14px] text-[#111111]/70">
              <Link
                to="/contact"
                className="hover:text-[#111111] transition-all w-fit"
              >
                Contact Page
              </Link>

              <a
                href="mailto:helpmuroposter@gmail.com"
                className="flex items-center gap-3 hover:text-[#111111] transition-all w-fit"
              >
                <Mail size={16} /> helpmuroposter@gmail.com
              </a>

              <a
                href="https://wa.me/918059700876"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#111111] transition-all w-fit"
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
                className="hover:text-[#111111] transition-all w-fit mt-2 font-semibold border-b border-[#111111]/30 pb-0.5"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-[#111111]/10 pt-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="text-left text-[10px] md:text-xs uppercase tracking-widest text-[#111111]/45">
            <p className="mb-1">© 2026 MURO POSTER. All rights reserved.</p>
            <p>Operated by Saar Graphics, India.</p>

            <div className="hidden md:flex gap-6 mt-5">
              <span>Secure Payment Processing</span>
              <span>|</span>
              <span>Efficient Order Handling</span>
              <span>|</span>
              <span>Customer Support Available</span>
            </div>
          </div>

          {/* Payment Options */}
          <div className="w-full lg:w-auto text-left lg:text-right">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.45em] text-[#111111]">
              Securely Pay Using
            </p>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="inline-flex h-9 items-center rounded-[8px] bg-white px-3 text-[11px] font-bold text-[#EB001B] border border-[#D8D8D8] shadow-sm">
                MasterCard
              </span>

              <span className="inline-flex h-9 items-center rounded-[8px] bg-white px-3 text-[11px] font-bold text-[#1A4FA3] border border-[#D8D8D8] shadow-sm">
                RuPay
              </span>

              <span className="inline-flex h-9 items-center rounded-[8px] bg-white px-3 text-[11px] font-bold text-[#111111] border border-[#D8D8D8] shadow-sm">
                UPI
              </span>

              <span className="inline-flex h-9 items-center rounded-[8px] bg-white px-3 text-[11px] font-bold text-[#00B9F1] border border-[#D8D8D8] shadow-sm">
                Paytm
              </span>

              <span className="inline-flex h-9 items-center rounded-[8px] bg-white px-3 text-[11px] font-bold text-[#2E77BB] border border-[#D8D8D8] shadow-sm">
                AMEX
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;