import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Plus, Search, LogOut, Trash2, 
  Edit, X, Menu, Image as ImageIcon, Package
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "MOTIVATIONAL & MINDSET", "AESTHETIC & VIBE", "LOVE & CONNECTION",
  "KIDS - LEARNING & CONFIDENCE", "CALM & INNER BALANCE", "FANDOM & PASSION",
  "KITCHEN & DINING", "CUSTOMIZATION"
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inventory" | "add" | "orders">("inventory");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", stock: "", image_url: "", category: CATEGORIES[0]
  });

  useEffect(() => {
    if (!token || user.role?.toUpperCase() !== "ADMIN") {
      navigate("/login");
    }
  }, [token, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "inventory") {
        const res = await API.getProducts();
        let fetchedProducts = Array.isArray(res) ? res : (res?.data?.items || res?.data || []);
        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      } else if (activeTab === "orders") {
        const res = await API.adminGetOrders();
        let fetchedOrders = Array.isArray(res) ? res : (res?.data?.items || res?.data || res?.orders || []);
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
      }
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // --- PRODUCT HANDLERS ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData, price: Number(formData.price), stock: Number(formData.stock),
        points: ["Premium Quality", "Matte Finish"], is_active: 1
      };
      const res = await API.adminCreateProduct(payload);
      if (res.success !== false) {
        toast.success("Product Published!");
        setFormData({ title: "", description: "", price: "", stock: "", image_url: "", category: CATEGORIES[0] });
        setActiveTab("inventory");
      }
    } catch (e) { toast.error("Error creating product."); } 
    finally { setIsSubmitting(false); }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const payload = { 
        product_id: Number(editingProduct.id), title: formData.title,
        price: Number(formData.price), stock: Number(formData.stock),
        category: formData.category, points: ["Premium Quality"] 
      };
      const res = await API.adminUpdateProduct(payload);
      if (res.success !== false) {
        toast.success("Updated!"); setEditingProduct(null); fetchData();
      }
    } catch (e) { toast.error("Update Failed."); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Khatam kar dein?")) return;
    try {
      const res = await API.adminDeleteProduct({ product_id: Number(id) });
      if (res.success !== false) {
        toast.success("Deleted!"); fetchData();
      }
    } catch (e) { toast.error("Delete Failed."); }
  };

  // --- ORDER HANDLERS ---
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      // 🔥 422 FIX: Hum id aur order_id dono bhej rahe hain, aur status ko exactly waisa hi bhej rahe hain.
      const payload = { 
        id: Number(orderId),         // Backend shayad id maang raha ho
        order_id: Number(orderId),   // Ya shayad order_id
        status: newStatus            // Status e.g. "Shipped"
      };

      const res = await API.adminUpdateOrderStatus(payload);
      
      if (res.success !== false) {
        toast.success("Order status updated!");
        fetchData(); 
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (e) { toast.error("Validation 422: Check network tab for exact missing field."); }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredData = activeTab === "inventory" 
    ? safeProducts.filter(p => p?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : safeOrders.filter(o => 
        o?.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o?.id?.toString().includes(searchQuery)
      );

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex font-sans text-black overflow-hidden">
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-[110] lg:hidden backdrop-blur-sm" />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-[120] w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-coolvetica text-3xl tracking-tighter uppercase leading-none">Muro</h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Admin</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-black"><X size={20} /></button>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem icon={<LayoutDashboard size={18}/>} label="Inventory" active={activeTab === 'inventory'} onClick={() => {setActiveTab('inventory'); setSidebarOpen(false);}} />
            <NavItem icon={<Plus size={18}/>} label="Add Product" active={activeTab === 'add'} onClick={() => {setActiveTab('add'); setSidebarOpen(false);}} />
            <NavItem icon={<Package size={18}/>} label="Orders" active={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setSidebarOpen(false);}} />
          </nav>
          <button onClick={() => {localStorage.clear(); window.location.href="/login"}} className="flex items-center gap-3 p-4 text-gray-400 hover:text-red-600 transition-all rounded-xl text-[11px] font-bold uppercase tracking-widest mt-auto">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-12 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu size={22} /></button>
            <div className="hidden md:flex items-center bg-gray-50 px-4 py-2.5 rounded-xl w-80 border border-gray-100">
              <Search size={16} className="text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent border-none outline-none pl-3 text-xs w-full" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs border-2 border-white">AD</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-24">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <section className="max-w-6xl mx-auto animate-in fade-in duration-500">
              <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900">Manage Orders</h1>
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Order ID</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Customer</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Amount</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={4} className="p-20 text-center animate-pulse text-xs text-gray-300 uppercase">Fetching...</td></tr>
                      ) : filteredData.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center text-sm text-gray-400 italic">No orders found.</td></tr>
                      ) : filteredData.map((order: any) => (
                        <tr key={order.id} className="group hover:bg-gray-50/30 transition-all">
                          <td className="px-8 py-6 font-bold text-sm text-blue-600">#{order.id}</td>
                          <td className="px-8 py-6">
                            {/* 🔥 N/A FIX: Ab chahe backend kisi bhi naam se data bheje, ye pakad lega */}
                            <span className="text-sm font-bold text-gray-800 block">
                              {order.shipping_name || order.name || order.customer_name || order.user?.name || "Customer"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {order.shipping_city || order.city || "City N/A"}, {order.shipping_state || order.state || ""}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-900">₹{order.total_amount || order.amount || 0}</td>
                          <td className="px-8 py-6">
                            <select 
  // Status ko lowercase mein map karo taaki backend ko pasand aaye
  value={order.status?.toLowerCase() || "pending"} 
  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
  className="bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none cursor-pointer"
>
  {/* Yahan 'value' ko lowercase kar diya hai */}
  <option value="pending">Pending</option>
  {/* <option value="processing">Processing</option>
  <option value="shipped">Shipped</option>
  <option value="delivered">Delivered</option> */}
  <option value="cancelled">Cancelled</option>
</select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* INVENTORY TAB */}
          {activeTab === "inventory" && (
            <section className="max-w-6xl mx-auto animate-in fade-in duration-500">
              <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900">Catalogue</h1>
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Art Piece</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Price</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-400">Stock</th>
                        <th className="px-8 py-5 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={4} className="p-20 text-center animate-pulse text-xs text-gray-300 uppercase">Fetching...</td></tr>
                      ) : filteredData.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center text-sm text-gray-400 italic">No products matched.</td></tr>
                      ) : filteredData.map((p: any) => (
                        <tr key={p.id} className="group hover:bg-gray-50/30 transition-all">
                          <td className="px-8 py-6 flex items-center gap-4">
                            <img src={p.image_url} className="w-12 h-14 rounded-lg object-cover shadow-sm bg-gray-100" />
                            <div>
                              <span className="text-sm font-bold uppercase text-gray-800 block">{p.title}</span>
                              <span className="text-[9px] uppercase tracking-widest text-gray-400">{p.category}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-900">₹{p.price}</td>
                          <td className="px-8 py-6"><span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${p.stock > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{p.stock} Units</span></td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => {setEditingProduct(p); setFormData({...p});}} className="p-2.5 hover:bg-black hover:text-white rounded-lg border border-transparent hover:border-black"><Edit size={14} /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 hover:bg-red-600 hover:text-white rounded-lg border border-transparent hover:border-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ADD PRODUCT TAB */}
          {activeTab === "add" && (
            <section className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900 uppercase tracking-widest">Publish Listing</h1>
              <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-gray-200 shadow-sm">
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <FormGroup label="Title" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} placeholder="Title" />
                    <div className="grid grid-cols-2 gap-6">
                      <FormGroup label="Price" type="number" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} />
                      <FormGroup label="Stock" type="number" value={formData.stock} onChange={(e)=>setFormData({...formData, stock: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Category</label>
                      <select value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-black/5 text-xs font-bold uppercase appearance-none cursor-pointer">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Description</label>
                      <textarea required value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm h-32 resize-none font-medium" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                     <div className="flex-1 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-black transition-all" onClick={()=> {const url=prompt("Paste image URL:"); if(url) setFormData({...formData, image_url: url})}}>
                        {formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon size={40} className="mx-auto text-gray-300 mb-2 group-hover:text-black" /><p className="text-[10px] font-bold text-gray-400 uppercase">Set Image</p></div>}
                     </div>
                     <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-gray-800 transition-all">Publish Listing</button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl p-10 rounded-[2.5rem] relative shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-all"><X size={20} /></button>
              <h2 className="text-xl font-serif font-bold mb-10 uppercase tracking-widest text-center text-gray-900">Update Catalogue</h2>
              <form onSubmit={handleUpdateProduct} className="space-y-6">
                 <FormGroup label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                 <div className="grid grid-cols-2 gap-6">
                    <FormGroup label="Price (₹)" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    <FormGroup label="Stock" type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Category</label>
                    <select value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-black/5 text-xs font-bold uppercase">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
                 <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 shadow-xl transition-all">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-7 py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all w-full text-left ${active ? "bg-black text-white shadow-2xl shadow-black/20 translate-x-3" : "text-gray-400 hover:text-black hover:bg-gray-50"}`}>{icon} {label}</button>
);

const FormGroup = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</label>
    <input {...props} className="w-full bg-gray-50 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-bold" />
  </div>
);

export default AdminDashboard;