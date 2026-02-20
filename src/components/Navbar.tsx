import { ShoppingBag, Search, User, ChevronDown } from "lucide-react";
// Yahan apne NavLink component ka sahi path daal lena
import { NavLink } from "@/components/NavLink"; 

const Navbar = () => {
  const shopCategories = [
    { name: "Motivational & Mindset", path: "/shop/motivational" },
    { name: "Aesthetic & Vibe", path: "/shop/aesthetic" },
    { name: "Love & Connection", path: "/shop/love" },
    { name: "Kids – Learning & Confidence", path: "/shop/kids" },
    { name: "Calm & Inner Balance", path: "/shop/calm" },
    { name: "Fandom & Passion", path: "/shop/fandom" },
    { name: "Kitchen & Dining", path: "/shop/kitchen" },
    { name: "Customization", path: "/customisation" }
  ];

  return (
    <header className="w-full bg-white border-b border-[#E5E5E5] h-[64px] font-sans z-50 relative">
      <div className="w-full h-full px-5 md:px-8 xl:px-12 flex items-center justify-between">
        
        {/* 1. LEFT: LOGO */}
        <div className="flex-1 flex justify-start items-center">
          <NavLink 
            to="/" 
            className="text-[24px] xl:text-[28px] font-serif font-bold tracking-[-0.02em] text-[#000000] lowercase whitespace-nowrap"
          >
            muro poster
          </NavLink>
        </div>

        {/* 2. CENTER: LINKS & DROPDOWN */}
        <nav className="flex-none hidden lg:flex justify-center items-center gap-4 xl:gap-6 relative -left-4 xl:-left-8 h-full">
          <NavLink 
            to="/" 
            className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
          >
            Home
          </NavLink>

          {/* SHOP DROPDOWN */}
          <div className="relative group h-full flex items-center cursor-pointer">
            <NavLink 
              to="/shop" 
              className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity flex items-center gap-1"
              activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
            >
              Shop <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300 ease-in-out" strokeWidth={2}/>
            </NavLink>
            
            {/* Dropdown Menu Box */}
            <div className="absolute top-[64px] left-1/2 -translate-x-1/2 w-[300px] bg-white border border-[#E5E5E5] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out flex flex-col py-3 z-50">
              {shopCategories.map((cat) => (
                <NavLink 
                  key={cat.name} 
                  to={cat.path}
                  className="px-6 py-3 text-[11px] xl:text-[12px] font-[500] text-[#000000] uppercase tracking-[0.08em] hover:bg-[#f9f9f9] hover:text-gray-500 transition-colors text-left"
                  activeClassName="bg-[#f9f9f9] text-gray-500"
                >
                  {cat.name}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink 
            to="/bestsellers" 
            className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
          >
            Bestsellers
          </NavLink>

          <NavLink 
            to="/new-arrivals" 
            className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
          >
            New Arrivals
          </NavLink>

          <NavLink 
            to="/customisation" 
            className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
          >
            Customisation
          </NavLink>

          <NavLink 
            to="/about" 
            className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
          >
            About MURO
          </NavLink>

          <NavLink 
            to="/contact" 
            className="text-[13px] font-[500] text-[#000000] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity"
            activeClassName="opacity-60 underline underline-offset-[6px] decoration-[1.5px]"
          >
            Contact
          </NavLink>
        </nav>

        {/* 3. RIGHT: ICONS ONLY (Search, Account, Cart) */}
        <div className="flex-1 flex justify-end items-center gap-4 xl:gap-5">
          
          <button className="flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer">
            <Search className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
            <span className="text-[10px] xl:text-[11px] font-[400] text-[#333333] hidden xl:block whitespace-nowrap uppercase tracking-wider">Search</span>
          </button>

          <NavLink 
            to="/account" 
            className="hover:opacity-60 transition-opacity hidden sm:block"
            activeClassName="opacity-60"
          >
            <User className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
          </NavLink>

          <NavLink 
            to="/cart" 
            className="hover:opacity-60 transition-opacity"
            activeClassName="opacity-60"
          >
            <ShoppingBag className="w-[16px] h-[16px] xl:w-[18px] xl:h-[18px] text-[#000000]" strokeWidth={1.2} />
          </NavLink>

        </div>
      </div>
    </header>
  );
};

export default Navbar;