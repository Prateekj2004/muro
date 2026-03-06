import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Users, 
  BarChart3, 
  Settings, 
  Search, 
  ArrowUpRight,
  LogOut,
  Trash2,
  Edit,
  X
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inventory" | "add" | "orders">("inventory");

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "WALL ART",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    points: ""
  });

  // Mock Stats (Dynamic orders/products count)
  const stats = [
    { label: "Total Revenue", value: "₹12,450.00", change: "+12%" },
    { label: "Orders", value: (orders?.length || 148).toString(), change: "+5%" },
    { label: "Active Products", value: (products?.length || 0).toString(), change: "0%" },
  ];

  // ==========================================
  // API CALLS
  // ==========================================
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await API.getProducts();
      let productsData = [];
      if (Array.isArray(response)) productsData = response;
      else if (response && Array.isArray(response.data?.items)) productsData = response.data.items;
      else if (response && Array.isArray(response.data)) productsData = response.data;
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products", error);
      setProducts([]); 
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await API.adminGetOrders();
      let ordersData = [];
      if (Array.isArray(response)) ordersData = response;
      else if (response && Array.isArray(response.data)) ordersData = response.data;
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inventory") fetchProducts();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.stock) {
      toast.error("Please fill in required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || "Premium print poster",
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        orientation: "PORTRAIT", 
        size_label: "A3",        
        image_url: formData.image_url || "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80",
        is_active: 1,
        points: ["HD print quality", "Fade resistant ink", "Perfect for gifts"]
      };

      const response = await API.adminCreateProduct(payload);
      if (response.success !== false) {
        toast.success("Product created successfully!");
        setFormData({ title: "", category: "WALL ART", description: "", price: "", stock: "", image_url: "", points: "" });
        setActiveTab("inventory"); 
      } else {
        toast.error(response.message || "Failed to create product.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const pointsArray = formData.points ? formData.points.split(',').map(p => p.trim()) : [];
      const payload = {
        id: editingProduct.id,
        title: formData.title,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        points: pointsArray.length > 0 ? pointsArray : ["Updated Feature"]
      };
      const response = await API.adminUpdateProduct(payload);
      if (response.success !== false) {
        toast.success("Product updated successfully!");
        setEditingProduct(null);
        fetchProducts(); 
      } else {
        toast.error(response.message || "Failed to update product.");
      }
    } catch (error) {
      toast.error("Error updating product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await API.adminDeleteProduct(id);
      if (response.success !== false) {
        toast.success("Product deleted!");
        setProducts((prev) => prev.filter(p => p.id !== id));
      } else {
        toast.error(response.message || "Failed to delete.");
      }
    } catch (error) {
      toast.error("Error deleting product.");
    }
  };

  const handleImageClick = () => {
    const url = prompt("Enter Image URL for the product:");
    if (url) setFormData({ ...formData, image_url: url });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F6F6F6] font-sans text-black relative">
      
      {/* --- EDIT MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto border border-[#E5E5E5]">
            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-serif mb-8 text-[#222]">Edit Product #{editingProduct.id}</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Product Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm uppercase tracking-wide" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Category</label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm bg-transparent uppercase tracking-wider">
                    <option>WALL ART</option>
                    <option>POSTERS</option>
                    <option>LIMITED EDITION</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Stock</label>
                  <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 text-[12px] uppercase tracking-[0.3em] font-medium hover:bg-[#222] transition-colors shadow-lg mt-4">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-[#EEEEEE] flex flex-col fixed h-full z-10">
        <div className="p-8">
          <h2 className="font-coolvetica text-2xl tracking-tighter uppercase">Muro Admin</h2>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] mt-1">MANAGEMENT PANEL</p>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem icon={<Plus size={18}/>} label="Add Product" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
          <NavItem icon={<Package size={18}/>} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <NavItem icon={<Users size={18}/>} label="Customers" />
          <NavItem icon={<BarChart3 size={18}/>} label="Analytics" />
          <NavItem icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <div className="p-8 border-t border-[#EEEEEE]">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-black transition-colors text-[12px] uppercase tracking-widest font-medium">
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
              {activeTab === 'inventory' ? 'Inventory Overview' : activeTab === 'add' ? 'Create New Listing' : 'Orders Management'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Admin.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-none text-sm outline-none focus:border-black transition-all w-64" />
            </div>
          </div>
        </div>

        {/* --- INVENTORY TAB --- */}
        {activeTab === "inventory" && (
          <>
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

            <div className="bg-white border border-[#E5E5E5] shadow-sm">
              <div className="p-6 border-b border-[#F0F0F0] flex justify-between items-center">
                <h4 className="font-medium uppercase text-xs tracking-widest">Recent Products</h4>
                <button onClick={fetchProducts} className="text-[11px] underline underline-offset-4 hover:text-gray-500">Export CSV</button>
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
                  {loadingProducts ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading products...</td></tr>
                  ) : products?.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">No products found. Add one!</td></tr>
                  ) : (
                    products?.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-5 text-sm font-medium">{p.title}</td>
                        <td className="px-6 py-5 text-xs text-gray-500 uppercase tracking-wider">{p.category}</td>
                        <td className="px-6 py-5 text-sm">₹{p.price}</td>
                        <td className="px-6 py-5">
                          <span className={`text-[10px] px-2 py-1 uppercase tracking-tighter font-bold ${Number(p.stock) > 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {Number(p.stock) > 0 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex justify-end gap-4">
                            <button onClick={() => {
                              setEditingProduct(p);
                              setFormData({
                                title: p.title, category: p.category || "WALL ART", description: p.description || "", price: p.price, stock: p.stock, image_url: p.image_url || "", points: ""
                              });
                            }} className="text-gray-400 hover:text-black"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* --- ADD PRODUCT TAB --- */}
        {activeTab === "add" && (
          <div className="max-w-3xl mx-auto bg-white border border-[#E5E5E5] p-12 shadow-sm">
             <form onSubmit={handleAddProduct} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Product Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm uppercase tracking-wide" placeholder="E.G. MONOCHROME ART" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm bg-transparent uppercase">
                      <option>WALL ART</option>
                      <option>POSTERS</option>
                      <option>LIMITED EDITION</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-all text-sm" placeholder="Describe the art piece..." />
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Price (₹)</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Inventory</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-all text-sm" placeholder="10" />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <button type="button" onClick={handleImageClick} className={`w-full border border-black py-3 text-[10px] uppercase tracking-[0.2em] transition-all ${formData.image_url ? 'bg-green-50 border-green-500 text-green-700' : 'hover:bg-black hover:text-white'}`}>
                      {formData.image_url ? "Image Added ✓" : "Upload Image"}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 text-[12px] uppercase tracking-[0.3em] font-medium hover:bg-[#222] transition-colors shadow-lg">
                  {isSubmitting ? "Publishing..." : "Publish to Store"}
                </button>
             </form>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === "orders" && (
           <div className="bg-white border border-[#E5E5E5] shadow-sm">
             <div className="p-6 border-b border-[#F0F0F0] flex justify-between items-center">
               <h4 className="font-medium uppercase text-xs tracking-widest">Recent Orders</h4>
               <button onClick={fetchOrders} className="text-[11px] underline underline-offset-4 hover:text-gray-500">Refresh</button>
             </div>
             <table className="w-full">
               <thead>
                 <tr className="text-left bg-[#FAFAFA]">
                   <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Order ID</th>
                   <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Customer</th>
                   <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Amount</th>
                   <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#F0F0F0]">
                 {loadingOrders ? (
                   <tr><td colSpan={4} className="text-center py-10 text-gray-500">Loading orders...</td></tr>
                 ) : orders?.length === 0 ? (
                   <tr><td colSpan={4} className="text-center py-10 text-gray-500">No orders found.</td></tr>
                 ) : (
                   orders?.map((order) => (
                     <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                       <td className="px-6 py-5 text-sm font-medium">#{order.id}</td>
                       <td className="px-6 py-5 text-xs text-gray-500 uppercase tracking-wider">{order.shipping_name || "Customer"}</td>
                       <td className="px-6 py-5 text-sm">₹{order.total_amount || "0"}</td>
                       <td className="px-6 py-5">
                         <span className={`text-[10px] px-2 py-1 uppercase tracking-tighter font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                           {order.status || 'Pending'}
                         </span>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
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
    className={`flex items-center gap-4 px-4 py-3 text-[12px] uppercase tracking-[0.15em] font-medium transition-all w-full text-left ${
      active ? "bg-black text-white shadow-md" : "text-gray-400 hover:text-black hover:bg-gray-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AdminDashboard;