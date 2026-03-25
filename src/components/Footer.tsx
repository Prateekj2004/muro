import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Gift, ChevronDown, Mail, Phone, Clock } from "lucide-react";

// TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
);

// Filled hill wave — top of footer only (white → green)
const TopWaveDivider = () => (
  <div className="w-full overflow-hidden leading-none -mb-1">
    <svg
      viewBox="0 0 1440 70"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="w-full h-16 md:h-20"
    >
      <path
        d="M0,70 L0,45 C40,20 80,65 120,42 C160,20 200,60 240,40 C280,20 320,58 360,38 C400,18 440,62 480,40 C520,18 560,58 600,38 C640,18 680,60 720,42 C760,22 800,62 840,40 C880,18 920,60 960,40 C1000,20 1040,58 1080,38 C1120,18 1160,60 1200,42 C1240,22 1280,62 1320,40 C1360,18 1400,58 1440,40 L1440,70 Z"
        fill="#C2D8B8"
      />
    </svg>
  </div>
);

// Stroke wave — internal dividers
const WaveDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-none px-6 md:px-10 ${flip ? "rotate-180" : ""}`}>
    <svg
      viewBox="0 0 1440 40"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="w-full h-10"
    >
      <path
        d="M20,20 C35,6 50,34 65,20 C80,6 95,34 110,20 C125,6 140,34 155,20 C170,6 185,34 200,20 C215,6 230,34 245,20 C260,6 275,34 290,20 C305,6 320,34 335,20 C350,6 365,34 380,20 C395,6 410,34 425,20 C440,6 455,34 470,20 C485,6 500,34 515,20 C530,6 545,34 560,20 C575,6 590,34 605,20 C620,6 635,34 650,20 C665,6 680,34 695,20 C710,6 725,34 740,20 C755,6 770,34 785,20 C800,6 815,34 830,20 C845,6 860,34 875,20 C890,6 905,34 920,20 C935,6 950,34 965,20 C980,6 995,34 1010,20 C1025,6 1040,34 1055,20 C1070,6 1085,34 1100,20 C1115,6 1130,34 1145,20 C1160,6 1175,34 1190,20 C1205,6 1220,34 1235,20 C1250,6 1265,34 1280,20 C1295,6 1310,34 1325,20 C1340,6 1355,34 1370,20 C1385,6 1400,34 1415,20"
        fill="none"
        stroke="#8aaa7c"
        strokeWidth="1.8"
      />
    </svg>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-white text-[#1a1a1a] font-sans">

      {/* ── TOP: filled hill wave (white → green) ── */}
      <TopWaveDivider />

      <div className="bg-[#C2D8B8]">

        {/* ══════════════════════════════════════════
            ROW 1 — NEWSLETTER + GIFT CARDS
            ══════════════════════════════════════════ */}
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-14 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

          {/* Left: Stay up to date */}
          <div>
            <h3
              className="text-[22px] md:text-[26px] font-black text-black mb-3"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Stay up to date
            </h3>
            <p className="text-[14px] text-[#2a2a2a] mb-6 leading-relaxed max-w-sm">
              Receive exclusive offers, find inspiration and discover new arrivals.
            </p>

            {/* Email form */}
            <form
              className="flex items-center max-w-sm bg-white rounded-full overflow-hidden mb-8 shadow-sm"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="example@mail.com"
                className="flex-1 py-3.5 px-5 text-[13px] outline-none bg-transparent text-[#333] placeholder:text-[#AAAAAA]"
              />
              <button
                type="submit"
                className="px-6 py-3.5 text-[12px] font-black uppercase tracking-widest text-[#333] hover:text-black transition-colors"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                SEND
              </button>
            </form>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { href: "https://instagram.com", icon: <Instagram className="w-5 h-5" /> },
                { href: "https://tiktok.com",    icon: <TikTokIcon /> },
                { href: "https://linkedin.com",  icon: <Linkedin className="w-5 h-5" /> },
                { href: "https://facebook.com",  icon: <Facebook className="w-5 h-5" /> },
              ].map(({ href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#333] transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Gift cards */}
          <div>
            <h3
              className="text-[22px] md:text-[26px] font-black text-black mb-3"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Gift cards
            </h3>
            <p className="text-[14px] text-[#2a2a2a] mb-6 leading-relaxed max-w-sm">
              A fun and thoughtful choice for art and home decor lovers! Our digital gift cards are
              emailed to you in a printable format, making it the perfect last-minute gift!
            </p>
            <Link
              to="/gift-cards"
              className="flex items-center justify-center gap-3 bg-black text-white text-[13px] font-black uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#222] transition-colors w-full max-w-sm"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <Gift className="w-4 h-4" strokeWidth={2} />
              Purchase a gift card
            </Link>
          </div>

        </div>

        {/* ── Stroke wave divider ── */}
        <WaveDivider />

        {/* ══════════════════════════════════════════
            ROW 2 — LINK COLUMNS (updated)
            ══════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════
    ROW 2 — LINK COLUMNS (4 columns)
    ══════════════════════════════════════════ */}
{/* ══════════════════════════════════════════
    ROW 2 — LINK COLUMNS
    ══════════════════════════════════════════ */}
<div className="max-w-[1200px] mx-auto px-8 md:px-16 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">

  {/* Store */}
  <div>
    <h4
      className="text-[15px] font-semibold text-black mb-5"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      Store
    </h4>
    <div className="flex flex-col gap-3 text-[14px] text-[#2a2a2a]">
      <Link to="/shop"         className="hover:text-black hover:underline transition-all w-fit">All Products</Link>
      <Link to="/bestsellers"  className="hover:text-black hover:underline transition-all w-fit">Bestsellers</Link>
      <Link to="/new-arrivals" className="hover:text-black hover:underline transition-all w-fit">New Arrivals</Link>
      <Link to="/shop"         className="hover:text-black hover:underline transition-all w-fit">Shop by Mood</Link>
      <Link to="/gift-ideas"   className="hover:text-black hover:underline transition-all w-fit">Gift Ideas</Link>
    </div>
  </div>

  {/* Policies */}
  <div>
    <h4
      className="text-[15px] font-semibold text-black mb-5"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      Policies
    </h4>
    <div className="flex flex-col gap-3 text-[14px] text-[#2a2a2a]">
      <Link to="/shipping-policy"     className="hover:text-black hover:underline transition-all w-fit">Shipping Policy</Link>
      <Link to="/cancellation-refund" className="hover:text-black hover:underline transition-all w-fit">Cancellation & Refund</Link>
      <Link to="/terms"               className="hover:text-black hover:underline transition-all w-fit">Terms & Conditions</Link>
      <Link to="/privacy"             className="hover:text-black hover:underline transition-all w-fit">Privacy Policy</Link>
      <Link to="/disclaimer"          className="hover:text-black hover:underline transition-all w-fit">Website Disclaimer</Link>
      <Link to="/faq"                 className="hover:text-black hover:underline transition-all w-fit">FAQ</Link>
    </div>
  </div>

  {/* Customer service */}
  <div>
    <h4
      className="text-[15px] font-semibold text-black mb-5"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      Support
    </h4>
    <div className="flex flex-col gap-3 text-[14px] text-[#2a2a2a]">
      <Link
        to="/track-order"
        className="hover:text-black hover:underline transition-all w-fit font-semibold"
      >
        Track Your Order
      </Link>
      <Link to="/contact" className="hover:text-black hover:underline transition-all w-fit">Contact Page</Link>
      <a
        href="mailto:helpmuroposter@gmail.com"
        className="flex items-center gap-2 hover:text-black hover:underline transition-all w-fit"
      >
        <Mail size={15} /> helpmuroposter@gmail.com
      </a>
      <a
        href="https://wa.me/918059700876"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-black hover:underline transition-all w-fit"
      >
        <Phone size={15} /> +91 80597 00876
      </a>
      <div className="flex items-start gap-2 text-[#2a2a2a]">
        <Clock size={15} className="mt-0.5 flex-shrink-0" />
        <span>
          Mon – Fri<br />
          10:00 AM – 6:00 PM (IST)
        </span>
      </div>
    </div>
  </div>

  {/* About Muro */}
  <div>
    <h4
      className="text-[15px] font-semibold text-black mb-5"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      About Muro
    </h4>
    <div className="flex flex-col gap-3 text-[14px] text-[#2a2a2a]">
      <Link to="/about" className="hover:text-black hover:underline transition-all w-fit">About Us</Link>
      <p className="text-[13px] leading-relaxed text-[#2a2a2a] opacity-80 max-w-[200px]">
        We don't design decorations. We design reminders. Environment creates identity.
      </p>
    </div>
  </div>

</div>



        {/* ── Stroke wave divider ── */}
        <WaveDivider />

        {/* ══════════════════════════════════════════
            ROW 3 — LEGAL LINKS
            ══════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════
    ROW 3 — TRUST BADGES
    ══════════════════════════════════════════ */}
<div className="max-w-[1200px] mx-auto px-8 md:px-16 py-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
  {["Secure Payment Processing", "Efficient Order Handling", "Customer Support Available"].map(
    (item, index, arr) => (
      <div key={item} className="flex items-center gap-6">
        <span className="text-[12px] uppercase tracking-widest text-[#2a2a2a]">
          {item}
        </span>
        {index < arr.length - 1 && (
          <span className="text-[#2a2a2a]/40 text-[12px]">|</span>
        )}
      </div>
    )
  )}
</div>


        {/* ══════════════════════════════════════════
            ROW 4 — BOTTOM BAR
            ══════════════════════════════════════════ */}
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[#8aaa7c]/30">

          {/* Locale selector */}
          <button className="flex items-center gap-2 border border-[#2a2a2a]/30 rounded-full px-4 py-2 text-[13px] font-medium hover:bg-white/30 transition-colors">
            <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-[2px] shrink-0">
              <rect width="20" height="4.67" y="0"    fill="#FF9933" />
              <rect width="20" height="4.67" y="4.67" fill="#FFFFFF" />
              <rect width="20" height="4.67" y="9.33" fill="#138808" />
              <circle cx="10" cy="7" r="1.8" fill="none" stroke="#000080" strokeWidth="0.4" />
              <circle cx="10" cy="7" r="0.3" fill="#000080" />
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={10 + 0.3 * Math.cos(angle)} y1={7 + 0.3 * Math.sin(angle)}
                    x2={10 + 1.8 * Math.cos(angle)} y2={7 + 1.8 * Math.sin(angle)}
                    stroke="#000080" strokeWidth="0.25"
                  />
                );
              })}
            </svg>
            <span>India (English)</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Copyright */}
          <div className="text-center text-[12px] text-[#2a2a2a]">
            <p>Copyright © 2026, Muro Poster</p>
            <p className="opacity-70">Fantastic Art. Happy Prices.</p>
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {/* Visa */}
            <div className="bg-white rounded-md px-3 py-1.5 flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-[#1A1F71] font-black text-[14px] italic tracking-tight">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-md px-2 py-1.5 flex items-center justify-center h-9 w-14 shadow-sm">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90" />
              </div>
            </div>
            {/* Google Pay */}
            <div className="bg-white rounded-md px-2 py-1.5 flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-[11px] font-black tracking-tight">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#34A853]">g</span>
                <span className="text-[#4285F4]">le</span>
              </span>
            </div>
            {/* Klarna */}
            <div className="bg-[#FFB3C7] rounded-md px-3 py-1.5 flex items-center justify-center h-9 w-14 shadow-sm">
              <span className="text-black font-black text-[13px]">klarna</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
