import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Edit,
  Eye,
  Filter,
  LayoutDashboard,
  Menu,
  MinusCircle,
  Package,
  Plus,
  PlusCircle,
  RefreshCw,
  Tags,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";

type AdminTab = "inventory" | "add" | "orders" | "attributes";

type SizePriceRow = {
  size_id: string;
  price: string;
  sku: string;
};

type ProductFormState = {
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  subcategory: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  author_name: string;
  author_bio: string;
  size_prices: SizePriceRow[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http")) return path;

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (!cleanPath.includes("uploads/product")) {
    cleanPath = `uploads/product/${cleanPath}`;
  }

  return `https://muroposter.com/${cleanPath}`;
};

const formatPrice = (value: any) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatDate = (value: any) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status: string) => {
  const s = String(status || "").toUpperCase();

  if (["PAID", "PLACED", "DELIVERED", "COMPLETED"].includes(s)) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (["PENDING", "PROCESSING", "SHIPPED"].includes(s)) {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (["FAILED", "CANCELLED", "CANCELED"].includes(s)) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-gray-50 text-gray-600 border-gray-200";
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("inventory");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

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
    sort: "latest",
  });

  const [orderFilters, setOrderFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    payment_status: "",
    order_status: "",
  });

  const initialFormState: ProductFormState = {
    title: "",
    short_description: "",
    full_description: "",
    category: "",
    subcategory: "",
    tags: "",
    seo_title: "",
    seo_description: "",
    author_name: "",
    author_bio: "",
    size_prices: [{ size_id: "", price: "", sku: "" }],
  };

  const [formData, setFormData] = useState<ProductFormState>(initialFormState);

  const [fileData, setFileData] = useState({
    main_poster: null as File | null,
    zoom_in_file: null as File | null,
    wall_poster_file: null as File | null,
  });

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubcat, setEditingSubcat] = useState<any | null>(null);
  const [editingSize, setEditingSize] = useState<any | null>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newSubcatName, setNewSubcatName] = useState("");
  const [selectedCatIdForSub, setSelectedCatIdForSub] = useState("");
  const [newSize, setNewSize] = useState({
    name: "",
    code: "",
    width: "",
    height: "",
    unit: "inch",
  });

  const totalOrderAmount = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  }, [orders]);

  useEffect(() => {
    if (!token || user.role?.toUpperCase() !== "ADMIN") {
      navigate("/login");
    }
  }, [token, user, navigate]);

  const adminRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Request failed");
    }

    return data;
  };

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(orderFilters.page));
      params.set("limit", String(orderFilters.limit));

      if (orderFilters.search.trim()) params.set("search", orderFilters.search.trim());
      if (orderFilters.payment_status) params.set("payment_status", orderFilters.payment_status);
      if (orderFilters.order_status) params.set("order_status", orderFilters.order_status);

      const res = await adminRequest(`/admin/orders?${params.toString()}`, {
        method: "GET",
      });

      setOrders(Array.isArray(res?.data?.items) ? res.data.items : []);
      setOrdersPagination(
        res?.data?.pagination || {
          page: orderFilters.page,
          limit: orderFilters.limit,
          total: 0,
          pages: 1,
        }
      );
    } catch (error: any) {
      console.error("Orders fetch failed:", error);
      toast.error(error?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);

    try {
      if (activeTab === "inventory") {
        const res = await API.adminGetProducts(filters).catch(() => []);
        setProducts(Array.isArray(res) ? res : res?.data?.items || res?.data || []);
      }

      if (activeTab === "orders") {
        await fetchOrders();
        return;
      }

      const catRes = await API.adminGetCategories().catch(() => []);
      setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);

      const subcatRes = await API.adminGetSubcategories().catch(() => []);
      setSubcategories(Array.isArray(subcatRes) ? subcatRes : subcatRes?.data || []);

      const sizeRes = await API.adminGetSizes().catch(() => []);
      setSizes(Array.isArray(sizeRes) ? sizeRes : sizeRes?.data || []);
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters.page, orderFilters.page]);

  const openOrderDetail = async (orderId: number) => {
    setOrderDetailLoading(true);

    try {
      const res = await adminRequest(`/admin/orders/detail?id=${orderId}`, {
        method: "GET",
      });

      setSelectedOrder(res?.data?.order || null);
    } catch (error: any) {
      console.error("Order detail failed:", error);
      toast.error(error?.message || "Failed to fetch order detail");
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, orderStatus: string) => {
    try {
      await adminRequest("/admin/orders/status", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          order_status: orderStatus,
        }),
      });

      toast.success("Order status updated");
      fetchOrders();

      if (selectedOrder?.id === orderId) {
        openOrderDetail(orderId);
      }
    } catch (error: any) {
      console.error("Status update failed:", error);
      toast.error(error?.message || "Failed to update order status");
    }
  };

  const handleSizePriceChange = (index: number, field: string, value: string) => {
    const newSizePrices = [...formData.size_prices];
    newSizePrices[index] = { ...newSizePrices[index], [field]: value };
    setFormData({ ...formData, size_prices: newSizePrices });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "main_poster" | "zoom_in_file" | "wall_poster_file"
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData({ ...fileData, [key]: e.target.files[0] });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validPrices = formData.size_prices
        .map((sp) => Number(sp.price))
        .filter((p) => !Number.isNaN(p) && p > 0);

      const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 500;
      const firstImage = fileData.main_poster || fileData.zoom_in_file || fileData.wall_poster_file;
      const autoTitle = firstImage
        ? firstImage.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        : `Untitled Product ${Date.now()}`;

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim() || autoTitle);
      formDataToSend.append("short_description", formData.short_description || "");
      formDataToSend.append("full_description", formData.full_description || "");
      formDataToSend.append("category", formData.category || "");
      formDataToSend.append("subcategory", formData.subcategory || "");
      formDataToSend.append("tags", formData.tags || "");
      formDataToSend.append("seo_title", formData.seo_title || "");
      formDataToSend.append("seo_description", formData.seo_description || "");
      formDataToSend.append("author_name", formData.author_name || "");
      formDataToSend.append("author_bio", formData.author_bio || "");
      formDataToSend.append("price", String(lowestPrice));
      formDataToSend.append("stock", "100");
      formDataToSend.append("resolution", "300 DPI");
      formDataToSend.append("color_mode", "RGB");
      formDataToSend.append("visibility", "PUBLISH");
      formDataToSend.append("is_active", "1");

      if (fileData.main_poster) formDataToSend.append("main_poster", fileData.main_poster);
      if (fileData.zoom_in_file) formDataToSend.append("zoom_in_file", fileData.zoom_in_file);
      if (fileData.wall_poster_file) formDataToSend.append("wall_poster_file", fileData.wall_poster_file);

      const formattedSizes = formData.size_prices
        .filter((sp) => sp.size_id && Number(sp.price) > 0)
        .map((sp) => ({
          size_id: Number(sp.size_id),
          price: Number(sp.price),
          stock: 100,
          sku: sp.sku || "",
          is_active: 1,
        }));

      formDataToSend.append("size_prices", JSON.stringify(formattSizes));

      const res = await API.adminCreateProduct(formDataToSend);

      if (res.success !== false) {
        toast.success("Product published successfully");
        setFormData(initialFormState);
        setFileData({ main_poster: null, zoom_in_file: null, wall_poster_file: null });
        setActiveTab("inventory");
      } else {
        toast.error(res.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Create product failed:", error);
      toast.error("Error creating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    await API.adminDeleteProduct({ product_id: id } as any).then(() => {
      toast.success("Deleted");
      fetchAllData();
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { name: newCatName, is_active: 1 };

    if (editingCategory) {
      payload.category_id = editingCategory.id || editingCategory.category_id;
      await API.adminUpdateCategory(payload).then(() => {
        toast.success("Updated");
        setEditingCategory(null);
        setNewCatName("");
        fetchAllData();
      });
    } else {
      await API.adminCreateCategory(payload).then(() => {
        toast.success("Added");
        setNewCatName("");
        fetchAllData();
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    await API.adminDeleteCategory({ category_id: id }).then(() => {
      toast.success("Deleted");
      fetchAllData();
    });
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatIdForSub) return toast.error("Select parent category");

    const payload: any = {
      name: newSubcatName,
      category_id: Number(selectedCatIdForSub),
      is_active: 1,
    };

    if (editingSubcat) {
      payload.subcategory_id = editingSubcat.id || editingSubcat.subcategory_id;
      await API.adminUpdateSubcategory(payload).then(() => {
        toast.success("Updated");
        setEditingSubcat(null);
        setNewSubcatName("");
        setSelectedCatIdForSub("");
        fetchAllData();
      });
    } else {
      await API.adminCreateSubcategory(payload).then(() => {
        toast.success("Added");
        setNewSubcatName("");
        setSelectedCatIdForSub("");
        fetchAllData();
      });
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    await API.adminDeleteSubcategory({ subcategory_id: id }).then(() => {
      toast.success("Deleted");
      fetchAllData();
    });
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...newSize, is_active: 1 };

    if (editingSize) {
      payload.size_id = editingSize.id || editingSize.size_id;
      await API.adminUpdateSize(payload).then(() => {
        toast.success("Updated");
        setEditingSize(null);
        setNewSize({ name: "", code: "", width: "", height: "", unit: "inch" });
        fetchAllData();
      });
    } else {
      await API.adminCreateSize(payload).then(() => {
        toast.success("Added");
        setNewSize({ name: "", code: "", width: "", height: "", unit: "inch" });
        fetchAllData();
      });
    }
  };

  const handleDeleteSize = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    await API.adminDeleteSize({ size_id: id }).then(() => {
      toast.success("Deleted");
      fetchAllData();
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex font-sans text-black overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-[120] w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-coolvetica text-3xl tracking-tighter uppercase leading-none text-gray-900">
                Muro
              </h2>
              <p className="text-[10px] text-gray-500 font-extrabold uppercase mt-1 tracking-widest">
                Admin
              </p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <SideButton active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} icon={<LayoutDashboard size={18} />} label="Inventory" />
            <SideButton active={activeTab === "add"} onClick={() => setActiveTab("add")} icon={<Plus size={18} />} label="Add Product" />
            <SideButton active={activeTab === "attributes"} onClick={() => setActiveTab("attributes")} icon={<Tags size={18} />} label="Attributes" />
            <SideButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<Package size={18} />} label="Orders" />
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-12 shrink-0">
          <div className="flex items-center gap-4">
            <Menu size={22} className="lg:hidden cursor-pointer text-gray-800" onClick={() => setSidebarOpen(true)} />
            <h2 className="hidden md:block text-lg font-extrabold text-gray-800 uppercase tracking-widest">
              Dashboard
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-24">
          {activeTab === "inventory" && renderInventory()}
          {activeTab === "add" && renderAddProduct()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "attributes" && renderAttributes()}
        </main>
      </div>
    </div>
  );

  function renderInventory() {
    return (
      <section className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Catalogue</h1>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-gray-800" />
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">Filters</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <input type="text" placeholder="Search Keyword" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id || c.category_id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={filters.subcategory} onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
              <option value="">All Subcategories</option>
              {subcategories.map((s) => <option key={s.id || s.subcategory_id} value={s.name}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="Min Price" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
            <input type="number" placeholder="Max Price" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
            <input type="text" placeholder="Author Name" value={filters.author_name} onChange={(e) => setFilters({ ...filters, author_name: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
              <option value="latest">Latest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
            <button onClick={fetchAllData} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 transition-all md:col-span-2 lg:col-span-1">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-5 text-xs uppercase font-extrabold text-gray-800">Product</th>
                  <th className="px-8 py-5 text-xs uppercase font-extrabold text-gray-800">Author</th>
                  <th className="px-8 py-5 text-xs uppercase font-extrabold text-gray-800">Price</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center animate-pulse text-sm font-bold text-gray-500">Fetching data...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-sm font-bold text-gray-500">No products found.</td></tr>
                ) : products.map((p: any) => (
                  <tr key={p.id} className="group hover:bg-gray-50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          <img src={getFullImageUrl(p.main_poster_url || p.zoom_in_url || p.wall_poster_url)} alt={p.title} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-gray-900 block mb-1">{p.title}</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">{p.category || "No Category"} {p.subcategory ? `> ${p.subcategory}` : ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-600 uppercase">{p.author_name || "N/A"}</td>
                    <td className="px-8 py-6 text-sm font-extrabold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-8 py-6 text-right">
                      <button type="button" onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">Page {filters.page}</span>
            <div className="flex gap-3">
              <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 hover:bg-gray-100 disabled:opacity-50 uppercase tracking-widest">Prev</button>
              <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-5 py-2.5 bg-black rounded-xl text-xs font-extrabold text-white hover:bg-gray-800 uppercase tracking-widest">Next</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderAddProduct() {
    return (
      <section className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900 uppercase tracking-widest">Publish Listing</h1>
        <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-gray-200 shadow-sm">
          <form onSubmit={handleAddProduct} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <SectionTitle title="Basic Details" />
                <FormGroup label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Leave blank to use image name" />
                <div className="grid grid-cols-2 gap-6">
                  <SelectBox label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} items={categories} placeholder="Select Category" />
                  <SelectBox label="Subcategory" value={formData.subcategory} onChange={(v) => setFormData({ ...formData, subcategory: v })} items={subcategories} placeholder="Select Subcategory" />
                </div>
                <FormGroup label="Tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="motivation, success" />
              </div>

              <div className="space-y-6">
                <SectionTitle title="Media Uploads" />
                <FileInput label="Main Poster Image" onChange={(e) => handleFileChange(e, "main_poster")} />
                <FileInput label="Zoom-In Image" onChange={(e) => handleFileChange(e, "zoom_in_file")} />
                <FileInput label="Wall Poster Room View" onChange={(e) => handleFileChange(e, "wall_poster_file")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-200 pt-8">
              <div className="space-y-6">
                <SectionTitle title="Descriptions" />
                <TextArea label="Short Description" value={formData.short_description} onChange={(value) => setFormData({ ...formData, short_description: value })} height="h-24" />
                <TextArea label="Full Description" value={formData.full_description} onChange={(value) => setFormData({ ...formData, full_description: value })} height="h-36" />
              </div>
              <div className="space-y-6">
                <SectionTitle title="SEO & Author" />
                <FormGroup label="SEO Title" value={formData.seo_title} onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })} />
                <FormGroup label="SEO Description" value={formData.seo_description} onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })} />
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <FormGroup label="Author Name" value={formData.author_name} onChange={(e) => setFormData({ ...formData, author_name: e.target.value })} />
                  <FormGroup label="Author Bio" value={formData.author_bio} onChange={(e) => setFormData({ ...formData, author_bio: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 flex-1 text-gray-900">Size Variants & Pricing</h3>
                <button type="button" onClick={() => setFormData({ ...formData, size_prices: [...formData.size_prices, { size_id: "", price: "", sku: "" }] })} className="flex items-center gap-2 text-xs uppercase font-extrabold text-blue-700 bg-blue-50 px-5 py-3 rounded-full hover:bg-blue-100">
                  <PlusCircle size={16} /> Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {formData.size_prices.map((variant, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">Size</label>
                      <select value={variant.size_id} onChange={(e) => handleSizePriceChange(index, "size_id", e.target.value)} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900 cursor-pointer">
                        <option value="">Select Size</option>
                        {sizes.map((sz) => <option key={sz.id || sz.size_id} value={sz.id || sz.size_id}>{sz.name} ({sz.code})</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]"><FormGroup label="SKU" value={variant.sku} onChange={(e) => handleSizePriceChange(index, "sku", e.target.value)} /></div>
                    <div className="flex-1 min-w-[150px]"><FormGroup label="Price" type="number" value={variant.price} onChange={(e) => handleSizePriceChange(index, "price", e.target.value)} /></div>
                    <button type="button" onClick={() => setFormData({ ...formData, size_prices: formData.size_prices.filter((_, i) => i !== index) })} disabled={formData.size_prices.length === 1} className="p-4 text-red-500 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200 rounded-2xl disabled:opacity-50"><MinusCircle size={20} /></button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-6 rounded-2xl text-xs font-extrabold uppercase tracking-[0.3em] shadow-xl hover:bg-gray-800 transition-all disabled:opacity-60">
              {isSubmitting ? "Publishing..." : "Publish Final Listing"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  function renderOrders() {
    return (
      <section className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Manage Orders</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Paid orders, pending orders and delivery status</p>
          </div>
          <button type="button" onClick={fetchOrders} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2"><RefreshCw size={15} /> Refresh</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Orders" value={ordersPagination.total} icon={<Package size={20} />} />
          <StatCard label="Visible Amount" value={formatPrice(totalOrderAmount)} icon={<CreditCard size={20} />} />
          <StatCard label="Page" value={`${ordersPagination.page}/${ordersPagination.pages || 1}`} icon={<Truck size={20} />} />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4"><Filter size={16} className="text-gray-800" /><h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">Order Filters</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Search order, name, phone, email" value={orderFilters.search} onChange={(e) => setOrderFilters({ ...orderFilters, search: e.target.value, page: 1 })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black" />
            <select value={orderFilters.payment_status} onChange={(e) => setOrderFilters({ ...orderFilters, payment_status: e.target.value, page: 1 })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
              <option value="">All Payments</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option>
            </select>
            <select value={orderFilters.order_status} onChange={(e) => setOrderFilters({ ...orderFilters, order_status: e.target.value, page: 1 })} className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black">
              <option value="">All Order Status</option><option value="PENDING">Pending</option><option value="PLACED">Placed</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
            </select>
            <button type="button" onClick={fetchOrders} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800">Apply Filters</button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1150px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Order</th><th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Customer</th><th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Amount</th><th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Payment</th><th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Order Status</th><th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Items</th><th className="px-6 py-5 text-xs uppercase font-extrabold text-gray-800">Date</th><th className="px-6 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={8} className="p-20 text-center animate-pulse text-sm font-bold text-gray-500">Fetching orders...</td></tr>
                : orders.length === 0 ? <tr><td colSpan={8} className="p-20 text-center text-sm font-bold text-gray-500">No orders found.</td></tr>
                : orders.map((order: any) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-all">
                    <td className="px-6 py-6"><span className="text-sm font-extrabold text-gray-900 block">{order.order_no}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {order.id}</span></td>
                    <td className="px-6 py-6"><span className="text-sm font-extrabold text-gray-900 block">{order.shipping_name || "Customer"}</span><span className="text-xs font-bold text-gray-500 block">{order.shipping_phone || "-"}</span><span className="text-xs font-bold text-gray-500 block">{order.shipping_email || "-"}</span></td>
                    <td className="px-6 py-6"><span className="text-sm font-extrabold text-gray-900 block">{formatPrice(order.total_amount)}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cart: {formatPrice(order.subtotal)}</span></td>
                    <td className="px-6 py-6"><span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${getStatusClass(order.payment_status)}`}><CreditCard size={12} />{order.payment_status || "PENDING"}</span></td>
                    <td className="px-6 py-6"><select value={order.order_status || "PENDING"} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className={`border px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest outline-none ${getStatusClass(order.order_status)}`}><option value="PENDING">Pending</option><option value="PLACED">Placed</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></td>
                    <td className="px-6 py-6 text-sm font-extrabold text-gray-900">{order.item_count || 0}</td>
                    <td className="px-6 py-6 text-xs font-bold text-gray-500 uppercase">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-6 text-right"><button type="button" onClick={() => openOrderDetail(order.id)} className="inline-flex items-center gap-2 bg-black text-white px-4 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-gray-800"><Eye size={15} /> View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">Page {ordersPagination.page} of {ordersPagination.pages || 1}</span>
            <div className="flex gap-3"><button disabled={orderFilters.page === 1} onClick={() => setOrderFilters({ ...orderFilters, page: Math.max(1, orderFilters.page - 1) })} className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 hover:bg-gray-100 disabled:opacity-50 uppercase tracking-widest">Prev</button><button disabled={orderFilters.page >= ordersPagination.pages} onClick={() => setOrderFilters({ ...orderFilters, page: orderFilters.page + 1 })} className="px-5 py-2.5 bg-black rounded-xl text-xs font-extrabold text-white hover:bg-gray-800 disabled:opacity-50 uppercase tracking-widest">Next</button></div>
          </div>
        </div>

        {selectedOrder && <OrderDetailModal selectedOrder={selectedOrder} orderDetailLoading={orderDetailLoading} onClose={() => setSelectedOrder(null)} updateOrderStatus={updateOrderStatus} />}
      </section>
    );
  }

  function renderAttributes() {
    return (
      <section className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-gray-900 mb-8">Manage Attributes</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AttributeBox title="Categories" items={categories} getMain={(i) => i.name} getSub={(i) => `ID: ${i.id || i.category_id}`} onEdit={(i) => { setEditingCategory(i); setNewCatName(i.name); }} onDelete={(id) => handleDeleteCategory(id)} form={<CategoryForm editing={!!editingCategory} value={newCatName} setValue={setNewCatName} onSubmit={handleSaveCategory} onCancel={() => { setEditingCategory(null); setNewCatName(""); }} />} />
          <AttributeBox title="Subcategories" items={subcategories} getMain={(i) => i.name} getSub={(i) => `Cat ID: ${i.category_id} | Sub ID: ${i.id || i.subcategory_id}`} onEdit={(i) => { setEditingSubcat(i); setNewSubcatName(i.name); setSelectedCatIdForSub(i.category_id); }} onDelete={(id) => handleDeleteSubcategory(id)} form={<SubcategoryForm editing={!!editingSubcat} categories={categories} selectedCatIdForSub={selectedCatIdForSub} setSelectedCatIdForSub={setSelectedCatIdForSub} value={newSubcatName} setValue={setNewSubcatName} onSubmit={handleSaveSubcategory} onCancel={() => { setEditingSubcat(null); setNewSubcatName(""); setSelectedCatIdForSub(""); }} />} />
          <AttributeBox title="Sizes" items={sizes} getMain={(i) => `${i.name} (${i.code})`} getSub={(i) => `${i.width || "-"}x${i.height || "-"} ${i.unit || ""} | ID: ${i.id || i.size_id}`} onEdit={(i) => { setEditingSize(i); setNewSize({ name: i.name || "", code: i.code || "", width: i.width || "", height: i.height || "", unit: i.unit || "inch" }); }} onDelete={(id) => handleDeleteSize(id)} form={<SizeForm editing={!!editingSize} value={newSize} setValue={setNewSize} onSubmit={handleSaveSize} onCancel={() => { setEditingSize(null); setNewSize({ name: "", code: "", width: "", height: "", unit: "inch" }); }} />} />
        </div>
      </section>
    );
  }
};

const SideButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button type="button" onClick={onClick} className={`flex w-full items-center gap-4 px-7 py-5 rounded-2xl text-xs font-extrabold uppercase ${active ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>{icon}{label}</button>
);

const SectionTitle = ({ title }: { title: string }) => <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 mb-5 text-gray-900">{title}</h3>;

const FormGroup = ({ label, value, onChange, placeholder = "", type = "text" }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) => (
  <div className="space-y-2"><label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">{label}</label><input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900" /></div>
);

const SelectBox = ({ label, value, onChange, items, placeholder }: { label: string; value: string; onChange: (value: string) => void; items: any[]; placeholder: string }) => (
  <div className="space-y-2"><label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900 cursor-pointer"><option value="">{placeholder}</option>{items.map((item) => <option key={item.id || item.category_id || item.subcategory_id} value={item.name}>{item.name}</option>)}</select></div>
);

const FileInput = ({ label, onChange }: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="space-y-2"><label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">{label}</label><input type="file" accept="image/*" onChange={onChange} className="w-full bg-white border border-gray-300 p-3.5 rounded-2xl text-xs font-semibold text-gray-900 cursor-pointer" /></div>
);

const TextArea = ({ label, value, onChange, height }: { label: string; value: string; onChange: (value: string) => void; height: string }) => (
  <div className="space-y-2"><label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm ${height} resize-none font-semibold text-gray-900`} /></div>
);

const StatCard = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm"><div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center mb-4">{icon}</div><p className="text-xs uppercase tracking-widest font-extrabold text-gray-500 mb-1">{label}</p><p className="text-2xl font-extrabold text-gray-900">{value}</p></div>
);

const AttributeBox = ({ title, items, getMain, getSub, onEdit, onDelete, form }: { title: string; items: any[]; getMain: (item: any) => string; getSub: (item: any) => string; onEdit: (item: any) => void; onDelete: (id: number) => void; form: React.ReactNode }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[600px]"><h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-4 mb-4 shrink-0 text-gray-900">{title}</h3><div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 no-scrollbar">{items.map((item) => { const id = item.id || item.category_id || item.subcategory_id || item.size_id; return <div key={id} className="group bg-gray-50 hover:bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 hover:border-black transition-all"><div><span className="text-sm font-extrabold uppercase text-gray-900 block">{getMain(item)}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{getSub(item)}</span></div><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button type="button" onClick={() => onEdit(item)} className="p-2 bg-gray-200 hover:bg-black hover:text-white rounded-md"><Edit size={14} /></button><button type="button" onClick={() => onDelete(Number(id))} className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-md"><Trash2 size={14} /></button></div></div>; })}</div>{form}</div>
);

const CategoryForm = ({ editing, value, setValue, onSubmit, onCancel }: any) => <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-auto shrink-0 border-t border-gray-200 pt-6"><input required value={value} onChange={(e) => setValue(e.target.value)} placeholder={editing ? "Update name" : "New category"} className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><div className="flex gap-2"><button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold">{editing ? "Update" : "Add"}</button>{editing && <button type="button" onClick={onCancel} className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest">Cancel</button>}</div></form>;

const SubcategoryForm = ({ editing, categories, selectedCatIdForSub, setSelectedCatIdForSub, value, setValue, onSubmit, onCancel }: any) => <form onSubmit={onSubmit} className="space-y-3 mt-auto shrink-0 border-t border-gray-200 pt-6"><select required value={selectedCatIdForSub} onChange={(e) => setSelectedCatIdForSub(e.target.value)} className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold cursor-pointer outline-none text-gray-900"><option value="">Select Parent Category</option>{categories.map((c: any) => <option key={c.id || c.category_id} value={c.id || c.category_id}>{c.name}</option>)}</select><input required value={value} onChange={(e) => setValue(e.target.value)} placeholder={editing ? "Update subcategory" : "New subcategory"} className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><div className="flex gap-2"><button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold">{editing ? "Update" : "Add"}</button>{editing && <button type="button" onClick={onCancel} className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest">Cancel</button>}</div></form>;

const SizeForm = ({ editing, value, setValue, onSubmit, onCancel }: any) => <form onSubmit={onSubmit} className="space-y-3 mt-auto shrink-0 border-t border-gray-200 pt-6"><input required value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} placeholder="Name" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><div className="grid grid-cols-2 gap-3"><input required value={value.code} onChange={(e) => setValue({ ...value, code: e.target.value })} placeholder="Code" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><input value={value.unit} onChange={(e) => setValue({ ...value, unit: e.target.value })} placeholder="Unit" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /></div><div className="grid grid-cols-2 gap-3"><input value={value.width} onChange={(e) => setValue({ ...value, width: e.target.value })} placeholder="Width" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /><input value={value.height} onChange={(e) => setValue({ ...value, height: e.target.value })} placeholder="Height" className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900" /></div><div className="flex gap-2"><button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold">{editing ? "Update" : "Add"}</button>{editing && <button type="button" onClick={onCancel} className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest">Cancel</button>}</div></form>;

const OrderDetailModal = ({ selectedOrder, orderDetailLoading, onClose, updateOrderStatus }: { selectedOrder: any; orderDetailLoading: boolean; onClose: () => void; updateOrderStatus: (orderId: number, orderStatus: string) => void }) => (
  <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"><div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl"><div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between"><div><h2 className="text-2xl font-serif font-bold text-gray-900">Order Bill</h2><p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">{selectedOrder.order_no}</p></div><button type="button" onClick={onClose} className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl"><X size={18} /></button></div>{orderDetailLoading ? <div className="p-20 text-center text-sm font-bold text-gray-500">Loading bill...</div> : <div className="p-6 space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><InfoBox title="Customer"><p className="text-sm font-extrabold text-gray-900">{selectedOrder.shipping_name || "-"}</p><p className="text-xs font-bold text-gray-500 mt-1">{selectedOrder.shipping_phone || "-"}</p><p className="text-xs font-bold text-gray-500">{selectedOrder.shipping_email || "-"}</p></InfoBox><InfoBox title="Payment"><p className="text-sm font-extrabold text-gray-900">{selectedOrder.payment_status || "-"}</p><p className="text-xs font-bold text-gray-500 mt-1 break-all">{selectedOrder.razorpay_payment_id || "-"}</p></InfoBox><InfoBox title="Delivery"><select value={selectedOrder.order_status || "PENDING"} onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)} className={`border px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest outline-none ${getStatusClass(selectedOrder.order_status)}`}><option value="PENDING">Pending</option><option value="PLACED">Placed</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select><p className="text-xs font-bold text-gray-500 mt-2">{selectedOrder.shipping_city || "-"}, {selectedOrder.shipping_state || "-"}</p></InfoBox></div><div className="border border-gray-200 rounded-2xl overflow-hidden"><table className="w-full text-left min-w-[700px]"><thead className="bg-gray-100"><tr><th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest">Product</th><th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-center">Qty</th><th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-right">Price</th><th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-right">Total</th></tr></thead><tbody className="divide-y divide-gray-100">{(selectedOrder.items || []).length === 0 ? <tr><td colSpan={4} className="p-10 text-center text-sm font-bold text-gray-500">No items found.</td></tr> : selectedOrder.items.map((item: any) => <tr key={item.id}><td className="px-5 py-5"><div className="flex items-center gap-4"><div className="w-14 h-16 bg-gray-100 rounded-xl overflow-hidden"><img src={getFullImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-contain" /></div><span className="text-sm font-extrabold text-gray-900">{item.title}</span></div></td><td className="px-5 py-5 text-center font-bold">{item.qty}</td><td className="px-5 py-5 text-right font-bold">{formatPrice(item.price)}</td><td className="px-5 py-5 text-right font-extrabold">{formatPrice(item.line_total)}</td></tr>)}</tbody></table></div><div className="flex justify-end"><div className="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3"><div className="flex justify-between text-sm font-bold"><span className="text-gray-500">Cart Total</span><span>{formatPrice(selectedOrder.subtotal)}</span></div><div className="flex justify-between text-lg font-extrabold border-t border-gray-200 pt-3"><span>Paid Amount</span><span>{formatPrice(selectedOrder.total_amount)}</span></div></div></div></div>}</div></div>
);

const InfoBox = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200"><p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">{title}</p>{children}</div>;

export default AdminDashboard;
