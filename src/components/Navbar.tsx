import { Link } from "react-router-dom";
import { ShoppingBag, Search, User, Heart } from "lucide-react";

const Navbar = () => {
  return (
    <header className="w-full bg-white border-b border-[#E5E5E5] h-[64px] font-sans">
      <div className="w-full h-full px-3 md:px-8 xl:px-12 flex items-center justify-between">
        
        {/* 1. LEFT: LOGO */}
        <div className="flex-1 flex justify-start items-center">
          <Link to="/" className="text-[24px] xl:text-[28px] font-serif font-bold tracking-[-0.02em] text-[#000000] lowercase whitespace-nowrap">
            muro poster
          </Link>
        </div>

        {/* 2. CENTER: LINKS */}
        {/* 'relative -left-4 xl:-left-8' isko visual center se thoda left khiska dega */}
        <nav className="flex-none hidden lg:flex justify-center items-center gap-4 xl:gap-6 relative -left-4 xl:-left-8">
          <Link to="/posters" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">Posters</Link>
          <Link to="/frames" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">Frames</Link>
          <Link to="/new-arrivals" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">New Arrivals</Link>
          <Link to="/top-sellers" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">Top Sellers</Link>
          <Link to="/kids-posters" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">Kids Posters</Link>
          <Link to="/inspiration" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">Inspiration</Link>
          <Link to="/business" className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity">Business</Link>
        </nav>

        {/* 3. RIGHT: ICONS & TEXT */}
        <div className="flex-1 flex justify-end items-center gap-3 xl:gap-4">
          
          <button className="flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer">
            <Search className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
            <span className="text-[10px] xl:text-[11px] font-[400] text-[#333333] hidden xl:block whitespace-nowrap uppercase tracking-wider">Search</span>
          </button>

          <Link to="/wishlist" className="hover:opacity-60 transition-opacity hidden sm:block">
            <Heart className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
          </Link>

          <Link to="/account" className="hover:opacity-60 transition-opacity hidden sm:block">
            <User className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
          </Link>

          <Link to="/cart" className="hover:opacity-60 transition-opacity">
            <ShoppingBag className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
          </Link>

          <div className="text-[10px] xl:text-[11px] font-[400] text-[#333333] ml-1 xl:ml-2 hidden xl:block whitespace-nowrap tracking-wider">
            US | USD
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;