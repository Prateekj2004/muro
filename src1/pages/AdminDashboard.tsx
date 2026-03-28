import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Plus, Search, Trash2, Edit, X, Menu, Package, PlusCircle, MinusCircle, Tags, Filter
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";

const getFullImageUrl = (path: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http")) return path;
  let cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (!cleanPath.includes("uploads/product")) cleanPath = `uploads/product/${cleanPath}`;
  return `https://muroposter.com/${cleanPath}`;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inventory" | "add" | "orders" | "attributes">("inventory");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  const [filters, setFilters] = useState({ 
    page: 1, 
    limit: 10, 
    search: "", 
    category: "", 
    subcategory: "",
    visibility: "PUBLISH",
    is_active: 1,
    min_price: "",
    max_price: "",
    author_name: "",
    sort: "latest" 
  });

  const initialFormState = {
    title: "", short_description: "", full_description: "", 
    category: "", subcategory: "", tags: "",
    seo_title: "", seo_description: "", author_name: "", author_bio: "",
    size_prices: [{ size_id: "", price: "", sku: "" }] // Removed stock from UI state
  };
  const [formData, setFormData] = useState(initialFormState);
  
  const [fileData, setFileData] = useState({
    main_poster: null as File | null,
    zoom_in_file: null as File | null,
    wall_poster_file: null as File | null
  });

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubcat, setEditingSubcat] = useState<any | null>(null);
  const [editingSize, setEditingSize] = useState<any | null>(null);
  
  const [newCatName, setNewCatName] = useState("");
  const [newSubcatName, setNewSubcatName] = useState("");
  const [selectedCatIdForSub, setSelectedCatIdForSub] = useState("");
  const [newSize, setNewSize] = useState({ name: "", code: "", width: "", height: "", unit: "inch" });

  useEffect(() => {
    if (!token || user.role?.toUpperCase() !== "ADMIN") navigate("/login");
  }, [token, user, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === "inventory") {
        const res = await API.adminGetProducts(filters).catch(() => []);
        setProducts(Array.isArray(res) ? res : (res?.data?.items || res?.data || []));
      }
      const catRes = await API.adminGetCategories().catch(() => []);
      setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []));
      
      const subcatRes = await API.adminGetSubcategories().catch(() => []);
      setSubcategories(Array.isArray(subcatRes) ? subcatRes : (subcatRes?.data || []));
      
      const sizeRes = await API.adminGetSizes().catch(() => []);
      setSizes(Array.isArray(sizeRes) ? sizeRes : (sizeRes?.data || []));
    } catch (error) { console.error("Fetch Error", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, [activeTab, filters.page]);

  const handleSizePriceChange = (index: number, field: string, value: string) => {
    const newSizePrices = [...formData.size_prices];
    newSizePrices[index] = { ...newSizePrices[index], [field]: value };
    setFormData({ ...formData, size_prices: newSizePrices });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData({ ...fileData, [key]: e.target.files[0] });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Find the lowest price among variants
      const validPrices = formData.size_prices
        .map(sp => Number(sp.price))
        .filter(p => !isNaN(p) && p > 0);
      const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => { 
        if (key !== 'size_prices') formDataToSend.append(key, value as string); 
      });
      
      // 2. Append default values for removed fields and calculated base price
      formDataToSend.append("price", lowestPrice.toString());
      formDataToSend.append("stock", "100"); // Default base stock
      formDataToSend.append("resolution", "300 DPI"); // Default resolution
      formDataToSend.append("color_mode", "RGB"); // Default color mode
      formDataToSend.append("visibility", "PUBLISH"); 
      formDataToSend.append("is_active", "1");

      if (fileData.main_poster) formDataToSend.append("main_poster", fileData.main_poster);
      if (fileData.zoom_in_file) formDataToSend.append("zoom_in_file", fileData.zoom_in_file);
      if (fileData.wall_poster_file) formDataToSend.append("wall_poster_file", fileData.wall_poster_file);

      const formattedSizes: any[] = [];
      formData.size_prices.forEach(sp => {
        if (sp.size_id) {
          formattedSizes.push({ 
            size_id: Number(sp.size_id), 
            price: Number(sp.price), 
            stock: 100, // Default variant stock
            sku: sp.sku 
          });
        }
      });
      formDataToSend.append("size_prices", JSON.stringify(formattedSizes));

      const res = await API.adminCreateProduct(formDataToSend);
      if (res.success !== false) { 
        toast.success("Product Published Successfully!"); 
        setFormData(initialFormState); 
        setFileData({ main_poster: null, zoom_in_file: null, wall_poster_file : null });
        setActiveTab("inventory"); 
      } else toast.error(res.message || "Failed.");
    } catch (e) { toast.error("Error creating product. Check network tab."); } 
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    const fd = new FormData(); fd.append("product_id", id.toString());
    await API.adminDeleteProduct(fd as any).then(() => { toast.success("Deleted!"); fetchAllData(); });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { name: newCatName, is_active: 1 };
    if (editingCategory) {
      payload.category_id = editingCategory.id || editingCategory.category_id;
      await API.adminUpdateCategory(payload).then(()=>{ toast.success("Updated"); setEditingCategory(null); setNewCatName(""); fetchAllData(); });
    } else {
      await API.adminCreateCategory(payload).then(()=>{ toast.success("Added"); setNewCatName(""); fetchAllData(); });
    }
  };
  const handleDeleteCategory = async (id: number) => {
    if(!window.confirm("Delete?")) return;
    await API.adminDeleteCategory({ category_id: id }).then(() => { toast.success("Deleted"); fetchAllData(); });
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedCatIdForSub) return toast.error("Select Parent Category");
    const payload: any = { name: newSubcatName, category_id: Number(selectedCatIdForSub), is_active: 1 };
    if (editingSubcat) {
      payload.subcategory_id = editingSubcat.id || editingSubcat.subcategory_id;
      await API.adminUpdateSubcategory(payload).then(()=>{ toast.success("Updated"); setEditingSubcat(null); setNewSubcatName(""); fetchAllData(); });
    } else {
      await API.adminCreateSubcategory(payload).then(()=>{ toast.success("Added"); setNewSubcatName(""); fetchAllData(); });
    }
  };
  const handleDeleteSubcategory = async (id: number) => {
    if(!window.confirm("Delete?")) return;
    await API.adminDeleteSubcategory({ subcategory_id: id }).then(() => { toast.success("Deleted"); fetchAllData(); });
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...newSize, is_active: 1 };
    if (editingSize) {
      payload.size_id = editingSize.id || editingSize.size_id;
      await API.adminUpdateSize(payload).then(()=>{ toast.success("Updated"); setEditingSize(null); setNewSize({name:"",code:"",width:"",height:"",unit:"inch"}); fetchAllData(); });
    } else {
      await API.adminCreateSize(payload).then(()=>{ toast.success("Added"); setNewSize({name:"",code:"",width:"",height:"",unit:"inch"}); fetchAllData(); });
    }
  };
  const handleDeleteSize = async (id: number) => {
    if(!window.confirm("Delete?")) return;
    await API.adminDeleteSize({ size_id: id }).then(() => { toast.success("Deleted"); fetchAllData(); });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex font-sans text-black overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[120] w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-coolvetica text-3xl tracking-tighter uppercase leading-none text-gray-900">Muro</h2>
              <p className="text-[10px] text-gray-500 font-extrabold uppercase mt-1 tracking-widest">Admin</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-black"><X size={20} /></button>
          </div>
          <nav className="flex-1 space-y-2">
            <button onClick={() => setActiveTab('inventory')} className={`flex w-full items-center gap-4 px-7 py-5 rounded-2xl text-xs font-extrabold uppercase ${activeTab==='inventory' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><LayoutDashboard size={18}/> Inventory</button>
            <button onClick={() => setActiveTab('add')} className={`flex w-full items-center gap-4 px-7 py-5 rounded-2xl text-xs font-extrabold uppercase ${activeTab==='add' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><Plus size={18}/> Add Product</button>
            <button onClick={() => setActiveTab('attributes')} className={`flex w-full items-center gap-4 px-7 py-5 rounded-2xl text-xs font-extrabold uppercase ${activeTab==='attributes' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><Tags size={18}/> Attributes</button>
            <button onClick={() => setActiveTab('orders')} className={`flex w-full items-center gap-4 px-7 py-5 rounded-2xl text-xs font-extrabold uppercase ${activeTab==='orders' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><Package size={18}/> Orders</button>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-12 shrink-0">
          <div className="flex items-center gap-4">
             <Menu size={22} className="lg:hidden cursor-pointer text-gray-800" onClick={() => setSidebarOpen(true)}/>
             <h2 className="hidden md:block text-lg font-extrabold text-gray-800 uppercase tracking-widest">Dashboard</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-24">
          
          {/* ======================= */}
          {/* INVENTORY TAB & FILTERS */}
          {/* ======================= */}
          {activeTab === "inventory" && (
             <section className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
               <div className="mb-6 flex justify-between items-center">
                 <h1 className="text-3xl font-serif font-bold text-gray-900">Catalogue</h1>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
                 <div className="flex items-center gap-2 mb-4">
                    <Filter size={16} className="text-gray-800"/>
                    <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">Filters</h3>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   <input type="text" placeholder="Search Keyword" value={filters.search} onChange={(e)=>setFilters({...filters, search: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
                   
                   <select value={filters.category} onChange={(e)=>setFilters({...filters, category: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
                     <option value="">All Categories</option>
                     {categories.map(c => <option key={c.id || c.category_id} value={c.name}>{c.name}</option>)}
                   </select>

                   <select value={filters.subcategory} onChange={(e)=>setFilters({...filters, subcategory: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
                     <option value="">All Subcategories</option>
                     {subcategories.map(s => <option key={s.id || s.subcategory_id} value={s.name}>{s.name}</option>)}
                   </select>

                   <input type="number" placeholder="Min Price (₹)" value={filters.min_price} onChange={(e)=>setFilters({...filters, min_price: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
                   <input type="number" placeholder="Max Price (₹)" value={filters.max_price} onChange={(e)=>setFilters({...filters, max_price: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
                   
                   <input type="text" placeholder="Author Name" value={filters.author_name} onChange={(e)=>setFilters({...filters, author_name: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />

                   <select value={filters.sort} onChange={(e)=>setFilters({...filters, sort: e.target.value})} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
                     <option value="latest">Latest First</option>
                     <option value="price_asc">Price: Low to High</option>
                     <option value="price_desc">Price: High to Low</option>
                   </select>

                   <button onClick={fetchAllData} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 transition-all md:col-span-2 lg:col-span-1">
                     Apply Filters
                   </button>
                 </div>
               </div>

               <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                     <thead className="bg-gray-100 border-b border-gray-200">
                       <tr>
                         <th className="px-8 py-5 text-xs uppercase font-extrabold text-gray-800">Title & Category</th>
                         <th className="px-8 py-5 text-xs uppercase font-extrabold text-gray-800">Author</th>
                         <th className="px-8 py-5 text-xs uppercase font-extrabold text-gray-800">Base Price</th>
                         <th className="px-8 py-5 text-right"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {loading ? <tr><td colSpan={4} className="p-20 text-center animate-pulse text-sm font-bold text-gray-500">Fetching Data...</td></tr>
                       : products.length === 0 ? <tr><td colSpan={4} className="p-20 text-center text-sm font-bold text-gray-500">No products found matching filters.</td></tr>
                       : products.map((p: any) => (
                         <tr key={p.id} className="group hover:bg-gray-50 transition-all">
                           <td className="px-8 py-6">
                             <span className="text-sm font-extrabold text-gray-900 block mb-1">{p.title}</span>
                             <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">{p.category} {p.subcategory ? `> ${p.subcategory}` : ''}</span>
                           </td>
                           <td className="px-8 py-6 text-xs font-bold text-gray-600 uppercase">{p.author_name || "N/A"}</td>
                           <td className="px-8 py-6 text-sm font-extrabold text-gray-900">₹{p.price}</td>
                           <td className="px-8 py-6 text-right"><button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button></td>
                         </tr>
                       ))}
                     </tbody>
                 </table>
                 
                 <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
                   <span className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">Page {filters.page}</span>
                   <div className="flex gap-3">
                     <button disabled={filters.page === 1} onClick={() => setFilters({...filters, page: filters.page - 1})} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 hover:bg-gray-100 disabled:opacity-50 uppercase tracking-widest">Prev</button>
                     <button onClick={() => setFilters({...filters, page: filters.page + 1})} className="px-5 py-2.5 bg-black rounded-xl text-xs font-extrabold text-white hover:bg-gray-800 uppercase tracking-widest">Next</button>
                   </div>
                 </div>
               </div>
             </section>
          )}

          {/* ======================= */}
          {/* ADD PRODUCT */}
          {/* ======================= */}
          {activeTab === "add" && (
             <section className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
               <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900 uppercase tracking-widest">Publish Listing</h1>
               <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-gray-200 shadow-sm">
                 <form onSubmit={handleAddProduct} className="space-y-12">
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 mb-5 text-gray-900">Basic Details</h3>
                      <FormGroup label="Title" required value={formData.title} onChange={(e:any)=>setFormData({...formData, title: e.target.value})} placeholder="Growth Mindset Poster" />
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Category <span className="text-red-500">*</span></label>
                          <select required value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900 cursor-pointer">
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat.id || cat.category_id} value={cat.name}>{cat.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Subcat</label>
                          <select value={formData.subcategory} onChange={(e)=>setFormData({...formData, subcategory: e.target.value})} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900 cursor-pointer">
                            <option value="">Select Subcategory</option>
                            {subcategories.map(sub => <option key={sub.id || sub.subcategory_id} value={sub.name}>{sub.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <FormGroup label="Tags" value={formData.tags} onChange={(e:any)=>setFormData({...formData, tags: e.target.value})} placeholder="motivation, success" />
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 mb-5 text-gray-900">Media Uploads</h3>
                       <div className="space-y-2">
                         <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Main Poster Image <span className="text-red-500">*</span></label>
                         <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "main_poster")} className="w-full bg-white border border-gray-300 p-3.5 rounded-2xl text-xs font-semibold text-gray-900 cursor-pointer" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Zoom-In Image</label>
                         <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "zoom_in_file")} className="w-full bg-white border border-gray-300 p-3.5 rounded-2xl text-xs font-semibold text-gray-900 cursor-pointer" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Wall Poster (Room View)</label>
                         <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "wall_poster_file")} className="w-full bg-white border border-gray-300 p-3.5 rounded-2xl text-xs font-semibold text-gray-900 cursor-pointer" />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-200 pt-8">
                    <div className="space-y-6">
                      <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 mb-5 text-gray-900">Descriptions</h3>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Short Description</label>
                        <textarea required value={formData.short_description} onChange={(e)=>setFormData({...formData, short_description: e.target.value})} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm h-24 resize-none font-semibold text-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Full Description</label>
                        <textarea required value={formData.full_description} onChange={(e)=>setFormData({...formData, full_description: e.target.value})} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm h-36 resize-none font-semibold text-gray-900" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 mb-5 text-gray-900">SEO & Author</h3>
                      <FormGroup label="SEO Title" value={formData.seo_title} onChange={(e:any)=>setFormData({...formData, seo_title: e.target.value})} />
                      <FormGroup label="SEO Description" value={formData.seo_description} onChange={(e:any)=>setFormData({...formData, seo_description: e.target.value})} />
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <FormGroup label="Author Name" value={formData.author_name} onChange={(e:any)=>setFormData({...formData, author_name: e.target.value})} />
                        <FormGroup label="Author Bio" value={formData.author_bio} onChange={(e:any)=>setFormData({...formData, author_bio: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 flex-1 text-gray-900">Size Variants & Pricing</h3>
                        <button type="button" onClick={() => setFormData({...formData, size_prices: [...formData.size_prices, { size_id: "", price: "", sku: "" }]})} className="flex items-center gap-2 text-xs uppercase font-extrabold text-blue-700 bg-blue-50 px-5 py-3 rounded-full hover:bg-blue-100"><PlusCircle size={16} /> Add Variant</button>
                     </div>
                     <div className="space-y-4">
                        {formData.size_prices.map((variant, index) => (
                           <div key={index} className="flex flex-wrap items-end gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                              <div className="flex-1 min-w-[150px] space-y-2">
                                <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Size <span className="text-red-500">*</span></label>
                                <select required value={variant.size_id} onChange={(e)=>handleSizePriceChange(index, "size_id", e.target.value)} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900 cursor-pointer">
                                  <option value="">Select Size</option>
                                  {sizes.map(sz => <option key={sz.id || sz.size_id} value={sz.id || sz.size_id}>{sz.name} ({sz.code})</option>)}
                                </select>
                              </div>
                              <div className="flex-1 min-w-[150px]"><FormGroup label="SKU" required value={variant.sku} onChange={(e:any)=>handleSizePriceChange(index, "sku", e.target.value)} /></div>
                              <div className="flex-1 min-w-[150px]"><FormGroup label="Price" type="number" required value={variant.price} onChange={(e:any)=>handleSizePriceChange(index, "price", e.target.value)} /></div>
                              <div className="pb-1"><button type="button" onClick={() => setFormData({...formData, size_prices: formData.size_prices.filter((_, i) => i !== index)})} disabled={formData.size_prices.length === 1} className="p-4 text-red-500 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200 rounded-2xl disabled:opacity-50"><MinusCircle size={20} /></button></div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="pt-8"><button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-6 rounded-2xl text-xs font-extrabold uppercase tracking-[0.3em] shadow-xl hover:bg-gray-800 transition-all">{isSubmitting ? "Publishing..." : "Publish Final Listing"}</button></div>
                 </form>
               </div>
             </section>
          )}

          {/* ATTRIBUTES */}
          {activeTab === "attributes" && (
            <section className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
              <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-gray-900 mb-8">Manage Attributes</h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cat */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                  <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-4 mb-4 shrink-0 text-gray-900">Categories</h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 no-scrollbar">
                    {categories.map(c => (
                      <div key={c.id || c.category_id} className="group bg-gray-50 hover:bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 hover:border-black transition-all">
                        <div><span className="text-sm font-extrabold uppercase text-gray-900 block">{c.name}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {c.id || c.category_id}</span></div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditingCategory(c); setNewCatName(c.name); }} className="p-2 bg-gray-200 hover:bg-black hover:text-white rounded-md"><Edit size={14}/></button><button onClick={() => handleDeleteCategory(c.id || c.category_id)} className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-md"><Trash2 size={14}/></button></div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSaveCategory} className="flex flex-col gap-3 mt-auto shrink-0 border-t border-gray-200 pt-6">
                    <input required value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} placeholder={editingCategory ? "Update Name" : "New Category"} className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" />
                    <div className="flex gap-2"><button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold">{editingCategory ? "Update" : "Add"}</button>{editingCategory && <button type="button" onClick={() => { setEditingCategory(null); setNewCatName(""); }} className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest">Cancel</button>}</div>
                  </form>
                </div>
                {/* Subcat */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                  <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-4 mb-4 shrink-0 text-gray-900">Subcategories</h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 no-scrollbar">
                    {subcategories.map(s => (
                      <div key={s.id || s.subcategory_id} className="group bg-gray-50 hover:bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 hover:border-black transition-all">
                        <div><span className="text-sm font-extrabold uppercase text-gray-900 block">{s.name}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cat ID: {s.category_id} | Sub ID: {s.id || s.subcategory_id}</span></div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditingSubcat(s); setNewSubcatName(s.name); setSelectedCatIdForSub(s.category_id); }} className="p-2 bg-gray-200 hover:bg-black hover:text-white rounded-md"><Edit size={14}/></button><button onClick={() => handleDeleteSubcategory(s.id || s.subcategory_id)} className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-md"><Trash2 size={14}/></button></div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSaveSubcategory} className="space-y-3 mt-auto shrink-0 border-t border-gray-200 pt-6">
                    <select required value={selectedCatIdForSub} onChange={(e)=>setSelectedCatIdForSub(e.target.value)} className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold cursor-pointer outline-none text-gray-900"><option value="">Select Parent Category</option>{categories.map(c => <option key={c.id || c.category_id} value={c.id || c.category_id}>{c.name}</option>)}</select>
                    <input required value={newSubcatName} onChange={(e)=>setNewSubcatName(e.target.value)} placeholder={editingSubcat ? "Update Subcat" : "New Subcategory"} className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" />
                    <div className="flex gap-2"><button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold">{editingSubcat ? "Update" : "Add"}</button>{editingSubcat && <button type="button" onClick={() => { setEditingSubcat(null); setNewSubcatName(""); setSelectedCatIdForSub(""); }} className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest">Cancel</button>}</div>
                  </form>
                </div>
                {/* Size */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                  <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-4 mb-4 shrink-0 text-gray-900">Sizes</h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 no-scrollbar">
                    {sizes.map(sz => (
                      <div key={sz.id || sz.size_id} className="group bg-gray-50 hover:bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 hover:border-black transition-all">
                        <div><span className="text-sm font-extrabold uppercase text-gray-900 block">{sz.name} <span className="text-gray-500">({sz.code})</span></span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sz.width}x{sz.height} {sz.unit} | ID: {sz.id || sz.size_id}</span></div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditingSize(sz); setNewSize({name: sz.name, code: sz.code, width: sz.width, height: sz.height, unit: sz.unit}); }} className="p-2 bg-gray-200 hover:bg-black hover:text-white rounded-md"><Edit size={14}/></button><button onClick={() => handleDeleteSize(sz.id || sz.size_id)} className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-md"><Trash2 size={14}/></button></div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSaveSize} className="space-y-3 mt-auto shrink-0 border-t border-gray-200 pt-6">
                    <input required value={newSize.name} onChange={(e)=>setNewSize({...newSize, name: e.target.value})} placeholder="Name (e.g. A4 Poster)" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" />
                    <div className="grid grid-cols-2 gap-3"><input required value={newSize.code} onChange={(e)=>setNewSize({...newSize, code: e.target.value})} placeholder="Code (A4)" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><input required value={newSize.unit} onChange={(e)=>setNewSize({...newSize, unit: e.target.value})} placeholder="Unit (inch)" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /></div>
                    <div className="grid grid-cols-2 gap-3"><input required type="number" step="0.01" value={newSize.width} onChange={(e)=>setNewSize({...newSize, width: e.target.value})} placeholder="Width" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><input required type="number" step="0.01" value={newSize.height} onChange={(e)=>setNewSize({...newSize, height: e.target.value})} placeholder="Height" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /></div>
                    <div className="flex gap-2 mt-2"><button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold">{editingSize ? "Update" : "Add"}</button>{editingSize && <button type="button" onClick={() => { setEditingSize(null); setNewSize({name:"",code:"",width:"",height:"",unit:"inch"}); }} className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest">Cancel</button>}</div>
                  </form>
                </div>
              </div>
            </section>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
             <section className="max-w-6xl mx-auto animate-in fade-in duration-500">
               <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900">Manage Orders</h1>
               <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-20 text-center">
                 <p className="text-gray-500 font-extrabold text-sm uppercase tracking-widest">Orders Module Active</p>
               </div>
             </section>
          )}
        </main>
      </div>
    </div>
  );
};

const FormGroup = ({ label, required = false, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest flex items-center gap-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input required={required} {...props} className="w-full bg-white border border-gray-300 shadow-sm p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900" />
  </div>
);

export default AdminDashboard;