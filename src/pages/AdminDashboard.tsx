import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Users, 
  BarChart3, 
  Settings, 
  Search, 
  MoreVertical,
  ArrowUpRight,
  LogOut
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "add">("inventory");

  // Mock Stats
  const stats = [
    { label: "Total Revenue", value: "$12,450.00", change: "+12%" },
    { label: "Orders", value: "148", change: "+5%" },
    { label: "Active Products", value: "32", change: "0%" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F6F6F6] font-sans text-black">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-[#EEEEEE] flex flex-col fixed h-full">
        <div className="p-8">
          <h2 className="font-coolvetica text-2xl tracking-tighter uppercase">Muro Admin</h2>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] mt-1">MANAGEMENT PANEL</p>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <NavItem 
            icon={<LayoutDashboard size={18}/>} 
            label="Overview" 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
          />
          <NavItem 
            icon={<Plus size={18}/>} 
            label="Add Product" 
            active={activeTab === 'add'} 
            onClick={() => setActiveTab('add')} 
          />
          <NavItem icon={<Package size={18}/>} label="Orders" />
          <NavItem icon={<Users size={18}/>} label="Customers" />
          <NavItem icon={<BarChart3 size={18}/>} label="Analytics" />
        </nav>

        <div className="p-8 border-t border-[#EEEEEE]">
          <button className="flex items-center gap-3 text-gray-400 hover:text-black transition-colors text-[12px] uppercase tracking-widest font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">
              {activeTab === 'inventory' ? 'Inventory Overview' : 'Create New Listing'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Admin.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-none text-sm outline-none focus:border-black transition-all w-64"
              />
            </div>
          </div>
        </div>

        {activeTab === "inventory" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 border border-[#E5E5E5] shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-semibold">{stat.value}</h3>
                    <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                      {stat.change} <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Container */}
            <div className="bg-white border border-[#E5E5E5] shadow-sm">
              <div className="p-6 border-b border-[#F0F0F0] flex justify-between items-center">
                <h4 className="font-medium uppercase text-xs tracking-widest">Recent Products</h4>
                <button className="text-[11px] underline underline-offset-4 hover:text-gray-500">Export CSV</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-[#FAFAFA]">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Product</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Category</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Price</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  <ProductRow name="Abstract Flow #1" category="Wall Art" price="$59.00" status="In Stock" />
                  <ProductRow name="Minimalist Tokyo" category="Posters" price="$29.00" status="Low Stock" />
                  <ProductRow name="Bauhaus Edition" category="Canvas" price="$89.00" status="In Stock" />
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Add Product Form */
          <div className="max-w-3xl mx-auto bg-white border border-[#E5E5E5] p-12 shadow-sm">
             <form className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Product Title</label>
                    <input type="text" className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm uppercase tracking-wide" placeholder="E.G. MONOCHROME ART" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Category</label>
                    <select className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm bg-transparent">
                      <option>WALL ART</option>
                      <option>POSTERS</option>
                      <option>LIMITED EDITION</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Description</label>
                  <textarea rows={3} className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-all text-sm" placeholder="Describe the art piece..." />
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Price ($)</label>
                    <input type="number" className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Inventory</label>
                    <input type="number" className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm" placeholder="10" />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <button type="button" className="w-full border border-black py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">Upload Image</button>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-5 text-[12px] uppercase tracking-[0.3em] font-medium hover:bg-[#222] transition-colors shadow-lg">
                  Publish to Store
                </button>
             </form>
          </div>
        )}
      </main>
    </div>
  );
};

// Reusable Nav Item Component
const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 text-[12px] uppercase tracking-[0.15em] font-medium transition-all ${
      active ? "bg-black text-white shadow-md" : "text-gray-400 hover:text-black hover:bg-gray-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

// Reusable Table Row Component
const ProductRow = ({ name, category, price, status }: any) => (
  <tr className="hover:bg-gray-50 transition-colors group">
    <td className="px-6 py-5 text-sm font-medium">{name}</td>
    <td className="px-6 py-5 text-xs text-gray-500 uppercase tracking-wider">{category}</td>
    <td className="px-6 py-5 text-sm">{price}</td>
    <td className="px-6 py-5">
      <span className={`text-[10px] px-2 py-1 uppercase tracking-tighter font-bold ${status === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
        {status}
      </span>
    </td>
    <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="text-gray-400 hover:text-black"><MoreVertical size={16} /></button>
    </td>
  </tr>
);

export default AdminDashboard;