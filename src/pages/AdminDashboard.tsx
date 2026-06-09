import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Edit,
  Eye,
  Filter,
  Home,
  ImagePlus,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  PlusCircle,
  RefreshCw,
  Save,
  Tags,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";

type AdminTab = "home" | "inventory" | "add" | "orders" | "attributes" | "offers" | "coupons" | "cutouts" | "postcards";

type ProductImageRow = {
  id?: number;
  image_title: string;
  file: File | null;
  existing_url?: string;
  preview_url?: string;
  sort_order: number;
  marked_delete?: boolean;
};

type ProductFormState = {
  category: string;
  subcategory: string;
  short_description: string;
  full_description: string;
  product_images: ProductImageRow[];
  hidden_title: string;
};

type SizeFormState = {
  name: string;
  price: string;
};


type HomeHeroForm = {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
  image_file: File | null;
  preview_url: string;
};

type HomeTileForm = {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
  image_file: File | null;
  preview_url: string;
};

type HomeContentForm = {
  hero_slides: HomeHeroForm[];
  category_tiles: HomeTileForm[];
  featured_new_arrival_ids: number[];
  featured_postcard_ids: number[];
  featured_cutout_ids: number[];
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const emptyImageRow = (): ProductImageRow => ({
  image_title: "",
  file: null,
  preview_url: "",
  sort_order: Date.now(),
  marked_delete: false,
});

const getCategoryId = (item: any) => item?.id || item?.category_id;
const getSubcategoryId = (item: any) => item?.id || item?.subcategory_id;
const getSizeId = (item: any) => item?.id || item?.size_id;
const getProductId = (item: any) => item?.id || item?.product_id || item?.productId;

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (cleanPath.startsWith("images/") || cleanPath.startsWith("assets/")) {
    return `/${cleanPath}`;
  }

  if (cleanPath.startsWith("api/public/uploads")) {
    return `https://muroposter.com/${cleanPath}`;
  }

  if (
    !cleanPath.includes("uploads/product") &&
    !cleanPath.includes("uploads/postcards") &&
    !cleanPath.includes("uploads/home")
  ) {
    cleanPath = `uploads/product/${cleanPath}`;
  }

  return `https://muroposter.com/${cleanPath}`;
};

const formatPrice = (value: any) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
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


const homeHeroDefaults = (): HomeHeroForm[] => [
  {
    title: "Transform Your Walls.",
    subtitle: "Premium poster prints curated for beautiful living.",
    button_text: "Start Curating →",
    button_link: "/products",
    image_url: "",
    image_file: null,
    preview_url: "",
  },
  {
    title: "Art For Every Space.",
    subtitle: "Bring warmth, mood and personality into your room.",
    button_text: "Explore Posters →",
    button_link: "/products",
    image_url: "",
    image_file: null,
    preview_url: "",
  },
  {
    title: "Curated Wall Prints.",
    subtitle: "Simple, premium and meaningful posters for modern homes.",
    button_text: "Shop Now →",
    button_link: "/products",
    image_url: "",
    image_file: null,
    preview_url: "",
  },
];

const homeTileDefaults = (): HomeTileForm[] => [
  {
    title: "New Arrivals",
    subtitle: "New prints to refresh your walls",
    button_text: "Discover",
    button_link: "/new-arrivals",
    image_url: "images/posters.webp",
    image_file: null,
    preview_url: "images/posters.webp",
  },
  {
    title: "Kids Art Prints",
    subtitle: "Playful prints to bring joy to their space",
    button_text: "Explore",
    button_link: "/products?cat=Kids%20Art%20Prints",
    image_url: "images/cutouts.webp",
    image_file: null,
    preview_url: "images/cutouts.webp",
  },
  {
    title: "Postcards",
    subtitle: "Front and back postcard products with premium paper options",
    button_text: "Explore",
    button_link: "/postcards",
    image_url: "images/postcards.webp",
    image_file: null,
    preview_url: "images/postcards.webp",
  },
];

const defaultHomeContentForm = (): HomeContentForm => ({
  hero_slides: homeHeroDefaults(),
  category_tiles: homeTileDefaults(),
  featured_new_arrival_ids: [],
  featured_postcard_ids: [],
  featured_cutout_ids: [],
});

const normalizeHomeRows = <T extends HomeHeroForm | HomeTileForm>(
  rows: any,
  defaults: T[]
): T[] => {
  const source = Array.isArray(rows) && rows.length > 0 ? rows : defaults;

  return defaults.map((fallback, index) => {
    const row = source[index] || fallback;
    const imageUrl = String(row.image_url || row.image || row.img || fallback.image_url || "");

    return {
      ...fallback,
      title: String(row.title || fallback.title || ""),
      subtitle: String(row.subtitle || fallback.subtitle || ""),
      button_text: String(row.button_text || row.buttonText || row.cta || fallback.button_text || "Explore"),
      button_link: String(row.button_link || row.buttonLink || row.to || fallback.button_link || "/products"),
      image_url: imageUrl,
      image_file: null,
      preview_url: imageUrl,
    } as T;
  });
};

const normalizeHomeContent = (data: any): HomeContentForm => {
  const content = data?.content || data || {};
  return {
    hero_slides: normalizeHomeRows<HomeHeroForm>(content.hero_slides, homeHeroDefaults()),
    category_tiles: normalizeHomeRows<HomeTileForm>(content.category_tiles, homeTileDefaults()),
    featured_new_arrival_ids: Array.isArray(content.featured_new_arrival_ids)
      ? content.featured_new_arrival_ids.map(Number).filter(Boolean)
      : [],
    featured_postcard_ids: Array.isArray(content.featured_postcard_ids)
      ? content.featured_postcard_ids.map(Number).filter(Boolean)
      : [],
    featured_cutout_ids: Array.isArray(content.featured_cutout_ids)
      ? content.featured_cutout_ids.map(Number).filter(Boolean)
      : [],
  };
};

const getPostcardDisplayImage = (item: any) => {
  return item?.image_url || item?.front_image_url || item?.back_image_url || "";
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

const normalizeProductImages = (product: any): ProductImageRow[] => {
  const directImages = product?.product_images || product?.images || [];

  if (Array.isArray(directImages) && directImages.length > 0) {
    return directImages.map((img: any, index: number) => ({
      id: Number(img.id || img.image_id || 0) || undefined,
      image_title:
        img.image_title ||
        img.title ||
        img.alt ||
        img.name ||
        `Image ${index + 1}`,
      file: null,
      existing_url:
        img.image_url ||
        img.url ||
        img.file_url ||
        img.path ||
        img.main_poster_url ||
        "",
      preview_url:
        img.image_url ||
        img.url ||
        img.file_url ||
        img.path ||
        img.main_poster_url ||
        "",
      sort_order: Number(img.sort_order || index + 1),
      marked_delete: false,
    }));
  }

  const fallbackImages = [
    {
      image_title: "Main Poster Image",
      existing_url: product?.main_poster_url || "",
    },
    {
      image_title: "Zoom-In Image",
      existing_url: product?.zoom_in_url || "",
    },
    {
      image_title: "Wall Poster Room View",
      existing_url: product?.wall_poster_url || "",
    },
  ].filter((item) => item.existing_url);

  return fallbackImages.map((img, index) => ({
    image_title: img.image_title,
    file: null,
    existing_url: img.existing_url,
    preview_url: img.existing_url,
    sort_order: index + 1,
    marked_delete: false,
  }));
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("home");
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

  const [editingProduct, setEditingProduct] = useState<any | null>(null);

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
    category: "",
    subcategory: "",
    short_description: "",
    full_description: "",
    product_images: [emptyImageRow()],
    hidden_title: "",
  };

  const [formData, setFormData] = useState<ProductFormState>(initialFormState);

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingSubcat, setEditingSubcat] = useState<any | null>(null);
  const [editingSize, setEditingSize] = useState<any | null>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newSubcatName, setNewSubcatName] = useState("");
  const [selectedCatIdForSub, setSelectedCatIdForSub] = useState("");
  const [newSize, setNewSize] = useState<SizeFormState>({
    name: "",
    price: "",
  });

  const [offers, setOffers] = useState<any[]>([]);
  const [offerForm, setOfferForm] = useState({
    id: "",
    label: "",
    discount_percent: "",
    from_date: "",
    to_date: "",
    is_active: "1",
  });

  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({
    quantity: "1",
    discount_percent: "",
  });

  const [postcards, setPostcards] = useState<any[]>([]);
  const [postcardForm, setPostcardForm] = useState<any>({
    id: "",
    product_type: "postcard",
    product_name: "",
    quality_of_paper: "",
    size: "",
    description: "",
    short_description: "",
    full_description: "",
    price: "",
    width: "",
    height: "",
    sqft_price: "",
    front_image_file: null,
    back_image_file: null,
    image_file: null,
    front_image_files: [],
    back_image_files: [],
    front_image_url: "",
    back_image_url: "",
    image_url: "",
  });


  const [homeContent, setHomeContent] = useState<HomeContentForm>(defaultHomeContentForm());
  const [availableHomeProducts, setAvailableHomeProducts] = useState<any[]>([]);
  const [availableHomePostcards, setAvailableHomePostcards] = useState<any[]>([]);
  const [availableHomeCutouts, setAvailableHomeCutouts] = useState<any[]>([]);

  const visibleProductImages = formData.product_images.filter(
    (row) => !row.marked_delete
  );

  const totalOrderAmount = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
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

  const adminMultipartRequest = async (
    endpoint: string,
    form: FormData,
    method = "POST"
  ) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Request failed");
    }

    return data;
  };

  const createProductRequest = async (body: FormData) => {
    return adminMultipartRequest("/admin/products/create", body);
  };

  const updateProductRequest = async (body: FormData) => {
    return adminMultipartRequest("/admin/products/update", body);
  };

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(orderFilters.page));
      params.set("limit", String(orderFilters.limit));

      if (orderFilters.search.trim()) {
        params.set("search", orderFilters.search.trim());
      }

      if (orderFilters.payment_status) {
        params.set("payment_status", orderFilters.payment_status);
      }

      if (orderFilters.order_status) {
        params.set("order_status", orderFilters.order_status);
      }

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

  const fetchMasterData = async () => {
    const catRes = await API.adminGetCategories().catch(() => []);
    const fetchedCategories = Array.isArray(catRes) ? catRes : catRes?.data || [];

    setCategories(fetchedCategories);

    const subcatRes = await API.adminGetSubcategories().catch(() => null);
    const fetchedSubcategories = Array.isArray(subcatRes)
      ? subcatRes
      : subcatRes?.data || [];

    if (fetchedSubcategories.length > 0) {
      setSubcategories(fetchedSubcategories);
    } else {
      const flattened = fetchedCategories.flatMap((cat: any) =>
        Array.isArray(cat.subcategories)
          ? cat.subcategories.map((sub: any) => ({
              ...sub,
              category_id: getCategoryId(cat),
              category_name: cat.name,
            }))
          : []
      );

      setSubcategories(flattened);
    }

    const sizeRes = await API.adminGetSizes().catch(() => []);
    setSizes(Array.isArray(sizeRes) ? sizeRes : sizeRes?.data || []);
  };

  const fetchProducts = async () => {
    const res = await API.adminGetProducts(filters).catch(() => []);
    setProducts(Array.isArray(res) ? res : res?.data?.items || res?.data || []);
  };

  const fetchOffers = async () => {
    const res = await adminRequest("/admin/offers", { method: "GET" });
    setOffers(Array.isArray(res?.data) ? res.data : res?.data?.items || []);
  };

  const fetchCoupons = async () => {
    const res = await adminRequest("/admin/coupons", { method: "GET" });
    setCoupons(Array.isArray(res?.data) ? res.data : res?.data?.items || []);
  };

  const fetchPostcards = async () => {
    const endpoint = activeTab === "cutouts" ? "/admin/cutouts" : "/admin/postcards";
    const res = await adminRequest(endpoint, { method: "GET" });
    setPostcards(Array.isArray(res?.data) ? res.data : res?.data?.items || []);
  };


  const fetchHomeContent = async () => {
    const [contentRes, productRes, postcardRes, cutoutRes] = await Promise.all([
      adminRequest("/admin/home-content", { method: "GET" }),
      adminRequest("/admin/products?all=1&visibility=PUBLISH&is_active=1", { method: "GET" }).catch(() => ({ data: { items: [] } })),
      adminRequest("/admin/postcards", { method: "GET" }).catch(() => ({ data: { items: [] } })),
      adminRequest("/admin/cutouts", { method: "GET" }).catch(() => ({ data: { items: [] } })),
    ]);

    setHomeContent(normalizeHomeContent(contentRes?.data));
    setAvailableHomeProducts(Array.isArray(productRes?.data) ? productRes.data : productRes?.data?.items || []);
    setAvailableHomePostcards(Array.isArray(postcardRes?.data) ? postcardRes.data : postcardRes?.data?.items || []);
    setAvailableHomeCutouts(Array.isArray(cutoutRes?.data) ? cutoutRes.data : cutoutRes?.data?.items || []);
  };

  const fetchAllData = async () => {
    setLoading(true);

    try {
      if (activeTab === "home") {
        await fetchHomeContent();
        return;
      }

      if (activeTab === "orders") {
        await fetchOrders();
        return;
      }

      if (activeTab === "offers") {
        await fetchOffers();
        return;
      }

      if (activeTab === "coupons") {
        await fetchCoupons();
        return;
      }

      if (activeTab === "postcards" || activeTab === "cutouts") {
        await fetchPostcards();
        return;
      }

      await fetchMasterData();

      if (activeTab === "inventory") {
        await fetchProducts();
      }
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

  const resetProductForm = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  const handleProductImageTitleChange = (index: number, value: string) => {
    const rows = [...formData.product_images];
    rows[index] = { ...rows[index], image_title: value };
    setFormData({ ...formData, product_images: rows });
  };

  const handleProductImageFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    const rows = [...formData.product_images];

    if (!file) {
      rows[index] = {
        ...rows[index],
        file: null,
        preview_url: rows[index].existing_url || "",
      };
      setFormData({ ...formData, product_images: rows });
      return;
    }

    rows[index] = {
      ...rows[index],
      file,
      preview_url: URL.createObjectURL(file),
      image_title: rows[index].image_title || "",
    };

    setFormData({ ...formData, product_images: rows });
  };

  const addProductImageRow = () => {
    setFormData({
      ...formData,
      product_images: [...formData.product_images, emptyImageRow()],
    });
  };

  const removeProductImageRow = (index: number) => {
    const rows = [...formData.product_images];
    const row = rows[index];

    if (row.id || row.existing_url) {
      rows[index] = { ...row, marked_delete: true };
    } else {
      rows.splice(index, 1);
    }

    setFormData({
      ...formData,
      product_images: rows.length > 0 ? rows : [emptyImageRow()],
    });
  };

  const buildProductFormData = (imageRowsOverride?: ProductImageRow[]) => {
    const imagesForRequest = imageRowsOverride || formData.product_images;

    const lowestMasterPrice =
      sizes.length > 0
        ? Math.min(...sizes.map((s) => Number(s.price || 0)).filter((p) => p > 0))
        : 500;

    const firstUsableImage = imagesForRequest.find(
      (img) => !img.marked_delete && (img.file || img.existing_url || img.image_title)
    );

    const cleanImageTitle = String(firstUsableImage?.image_title || "").trim();

    const autoTitle =
      cleanImageTitle ||
      formData.hidden_title ||
      `${formData.category || "Poster"} ${formData.subcategory || ""}`.trim() ||
      `Product ${Date.now()}`;

    const body = new FormData();

    const editProductId =
      editingProduct?.id ??
      editingProduct?.product_id ??
      editingProduct?.productId ??
      editingProduct?.product?.id ??
      editingProduct?.product?.product_id ??
      null;

    if (editingProduct && !editProductId) {
      throw new Error("Product ID missing for update. Please go back to Inventory and click Edit again.");
    }

    if (editProductId) {
      body.append("product_id", String(editProductId));
    }

    body.append("title", autoTitle);
    body.append("short_description", formData.short_description || "");
    body.append("full_description", formData.full_description || "");
    body.append("description", formData.short_description || "");
    body.append("category", formData.category || "");
    body.append("subcategory", formData.subcategory || "");
    body.append("tags", "");
    body.append("seo_title", "");
    body.append("seo_description", "");
    body.append("author_name", "");
    body.append("author_bio", "");
    body.append("price", String(lowestMasterPrice || 500));
    body.append("stock", "100");
    body.append("resolution", "300 DPI");
    body.append("color_mode", "RGB");
    body.append("visibility", "PUBLISH");
    body.append("is_active", "1");

    const formattedImages = imagesForRequest.map((img, index) => ({
      id: img.id || null,
      image_title: img.image_title || `Image ${index + 1}`,
      existing_url: img.existing_url || "",
      sort_order: index + 1,
      delete: img.marked_delete ? 1 : 0,
    }));

    body.append("product_images", JSON.stringify(formattedImages));

    imagesForRequest.forEach((img, index) => {
      body.append(`image_titles[${index}]`, img.image_title || `Image ${index + 1}`);
      body.append(`image_sort_orders[${index}]`, String(index + 1));

      if (img.id) {
        body.append(`image_ids[${index}]`, String(img.id));
      }

      if (img.marked_delete) {
        body.append(`image_delete[${index}]`, "1");
      }

      if (img.file && !img.marked_delete) {
        body.append(`product_image_files[${index}]`, img.file);
      }
    });

    const activeImages = imagesForRequest.filter(
      (img) => !img.marked_delete
    );

    if (activeImages[0]?.file) {
      body.append("main_poster", activeImages[0].file);
    }

    if (activeImages[1]?.file) {
      body.append("zoom_in_file", activeImages[1].file);
    }

    if (activeImages[2]?.file) {
      body.append("wall_poster_file", activeImages[2].file);
    }

    return body;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Select category");
      return;
    }

    if (!formData.subcategory) {
      toast.error("Select subcategory");
      return;
    }

    const hasImage = formData.product_images.some(
      (img) => !img.marked_delete && (img.file || img.existing_url)
    );

    if (!hasImage) {
      toast.error("Add at least one image");
      return;
    }

    if (sizes.length === 0) {
      toast.error("Please add at least one Size and Price in Attributes first");
      return;
    }

    setIsSubmitting(true);

    try {
      const activeImageRows = formData.product_images.filter(
        (img) => !img.marked_delete && (img.file || img.existing_url)
      );

      if (!editingProduct?.id && activeImageRows.length > 1) {
        const results = [];

        for (let index = 0; index < activeImageRows.length; index += 1) {
          const imageRow = activeImageRows[index];
          const form = buildProductFormData([
            {
              ...imageRow,
              id: undefined,
              existing_url: imageRow.existing_url || "",
              sort_order: 1,
              marked_delete: false,
            },
          ]);

          const response = await createProductRequest(form);
          results.push(response);
        }

        const failed = results.find((item) => item?.success === false);
        if (failed) {
          toast.error(failed?.message || "Failed to publish one or more products");
          return;
        }

        toast.success(`${activeImageRows.length} product variations published successfully`);
        resetProductForm();
        setActiveTab("inventory");
        fetchAllData();
        return;
      }

      const form = buildProductFormData();

      const res = editingProduct?.id
        ? await updateProductRequest(form)
        : await createProductRequest(form);

      if (res?.success !== false) {
        toast.success(
          editingProduct?.id
            ? "Product updated successfully"
            : "Product published successfully"
        );

        resetProductForm();
        setActiveTab("inventory");
        fetchAllData();
      } else {
        toast.error(res?.message || "Failed to save product");
      }
    } catch (error: any) {
      console.error("Save product failed:", error);
      toast.error(error?.message || "Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (product: any) => {
    try {
      let detail = product;

      if (typeof (API as any).adminViewProduct === "function") {
        const res = await (API as any).adminViewProduct({
          product_id: product.id || product.product_id || product.productId,
        });
        detail = res?.data?.product || res?.data || product;
      }

      const imageRows = normalizeProductImages(detail);

      setEditingProduct({
        ...detail,
        id: detail.id || product.id || product.product_id || product.productId,
        product_id:
          detail.product_id || detail.id || product.id || product.product_id || product.productId,
      });
      setFormData({
        category: detail.category || "",
        subcategory: detail.subcategory || "",
        short_description:
          detail.short_description || detail.description || "",
        full_description: detail.full_description || "",
        product_images: imageRows.length > 0 ? imageRows : [emptyImageRow()],
        hidden_title: detail.title || "",
      });

      setActiveTab("add");
    } catch (error: any) {
      console.error("Edit product failed:", error);
      toast.error(error?.message || "Failed to open product for edit");
    }
  };

  const handleDeleteProduct = async (product: any) => {
    const productId = Number(getProductId(product));

    if (!Number.isFinite(productId) || productId <= 0) {
      console.error("Delete product failed: missing product id", product);
      toast.error("Product ID missing. Please refresh and try again.");
      return;
    }

    if (!window.confirm("Delete this product?")) return;

    try {
      await adminRequest("/admin/products/delete", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });

      toast.success("Deleted");
      fetchAllData();
    } catch (error: any) {
      console.error("Delete product failed:", error);
      toast.error(error?.message || "Failed to delete product");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = { name: newCatName, is_active: 1 };

    if (editingCategory) {
      payload.category_id = getCategoryId(editingCategory);
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

    if (!selectedCatIdForSub) {
      toast.error("Select parent category");
      return;
    }

    const payload: any = {
      name: newSubcatName,
      category_id: Number(selectedCatIdForSub),
      is_active: 1,
    };

    if (editingSubcat) {
      payload.subcategory_id = getSubcategoryId(editingSubcat);
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

    const payload: any = {
      name: newSize.name,
      price: Number(newSize.price || 0),
      is_active: 1,
    };

    if (!payload.name.trim()) {
      toast.error("Enter size");
      return;
    }

    if (payload.price <= 0) {
      toast.error("Enter valid price");
      return;
    }

    if (editingSize) {
      payload.size_id = getSizeId(editingSize);
      await API.adminUpdateSize(payload).then(() => {
        toast.success("Updated");
        setEditingSize(null);
        setNewSize({
          name: "",
          price: "",
        });
        fetchAllData();
      });
    } else {
      await API.adminCreateSize(payload).then(() => {
        toast.success("Added");
        setNewSize({
          name: "",
          price: "",
        });
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


  const resetOfferForm = () => {
    setOfferForm({
      id: "",
      label: "",
      discount_percent: "",
      from_date: "",
      to_date: "",
      is_active: "1",
    });
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerForm.label.trim()) {
      toast.error("Offer label is required");
      return;
    }

    const percent = Number(offerForm.discount_percent || 0);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    try {
      await adminRequest("/admin/offers/save", {
        method: "POST",
        body: JSON.stringify({
          id: offerForm.id || undefined,
          label: offerForm.label.trim(),
          discount_percent: percent,
          from_date: offerForm.from_date,
          to_date: offerForm.to_date,
          is_active: Number(offerForm.is_active || 1),
        }),
      });

      toast.success("Offer saved");
      resetOfferForm();
      fetchOffers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save offer");
    }
  };

  const handleEditOffer = (offer: any) => {
    setOfferForm({
      id: String(offer.id || ""),
      label: String(offer.label || ""),
      discount_percent: String(offer.discount_percent || ""),
      from_date: String(offer.from_date || ""),
      to_date: String(offer.to_date || ""),
      is_active: String(offer.is_active ?? 1),
    });
  };

  const handleDeleteOffer = async (id: number) => {
    if (!window.confirm("Delete this offer?")) return;

    try {
      await adminRequest("/admin/offers/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      toast.success("Offer deleted");
      fetchOffers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete offer");
    }
  };

  const handleGenerateCoupons = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = Number(couponForm.quantity || 0);
    const percent = Number(couponForm.discount_percent || 0);

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 60) {
      toast.error("You can generate 1 to 60 coupons at a time");
      return;
    }

    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      toast.error("Coupon discount percentage must be between 1 and 100");
      return;
    }

    try {
      await adminRequest("/admin/coupons/generate", {
        method: "POST",
        body: JSON.stringify({ quantity, discount_percent: percent }),
      });

      toast.success("Coupons generated");
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate coupons");
    }
  };


  const updateHomeHeroField = (index: number, key: keyof HomeHeroForm, value: string | File | null) => {
    const rows = [...homeContent.hero_slides];
    const current = rows[index] || homeHeroDefaults()[index];

    if (key === "image_file") {
      const file = value as File | null;
      rows[index] = {
        ...current,
        image_file: file,
        preview_url: file ? URL.createObjectURL(file) : current.image_url,
      };
    } else {
      rows[index] = { ...current, [key]: String(value ?? "") };
    }

    setHomeContent({ ...homeContent, hero_slides: rows });
  };

  const updateHomeTileField = (index: number, key: keyof HomeTileForm, value: string | File | null) => {
    const rows = [...homeContent.category_tiles];
    const current = rows[index] || homeTileDefaults()[index];

    if (key === "image_file") {
      const file = value as File | null;
      rows[index] = {
        ...current,
        image_file: file,
        preview_url: file ? URL.createObjectURL(file) : current.image_url,
      };
    } else {
      rows[index] = { ...current, [key]: String(value ?? "") };
    }

    setHomeContent({ ...homeContent, category_tiles: rows });
  };

  const toggleHomeFeatured = (type: "new_arrival" | "postcard" | "cutout", id: number) => {
    if (type === "new_arrival") {
      const current = homeContent.featured_new_arrival_ids || [];
      const exists = current.includes(id);
      const next = exists ? current.filter((item) => item !== id) : [...current, id];
      setHomeContent({ ...homeContent, featured_new_arrival_ids: next });
      return;
    }

    if (type === "postcard") {
      const current = homeContent.featured_postcard_ids || [];
      const exists = current.includes(id);
      const next = exists ? current.filter((item) => item !== id) : [...current, id];
      setHomeContent({ ...homeContent, featured_postcard_ids: next });
      return;
    }

    const current = homeContent.featured_cutout_ids || [];
    const exists = current.includes(id);
    const next = exists ? current.filter((item) => item !== id) : [...current, id];
    setHomeContent({ ...homeContent, featured_cutout_ids: next });
  };

  const buildHomeContentForm = () => {
    const body = new FormData();
    const payload = {
      hero_slides: (homeContent.hero_slides || homeHeroDefaults()).map((item) => ({
        title: item.title,
        subtitle: item.subtitle,
        button_text: item.button_text,
        button_link: item.button_link,
        image_url: item.image_url,
      })),
      category_tiles: (homeContent.category_tiles || homeTileDefaults()).map((item) => ({
        title: item.title,
        subtitle: item.subtitle,
        button_text: item.button_text,
        button_link: item.button_link,
        image_url: item.image_url,
      })),
      featured_new_arrival_ids: homeContent.featured_new_arrival_ids || [],
      featured_postcard_ids: homeContent.featured_postcard_ids || [],
      featured_cutout_ids: homeContent.featured_cutout_ids || [],
    };

    body.append("content", JSON.stringify(payload));

    (homeContent.hero_slides || []).forEach((item, index) => {
      if (item.image_file) {
        body.append(`hero_image_${index}`, item.image_file);
      }
    });

    (homeContent.category_tiles || []).forEach((item, index) => {
      if (item.image_file) {
        body.append(`category_image_${index}`, item.image_file);
      }
    });

    return body;
  };

  const handleSaveHomeContent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await adminMultipartRequest("/admin/home-content/save", buildHomeContentForm());
      setHomeContent(normalizeHomeContent(res?.data));
      toast.success("Home page content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save home page content");
    }
  };

  const resetPostcardForm = () => {
    setPostcardForm({
      id: "",
      product_type: "postcard",
      product_name: "",
      quality_of_paper: "",
      size: "",
      description: "",
      short_description: "",
      full_description: "",
      price: "",
      width: "",
      height: "",
      sqft_price: "",
      front_image_file: null,
      back_image_file: null,
      image_file: null,
      front_image_files: [],
      back_image_files: [],
      front_image_url: "",
      back_image_url: "",
      image_url: "",
    });
  };

  const buildPostcardForm = () => {
    const body = new FormData();
    const productPayload = {
      ...postcardForm,
      description: postcardForm.short_description || postcardForm.description || "",
    };

    Object.entries(productPayload).forEach(([key, value]) => {
      if (["front_image_file", "back_image_file", "image_file", "front_image_files", "back_image_files"].includes(key)) return;
      body.append(key, String(value ?? ""));
    });

    if (postcardForm.front_image_file) body.append("front_image", postcardForm.front_image_file);
    if (postcardForm.back_image_file) body.append("back_image", postcardForm.back_image_file);
    if (postcardForm.image_file) body.append("image", postcardForm.image_file);

    return body;
  };

  const handleSavePostcard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postcardForm.product_name.trim()) {
      toast.error("Product name is required");
      return;
    }

    try {
      await adminMultipartRequest("/admin/postcards/save", buildPostcardForm());
      toast.success("Postcard product saved");
      resetPostcardForm();
      fetchPostcards();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save postcard product");
    }
  };

  const handleEditPostcard = (item: any) => {
    setPostcardForm({
      id: String(item.id || ""),
      product_type: item.product_type || "postcard",
      product_name: item.product_name || "",
      quality_of_paper: item.quality_of_paper || "",
      size: item.size || "",
      description: item.description || item.short_description || "",
      short_description: item.short_description || item.description || "",
      full_description: item.full_description || "",
      price: String(item.price || ""),
      width: String(item.width || ""),
      height: String(item.height || ""),
      sqft_price: String(item.sqft_price || ""),
      front_image_file: null,
      back_image_file: null,
      image_file: null,
      front_image_files: [],
      back_image_files: [],
      front_image_url: item.front_image_url || "",
      back_image_url: item.back_image_url || "",
      image_url: item.image_url || "",
    });
  };

  const handleDeletePostcard = async (id: number) => {
    if (!window.confirm("Delete this postcard product?")) return;

    try {
      await adminRequest("/admin/postcards/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      toast.success("Postcard product deleted");
      fetchPostcards();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete postcard product");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex font-sans text-black overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-[120] w-[230px] bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-coolvetica text-3xl tracking-tighter uppercase leading-none text-gray-900">
                Muro
              </h2>

              <p className="text-[10px] text-gray-500 font-extrabold uppercase mt-1 tracking-widest">
                Admin
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-black"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <SideButton
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              icon={<Home size={17} />}
              label="Home Control"
            />

            <SideButton
              active={activeTab === "inventory"}
              onClick={() => setActiveTab("inventory")}
              icon={<LayoutDashboard size={17} />}
              label="Inventory"
            />

            <SideButton
              active={activeTab === "add"}
              onClick={() => {
                resetProductForm();
                setActiveTab("add");
              }}
              icon={<Plus size={17} />}
              label="Add Product"
            />

            <SideButton
              active={activeTab === "attributes"}
              onClick={() => setActiveTab("attributes")}
              icon={<Tags size={17} />}
              label="Attributes"
            />

            <SideButton
              active={activeTab === "offers"}
              onClick={() => setActiveTab("offers")}
              icon={<Tags size={17} />}
              label="Offers"
            />

            <SideButton
              active={activeTab === "coupons"}
              onClick={() => setActiveTab("coupons")}
              icon={<CreditCard size={17} />}
              label="Coupons"
            />

            <SideButton
              active={activeTab === "cutouts"}
              onClick={() => {
                resetPostcardForm();
                setPostcardForm((prev: any) => ({ ...prev, product_type: "cutout" }));
                setActiveTab("cutouts");
              }}
              icon={<ImagePlus size={17} />}
              label="CutOuts"
            />

            <SideButton
              active={activeTab === "postcards"}
              onClick={() => {
                resetPostcardForm();
                setPostcardForm((prev: any) => ({ ...prev, product_type: "postcard" }));
                setActiveTab("postcards");
              }}
              icon={<ImagePlus size={17} />}
              label="Postcards"
            />

            <SideButton
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              icon={<Package size={17} />}
              label="Orders"
            />
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-5 lg:px-9 shrink-0">
          <div className="flex items-center gap-4">
            <Menu
              size={22}
              className="lg:hidden cursor-pointer text-gray-800"
              onClick={() => setSidebarOpen(true)}
            />

            <h2 className="hidden md:block text-lg font-extrabold text-gray-800 uppercase tracking-widest">
              Dashboard
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 pb-20">
          {activeTab === "home" && renderHomeContent()}
          {activeTab === "inventory" && renderInventory()}
          {activeTab === "add" && renderAddProduct()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "attributes" && renderAttributes()}
          {activeTab === "offers" && renderOffers()}
          {activeTab === "coupons" && renderCoupons()}
          {activeTab === "cutouts" && renderCutouts()}
          {activeTab === "postcards" && renderPostcards()}
        </main>
      </div>
    </div>
  );


  function renderHomeContent() {
    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-widest">
              Home Page Control
            </h1>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
              Hero sliders, three image cards, new arrivals, postcards and cutouts
            </p>
          </div>

          <button
            type="button"
            onClick={fetchHomeContent}
            className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <form onSubmit={handleSaveHomeContent} className="space-y-8">
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <SectionTitle title="Hero Slider Images" />
            <p className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-widest">
              Upload exactly three hero images. The same three slides will show on the website home page.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {(homeContent.hero_slides || homeHeroDefaults()).map((slide, index) => (
                <div key={`hero-${index}`} className="rounded-3xl border border-gray-200 bg-gray-50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-800">
                      Hero Slide {index + 1}
                    </h3>
                  </div>

                  <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-white border border-gray-200">
                    {slide.preview_url || slide.image_url ? (
                      <img src={getFullImageUrl(slide.preview_url || slide.image_url)} alt={slide.title || `Hero ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        No Image
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateHomeHeroField(index, "image_file", e.target.files?.[0] || null)}
                    className="w-full text-xs font-bold text-gray-700"
                  />

                  <FormGroup
                    label="Title"
                    value={slide.title}
                    onChange={(e) => updateHomeHeroField(index, "title", e.target.value)}
                    placeholder="Art For Every Space."
                  />

                  <FormGroup
                    label="Subtitle"
                    value={slide.subtitle}
                    onChange={(e) => updateHomeHeroField(index, "subtitle", e.target.value)}
                    placeholder="Bring warmth into your room"
                  />

                  <FormGroup
                    label="Button Text"
                    value={slide.button_text}
                    onChange={(e) => updateHomeHeroField(index, "button_text", e.target.value)}
                    placeholder="Explore Posters →"
                  />

                  <FormGroup
                    label="Button Link"
                    value={slide.button_link}
                    onChange={(e) => updateHomeHeroField(index, "button_link", e.target.value)}
                    placeholder="/products"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <SectionTitle title="Three Home Image Cards" />
            <p className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-widest">
              These three cards replace the static New Arrivals / Kids Art Prints / Postcards images. The home page shows the button in the center-lower area.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {(homeContent.category_tiles || homeTileDefaults()).map((tile, index) => (
                <div key={`tile-${index}`} className="rounded-3xl border border-gray-200 bg-gray-50 p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-800">
                    Card {index + 1}
                  </h3>

                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-gray-200 relative">
                    {tile.preview_url || tile.image_url ? (
                      <img src={getFullImageUrl(tile.preview_url || tile.image_url)} alt={tile.title || `Card ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-[18%] flex justify-center px-5">
                      <span className="bg-white text-gray-900 rounded-full px-6 py-3 text-[11px] font-extrabold uppercase tracking-widest shadow-lg">
                        {tile.button_text || tile.title || "Explore"}
                      </span>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateHomeTileField(index, "image_file", e.target.files?.[0] || null)}
                    className="w-full text-xs font-bold text-gray-700"
                  />

                  <FormGroup
                    label="Label / Title"
                    value={tile.title}
                    onChange={(e) => updateHomeTileField(index, "title", e.target.value)}
                    placeholder="New Arrivals"
                  />

                  <FormGroup
                    label="Subtitle"
                    value={tile.subtitle}
                    onChange={(e) => updateHomeTileField(index, "subtitle", e.target.value)}
                    placeholder="New prints to refresh your walls"
                  />

                  <FormGroup
                    label="Button Text"
                    value={tile.button_text}
                    onChange={(e) => updateHomeTileField(index, "button_text", e.target.value)}
                    placeholder="Discover"
                  />

                  <FormGroup
                    label="Button Link"
                    value={tile.button_link}
                    onChange={(e) => updateHomeTileField(index, "button_link", e.target.value)}
                    placeholder="/postcards"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <SectionTitle title="Show These New Arrivals On Home" />
            <p className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-widest">
              Select the poster products that will appear in the New Arrivals section on the home page.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-2">
              {availableHomeProducts.length === 0 ? (
                <p className="text-sm font-bold text-gray-500">No poster products found.</p>
              ) : (
                availableHomeProducts.map((item) => {
                  const id = Number(getProductId(item) || 0);
                  const checked = (homeContent.featured_new_arrival_ids || []).includes(id);
                  const images = Array.isArray(item.product_images) ? item.product_images : [];
                  const firstUploaded = images.find((img: any) => img?.image_url)?.image_url || item.main_poster_url || item.image_url || "";
                  const prices = Array.isArray(item.size_prices) ? item.size_prices.map((size: any) => Number(size.price || 0)).filter((price: number) => price > 0) : [];
                  const price = prices.length > 0 ? Math.min(...prices) : Number(item.price || 0);

                  return (
                    <label key={`home-new-arrival-${id}`} className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer ${checked ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleHomeFeatured("new_arrival", id)}
                        className="h-5 w-5 accent-black"
                      />

                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {firstUploaded ? <img src={getFullImageUrl(firstUploaded)} alt={item.title || "Product"} className="w-full h-full object-cover" /> : null}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900 truncate">{item.title || "Product"}</p>
                        <p className="text-xs font-bold text-gray-500">{formatPrice(price)}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
              <SectionTitle title="Show These Postcards On Home" />
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                {availableHomePostcards.length === 0 ? (
                  <p className="text-sm font-bold text-gray-500">No postcards found.</p>
                ) : (
                  availableHomePostcards.map((item) => {
                    const id = Number(item.id || 0);
                    const checked = (homeContent.featured_postcard_ids || []).includes(id);
                    const img = getPostcardDisplayImage(item);

                    return (
                      <label key={`home-postcard-${id}`} className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer ${checked ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleHomeFeatured("postcard", id)}
                          className="h-5 w-5 accent-black"
                        />

                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {img ? <img src={getFullImageUrl(img)} alt={item.product_name || "Postcard"} className="w-full h-full object-cover" /> : null}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-gray-900 truncate">{item.product_name || "Postcard"}</p>
                          <p className="text-xs font-bold text-gray-500">{formatPrice(item.price || item.total_price)}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
              <SectionTitle title="Show These CutOuts On Home" />
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                {availableHomeCutouts.length === 0 ? (
                  <p className="text-sm font-bold text-gray-500">No cutouts found.</p>
                ) : (
                  availableHomeCutouts.map((item) => {
                    const id = Number(item.id || 0);
                    const checked = (homeContent.featured_cutout_ids || []).includes(id);
                    const img = getPostcardDisplayImage(item);

                    return (
                      <label key={`home-cutout-${id}`} className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer ${checked ? "border-black bg-gray-50" : "border-gray-200 bg-white"}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleHomeFeatured("cutout", id)}
                          className="h-5 w-5 accent-black"
                        />

                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {img ? <img src={getFullImageUrl(img)} alt={item.product_name || "CutOut"} className="w-full h-full object-cover" /> : null}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-gray-900 truncate">{item.product_name || "CutOut"}</p>
                          <p className="text-xs font-bold text-gray-500">{formatPrice(item.total_price || item.price)}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 z-20 flex justify-end">
            <button
              type="submit"
              className="bg-black text-white px-8 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 shadow-xl flex items-center gap-2"
            >
              <Save size={16} />
              Save Home Page
            </button>
          </div>
        </form>
      </section>
    );
  }

  function renderInventory() {
    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Catalogue
            </h1>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
              Products use master size prices from attributes
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetProductForm();
              setActiveTab("add");
            }}
            className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-7">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-gray-800" />

            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">
              Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search Keyword"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            />

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  category: e.target.value,
                  subcategory: "",
                  page: 1,
                })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={getCategoryId(c)} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filters.subcategory}
              onChange={(e) =>
                setFilters({ ...filters, subcategory: e.target.value, page: 1 })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            >
              <option value="">All Subcategories</option>
              {subcategories
                .filter((s) => {
                  if (!filters.category) return true;

                  const selectedCategory = categories.find(
                    (c) => c.name === filters.category
                  );

                  return (
                    s.category_name === filters.category ||
                    String(s.category_id) === String(getCategoryId(selectedCategory))
                  );
                })
                .map((s) => (
                  <option key={getSubcategoryId(s)} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.min_price}
              onChange={(e) =>
                setFilters({ ...filters, min_price: e.target.value, page: 1 })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.max_price}
              onChange={(e) =>
                setFilters({ ...filters, max_price: e.target.value, page: 1 })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value, page: 1 })
                }
                className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
              >
                <option value="latest">Latest</option>
                <option value="price_low">Low Price</option>
                <option value="price_high">High Price</option>
              </select>

              <button
                onClick={fetchAllData}
                className="bg-black text-white px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 transition-all"
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Product
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Master Sizes
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Base Price
                  </th>
                  <th className="px-5 py-4 text-right text-xs uppercase font-extrabold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-16 text-center animate-pulse text-sm font-bold text-gray-500"
                    >
                      Fetching data...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-16 text-center text-sm font-bold text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p: any) => {
                    const sizeList = Array.isArray(p.size_prices)
                      ? p.size_prices
                      : sizes;

                    return (
                      <tr
                        key={p.id}
                        className="group hover:bg-gray-50 transition-all"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4 min-w-[360px]">
                            <div className="w-12 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                              <img
                                src={getFullImageUrl(
                                  p.main_poster_url ||
                                    p.zoom_in_url ||
                                    p.wall_poster_url ||
                                    p.image_url
                                )}
                                alt={p.title}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div>
                              <span className="text-sm font-extrabold text-gray-900 block mb-1">
                                {p.title}
                              </span>

                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                                {p.category || "No Category"}{" "}
                                {p.subcategory ? `> ${p.subcategory}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {sizeList.length === 0 ? (
                            <span className="text-xs font-bold text-gray-400">
                              No master size
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2 max-w-[420px]">
                              {sizeList.slice(0, 4).map((sp: any, idx: number) => (
                                <span
                                  key={`${p.id}-${getSizeId(sp) || idx}`}
                                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-700"
                                >
                                  {sp.size_name || sp.name}
                                  <span className="text-gray-400">|</span>
                                  {formatPrice(sp.price)}
                                </span>
                              ))}

                              {sizeList.length > 4 && (
                                <span className="text-[10px] font-extrabold text-gray-400 px-2 py-1">
                                  +{sizeList.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-extrabold text-gray-900 whitespace-nowrap">
                          {formatPrice(p.price)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(p)}
                              className="p-2 bg-gray-100 text-gray-800 hover:bg-black hover:text-white rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 p-5 flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">
              Page {filters.page}
            </span>

            <div className="flex gap-3">
              <button
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 hover:bg-gray-100 disabled:opacity-50 uppercase tracking-widest"
                type="button"
              >
                Prev
              </button>

              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                className="px-5 py-2.5 bg-black rounded-xl text-xs font-extrabold text-white hover:bg-gray-800 uppercase tracking-widest"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderAddProduct() {
    return (
      <section className="w-full max-w-[1150px] mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="mb-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-widest">
              {editingProduct ? "Update Listing" : "Publish Listing"}
            </h1>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
              Only category, subcategory, descriptions and images
            </p>
          </div>

          {editingProduct && (
            <button
              type="button"
              onClick={resetProductForm}
              className="bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-100 flex items-center gap-2"
            >
              <X size={15} />
              Cancel Edit
            </button>
          )}
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
          <form onSubmit={handleSaveProduct} className="space-y-8">
            <div className="space-y-5">
              <SectionTitle title="Product Details" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectBox
                  label="Category"
                  value={formData.category}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      category: v,
                      subcategory: "",
                    })
                  }
                  items={categories}
                  placeholder="Select Category"
                />

                <SelectBox
                  label="Subcategory"
                  value={formData.subcategory}
                  onChange={(v) =>
                    setFormData({ ...formData, subcategory: v })
                  }
                  items={subcategories.filter((sub) => {
                    if (!formData.category) return true;

                    const selectedCategory = categories.find(
                      (cat) => cat.name === formData.category
                    );

                    return (
                      sub.category_name === formData.category ||
                      String(sub.category_id) ===
                        String(getCategoryId(selectedCategory))
                    );
                  })}
                  placeholder="Select Subcategory"
                />
              </div>

              <TextArea
                label="Short Description"
                value={formData.short_description}
                onChange={(value) =>
                  setFormData({ ...formData, short_description: value })
                }
                height="h-24"
              />

              <TextArea
                label="Full Description"
                value={formData.full_description}
                onChange={(value) =>
                  setFormData({ ...formData, full_description: value })
                }
                height="h-36"
              />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <SectionTitle title="Images" noMargin />

                <button
                  type="button"
                  onClick={addProductImageRow}
                  className="inline-flex items-center justify-center gap-2 text-xs uppercase font-extrabold text-blue-700 bg-blue-50 px-5 py-3 rounded-full hover:bg-blue-100"
                >
                  <ImagePlus size={16} />
                  Add Image Row
                </button>
              </div>

              <div className="space-y-4">
                {formData.product_images.map((row, index) => {
                  if (row.marked_delete) return null;

                  return (
                    <div
                      key={`${row.id || "new"}-${index}-${row.sort_order}`}
                      className="grid grid-cols-1 lg:grid-cols-[130px_1fr_1fr_auto] gap-4 items-end p-4 bg-gray-50 border border-gray-200 rounded-2xl"
                    >
                      <div className="w-full h-[130px] rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                        {row.preview_url || row.existing_url ? (
                          <img
                            src={
                              row.preview_url?.startsWith("blob:")
                                ? row.preview_url
                                : getFullImageUrl(row.preview_url || row.existing_url)
                            }
                            alt={row.image_title || "Preview"}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImagePlus className="text-gray-300" size={32} />
                        )}
                      </div>

                      <FormGroup
                        label="Image Title"
                        value={row.image_title}
                        onChange={(e) =>
                          handleProductImageTitleChange(index, e.target.value)
                        }
                        placeholder="Example: Front View / Room View"
                      />

                      <FileInput
                        label="Image"
                        onChange={(e) => handleProductImageFileChange(index, e)}
                      />

                      <button
                        type="button"
                        onClick={() => removeProductImageRow(index)}
                        disabled={visibleProductImages.length === 1}
                        className="p-4 text-red-500 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200 rounded-2xl disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-5 rounded-2xl text-xs font-extrabold uppercase tracking-[0.3em] shadow-xl hover:bg-gray-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {editingProduct ? <Save size={16} /> : <PlusCircle size={16} />}
              {isSubmitting
                ? editingProduct
                  ? "Updating..."
                  : "Publishing..."
                : editingProduct
                ? "Update Listing"
                : "Publish Final Listing"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  function renderOrders() {
    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Manage Orders
            </h1>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
              Paid orders, pending orders and delivery status
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <StatCard
            label="Orders"
            value={ordersPagination.total}
            icon={<Package size={20} />}
          />

          <StatCard
            label="Visible Amount"
            value={formatPrice(totalOrderAmount)}
            icon={<CreditCard size={20} />}
          />

          <StatCard
            label="Page"
            value={`${ordersPagination.page}/${ordersPagination.pages || 1}`}
            icon={<Truck size={20} />}
          />
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-7">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-gray-800" />

            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">
              Order Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search order, name, phone, email"
              value={orderFilters.search}
              onChange={(e) =>
                setOrderFilters({
                  ...orderFilters,
                  search: e.target.value,
                  page: 1,
                })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            />

            <select
              value={orderFilters.payment_status}
              onChange={(e) =>
                setOrderFilters({
                  ...orderFilters,
                  payment_status: e.target.value,
                  page: 1,
                })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            >
              <option value="">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={orderFilters.order_status}
              onChange={(e) =>
                setOrderFilters({
                  ...orderFilters,
                  order_status: e.target.value,
                  page: 1,
                })
              }
              className="border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            >
              <option value="">All Order Status</option>
              <option value="PENDING">Pending</option>
              <option value="PLACED">Placed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              type="button"
              onClick={fetchOrders}
              className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800"
            >
              Apply Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1050px]">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Order
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Payment
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Order Status
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Items
                  </th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">
                    Date
                  </th>
                  <th className="px-5 py-4 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-16 text-center animate-pulse text-sm font-bold text-gray-500"
                    >
                      Fetching orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-16 text-center text-sm font-bold text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-gray-50 transition-all"
                    >
                      <td className="px-5 py-5">
                        <span className="text-sm font-extrabold text-gray-900 block">
                          {order.order_no}
                        </span>

                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          ID: {order.id}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="text-sm font-extrabold text-gray-900 block">
                          {order.shipping_name || "Customer"}
                        </span>

                        <span className="text-xs font-bold text-gray-500 block">
                          {order.shipping_phone || "-"}
                        </span>

                        <span className="text-xs font-bold text-gray-500 block">
                          {order.shipping_email || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="text-sm font-extrabold text-gray-900 block">
                          {formatPrice(order.total_amount)}
                        </span>

                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Cart: {formatPrice(order.subtotal)}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${getStatusClass(
                            order.payment_status
                          )}`}
                        >
                          <CreditCard size={12} />
                          {order.payment_status || "PENDING"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <select
                          value={order.order_status || "PENDING"}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className={`border px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest outline-none ${getStatusClass(
                            order.order_status
                          )}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PLACED">Placed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-5 py-5 text-sm font-extrabold text-gray-900">
                        {order.item_count || 0}
                      </td>

                      <td className="px-5 py-5 text-xs font-bold text-gray-500 uppercase">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openOrderDetail(order.id)}
                          className="inline-flex items-center gap-2 bg-black text-white px-4 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-gray-800"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 p-5 flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">
              Page {ordersPagination.page} of {ordersPagination.pages || 1}
            </span>

            <div className="flex gap-3">
              <button
                disabled={orderFilters.page === 1}
                onClick={() =>
                  setOrderFilters({
                    ...orderFilters,
                    page: Math.max(1, orderFilters.page - 1),
                  })
                }
                className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 hover:bg-gray-100 disabled:opacity-50 uppercase tracking-widest"
                type="button"
              >
                Prev
              </button>

              <button
                disabled={orderFilters.page >= ordersPagination.pages}
                onClick={() =>
                  setOrderFilters({
                    ...orderFilters,
                    page: orderFilters.page + 1,
                  })
                }
                className="px-5 py-2.5 bg-black rounded-xl text-xs font-extrabold text-white hover:bg-gray-800 disabled:opacity-50 uppercase tracking-widest"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {selectedOrder && (
          <OrderDetailModal
            selectedOrder={selectedOrder}
            orderDetailLoading={orderDetailLoading}
            onClose={() => setSelectedOrder(null)}
            updateOrderStatus={updateOrderStatus}
          />
        )}
      </section>
    );
  }


  function renderOffers() {
    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Festival Offers</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
              Maximum 3 active offers are allowed for the website
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveOffer} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-7 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <FormGroup
            label="Offer Label"
            value={offerForm.label}
            onChange={(e) => setOfferForm({ ...offerForm, label: e.target.value })}
            placeholder="Diwali Sale"
          />

          <FormGroup
            label="Discount %"
            type="number"
            value={offerForm.discount_percent}
            onChange={(e) => setOfferForm({ ...offerForm, discount_percent: e.target.value })}
            placeholder="20"
          />

          <FormGroup
            label="From Date"
            type="date"
            value={offerForm.from_date}
            onChange={(e) => setOfferForm({ ...offerForm, from_date: e.target.value })}
          />

          <FormGroup
            label="To Date"
            type="date"
            value={offerForm.to_date}
            onChange={(e) => setOfferForm({ ...offerForm, to_date: e.target.value })}
          />

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Status</label>
            <select
              value={offerForm.is_active}
              onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-black"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800">
            {offerForm.id ? "Update" : "Save"}
          </button>
        </form>

        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Label</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Discount</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">From</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">To</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Status</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{offer.label}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{offer.discount_percent}%</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{formatDate(offer.from_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{formatDate(offer.to_date)}</td>
                    <td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${Number(offer.is_active) === 1 ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{Number(offer.is_active) === 1 ? "Active" : "Inactive"}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleEditOffer(offer)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><Edit size={15} /></button>
                        <button type="button" onClick={() => handleDeleteOffer(Number(offer.id))} className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderCoupons() {
    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Coupons</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
            Generate coupon numbers, discount percentage and track used coupons
          </p>
        </div>

        <form onSubmit={handleGenerateCoupons} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-7 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormGroup
            label="Coupon Quantity (Max 60)"
            type="number"
            value={couponForm.quantity}
            onChange={(e) => setCouponForm({ ...couponForm, quantity: e.target.value })}
            placeholder="10"
          />

          <FormGroup
            label="Discount %"
            type="number"
            value={couponForm.discount_percent}
            onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })}
            placeholder="15"
          />

          <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800">
            Generate Coupons
          </button>
        </form>

        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Coupon Code</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Discount</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Status</th>
                  <th className="px-5 py-4 text-xs uppercase font-extrabold text-gray-800">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className={Number(coupon.is_used) === 1 ? "bg-gray-950 text-white" : "bg-white"}>
                    <td className="px-5 py-4 text-sm font-extrabold tracking-widest">{coupon.code}</td>
                    <td className="px-5 py-4 text-sm">{coupon.discount_percent}%</td>
                    <td className="px-5 py-4 text-sm font-bold uppercase">{Number(coupon.is_used) === 1 ? "Used" : "Available"}</td>
                    <td className="px-5 py-4 text-sm">{coupon.used_at ? formatDate(coupon.used_at) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function getPostcardItems(type: "postcard" | "cutout") {
    return postcards.filter((item) => {
      const productType = String(item.product_type || "postcard").toLowerCase();
      if (type === "cutout") return productType === "cutout" || productType === "sqft";
      return productType === "postcard";
    });
  }

  const getPostcardFrontFiles = (): File[] => {
    const files = Array.isArray(postcardForm.front_image_files)
      ? postcardForm.front_image_files.filter(Boolean)
      : [];

    if (files.length > 0) return files;
    return postcardForm.front_image_file ? [postcardForm.front_image_file] : [];
  };

  const getPostcardBackFiles = (): File[] => {
    const files = Array.isArray(postcardForm.back_image_files)
      ? postcardForm.back_image_files.filter(Boolean)
      : [];

    if (files.length > 0) return files;
    return postcardForm.back_image_file ? [postcardForm.back_image_file] : [];
  };

  const buildSeparatedProductForm = (
    type: "postcard" | "cutout",
    files: {
      frontFile?: File | null;
      backFile?: File | null;
      imageFile?: File | null;
    } = {}
  ) => {
    const body = new FormData();
    const productPayload = {
      ...postcardForm,
      product_type: type,
      description: postcardForm.short_description || postcardForm.description || "",
    };

    Object.entries(productPayload).forEach(([key, value]) => {
      if (["front_image_file", "back_image_file", "image_file", "front_image_files", "back_image_files"].includes(key)) return;
      body.append(key, String(value ?? ""));
    });

    if (type === "postcard") {
      if (files.frontFile) body.append("front_image", files.frontFile);
      if (files.backFile) body.append("back_image", files.backFile);
    } else if (files.imageFile) {
      body.append("image", files.imageFile);
    }

    return body;
  };

  async function saveSeparatedProduct(e: React.FormEvent, type: "postcard" | "cutout") {
    e.preventDefault();

    if (!postcardForm.product_name.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === "postcard" && !postcardForm.id) {
        const frontFiles = getPostcardFrontFiles();
        const backFiles = getPostcardBackFiles();
        const uploadCount = Math.max(frontFiles.length, backFiles.length, 1);

        const requests = Array.from({ length: uploadCount }, (_, index) => {
          const frontFile = frontFiles[index] || (frontFiles.length === 1 ? frontFiles[0] : null);
          const backFile = backFiles[index] || (backFiles.length === 1 ? backFiles[0] : null);

          return adminMultipartRequest(
            "/admin/postcards/save",
            buildSeparatedProductForm("postcard", { frontFile, backFile })
          );
        });

        await Promise.all(requests);
        toast.success(uploadCount > 1 ? `${uploadCount} postcard products saved` : "Postcard product saved");
      } else {
        await adminMultipartRequest(
          type === "cutout" ? "/admin/cutouts/save" : "/admin/postcards/save",
          buildSeparatedProductForm(type, {
            frontFile: postcardForm.front_image_file,
            backFile: postcardForm.back_image_file,
            imageFile: postcardForm.image_file,
          })
        );

        toast.success(type === "cutout" ? "CutOut product saved" : "Postcard product saved");
      }

      resetPostcardForm();
      setPostcardForm((prev: any) => ({ ...prev, product_type: type }));
      fetchPostcards();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderCutouts() {
    const cutoutItems = getPostcardItems("cutout");
    const totalSqftPrice =
      Number(postcardForm.width || 0) *
      Number(postcardForm.height || 0) *
      Number(postcardForm.sqft_price || 0);

    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">CutOut Products</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
            Upload cutout images separately. These products show only in the CutOuts section.
          </p>
        </div>

        <form
          onSubmit={(e) => saveSeparatedProduct(e, "cutout")}
          className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-7 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormGroup
              label="Product Name"
              value={postcardForm.product_name}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", product_name: e.target.value })}
            />
            <FormGroup
              label="Width(ft)"
              type="number"
              value={postcardForm.width}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", width: e.target.value })}
            />
            <FormGroup
              label="length"
              type="number"
              value={postcardForm.height}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", height: e.target.value })}
            />
            <FormGroup
              label="Sqft Price"
              type="number"
              value={postcardForm.sqft_price}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", sqft_price: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup
              label="Manual Price"
              type="number"
              value={postcardForm.price}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", price: e.target.value })}
            />
            <FormGroup
              label="Size Label"
              value={postcardForm.size}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", size: e.target.value })}
            />
            <FileInput
              label="CutOut Image"
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "cutout", image_file: e.target.files?.[0] || null })}
            />
          </div>

          <TextArea
            label="Short Description"
            value={postcardForm.short_description}
            onChange={(value) =>
              setPostcardForm({
                ...postcardForm,
                product_type: "cutout",
                short_description: value,
                description: value,
              })
            }
            height="h-24"
          />

          <TextArea
            label="Long Description"
            value={postcardForm.full_description}
            onChange={(value) =>
              setPostcardForm({
                ...postcardForm,
                product_type: "cutout",
                full_description: value,
              })
            }
            height="h-36"
          />

          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm font-bold text-gray-900">
            Calculated Price: {formatPrice(totalSqftPrice || postcardForm.price || 0)}
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800">
              {postcardForm.id ? "Update CutOut" : "Save CutOut"}
            </button>
            {postcardForm.id && (
              <button
                type="button"
                onClick={() => {
                  resetPostcardForm();
                  setPostcardForm((prev: any) => ({ ...prev, product_type: "cutout" }));
                }}
                className="bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cutoutItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50">
                {(item.image_url || item.front_image_url) && (
                  <img
                    src={getFullImageUrl(item.image_url || item.front_image_url)}
                    alt={item.product_name}
                    className="w-full h-56 object-contain bg-white rounded-2xl"
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.product_name}</h3>
                  <span className="text-xs uppercase font-extrabold text-gray-500">CutOut</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{item.short_description || item.description}</p>
                <p className="text-sm font-bold text-gray-900">{formatPrice(item.total_price || item.price)}</p>
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => handleEditPostcard({ ...item, product_type: "cutout" })} className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-extrabold uppercase">Edit</button>
                  <button type="button" onClick={() => handleDeletePostcard(Number(item.id))} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-extrabold uppercase">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderPostcards() {
    const postcardItems = getPostcardItems("postcard");
    const selectedFrontCount = getPostcardFrontFiles().length;
    const selectedBackCount = getPostcardBackFiles().length;
    const bulkPostcardUploadCount = postcardForm.id ? 1 : Math.max(selectedFrontCount, selectedBackCount, 1);
    const isBulkPostcardReady = !postcardForm.id && bulkPostcardUploadCount > 1;

    return (
      <section className="w-full max-w-none animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Postcard Products</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
            Upload postcard products separately. These products show only in the Postcards section.
          </p>
        </div>

        <form
          onSubmit={(e) => saveSeparatedProduct(e, "postcard")}
          className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-7 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormGroup
              label="Product Name"
              value={postcardForm.product_name}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "postcard", product_name: e.target.value })}
            />
            <FormGroup
              label="Price"
              type="number"
              value={postcardForm.price}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "postcard", price: e.target.value })}
            />
            <FormGroup
              label="Size"
              value={postcardForm.size}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "postcard", size: e.target.value })}
            />
            <FormGroup
              label="Quality Of Paper"
              value={postcardForm.quality_of_paper}
              onChange={(e) => setPostcardForm({ ...postcardForm, product_type: "postcard", quality_of_paper: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileInput
              label={postcardForm.id ? "Front Image" : "Front Images"}
              multiple={!postcardForm.id}
              helperText={!postcardForm.id ? "Select multiple front images to create postcard variations in one save." : undefined}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setPostcardForm({
                  ...postcardForm,
                  product_type: "postcard",
                  front_image_file: files[0] || null,
                  front_image_files: files,
                });
              }}
            />
            <FileInput
              label={postcardForm.id ? "Back Image" : "Back Images"}
              multiple={!postcardForm.id}
              helperText={!postcardForm.id ? "If one back image is selected, it will be used with all selected front images. Multiple back images are paired by order." : undefined}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setPostcardForm({
                  ...postcardForm,
                  product_type: "postcard",
                  back_image_file: files[0] || null,
                  back_image_files: files,
                });
              }}
            />
          </div>

          {isBulkPostcardReady && (
            <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-bold uppercase tracking-widest text-green-700">
              Bulk Upload Ready: {bulkPostcardUploadCount} postcard variations will be created with the same product name.
            </div>
          )}

          <TextArea
            label="Short Description"
            value={postcardForm.short_description}
            onChange={(value) =>
              setPostcardForm({
                ...postcardForm,
                product_type: "postcard",
                short_description: value,
                description: value,
              })
            }
            height="h-24"
          />

          <TextArea
            label="Long Description"
            value={postcardForm.full_description}
            onChange={(value) =>
              setPostcardForm({
                ...postcardForm,
                product_type: "postcard",
                full_description: value,
              })
            }
            height="h-36"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : postcardForm.id
                ? "Update Postcard"
                : bulkPostcardUploadCount > 1
                ? `Save ${bulkPostcardUploadCount} Postcards`
                : "Save Postcard"}
            </button>
            {postcardForm.id && (
              <button
                type="button"
                onClick={() => {
                  resetPostcardForm();
                  setPostcardForm((prev: any) => ({ ...prev, product_type: "postcard" }));
                }}
                className="bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-gray-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {postcardItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50">
                {(item.front_image_url || item.image_url) && (
                  <img src={getFullImageUrl(item.front_image_url || item.image_url)} alt={item.product_name} className="w-full h-40 object-contain bg-white rounded-2xl" />
                )}
                {item.back_image_url && (
                  <img src={getFullImageUrl(item.back_image_url)} alt={`${item.product_name} back`} className="w-full h-40 object-contain bg-white rounded-2xl" />
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.product_name}</h3>
                  <span className="text-xs uppercase font-extrabold text-gray-500">Postcard</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{item.short_description || item.description}</p>
                <p className="text-sm font-bold text-gray-900">{formatPrice(item.total_price || item.price)}</p>
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => handleEditPostcard({ ...item, product_type: "postcard" })} className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-extrabold uppercase">Edit</button>
                  <button type="button" onClick={() => handleDeletePostcard(Number(item.id))} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-extrabold uppercase">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function renderAttributes() {
    return (
      <section className="w-full max-w-none space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-widest text-gray-900 mb-8">
          Manage Attributes
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <AttributeBox
            title="Categories"
            items={categories}
            getMain={(i) => i.name}
            getSub={() => ""}
            onEdit={(i) => {
              setEditingCategory(i);
              setNewCatName(i.name);
            }}
            onDelete={(id) => handleDeleteCategory(id)}
            form={
              <CategoryForm
                editing={!!editingCategory}
                value={newCatName}
                setValue={setNewCatName}
                onSubmit={handleSaveCategory}
                onCancel={() => {
                  setEditingCategory(null);
                  setNewCatName("");
                }}
              />
            }
          />

          <AttributeBox
            title="Subcategories"
            items={subcategories}
            getMain={(i) => i.name}
            getSub={(i) => i.category_name || ""}
            onEdit={(i) => {
              setEditingSubcat(i);
              setNewSubcatName(i.name);
              setSelectedCatIdForSub(String(i.category_id || ""));
            }}
            onDelete={(id) => handleDeleteSubcategory(id)}
            form={
              <SubcategoryForm
                editing={!!editingSubcat}
                categories={categories}
                selectedCatIdForSub={selectedCatIdForSub}
                setSelectedCatIdForSub={setSelectedCatIdForSub}
                value={newSubcatName}
                setValue={setNewSubcatName}
                onSubmit={handleSaveSubcategory}
                onCancel={() => {
                  setEditingSubcat(null);
                  setNewSubcatName("");
                  setSelectedCatIdForSub("");
                }}
              />
            }
          />

          <AttributeBox
            title="Sizes"
            items={sizes}
            getMain={(i) => i.name}
            getSub={(i) => formatPrice(i.price)}
            onEdit={(i) => {
              setEditingSize(i);
              setNewSize({
                name: i.name || "",
                price: String(i.price || ""),
              });
            }}
            onDelete={(id) => handleDeleteSize(id)}
            form={
              <SizeForm
                editing={!!editingSize}
                value={newSize}
                setValue={setNewSize}
                onSubmit={handleSaveSize}
                onCancel={() => {
                  setEditingSize(null);
                  setNewSize({
                    name: "",
                    price: "",
                  });
                }}
              />
            }
          />
        </div>
      </section>
    );
  }
};

const SideButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-4 px-6 py-4 rounded-2xl text-xs font-extrabold uppercase ${
      active
        ? "bg-black text-white"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {icon}
    {label}
  </button>
);

const SectionTitle = ({
  title,
  noMargin = false,
}: {
  title: string;
  noMargin?: boolean;
}) => (
  <h3
    className={`text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-3 text-gray-900 ${
      noMargin ? "" : "mb-5"
    }`}
  >
    {title}
  </h3>
);

const FormGroup = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-2">
    <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900"
    />
  </div>
);

const SelectBox = ({
  label,
  value,
  onChange,
  items,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: any[];
  placeholder: string;
}) => (
  <div className="space-y-2">
    <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">
      {label}
    </label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm font-semibold text-gray-900 cursor-pointer"
    >
      <option value="">{placeholder}</option>

      {items.map((item) => (
        <option
          key={item.id || item.category_id || item.subcategory_id}
          value={item.name}
        >
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

const FileInput = ({
  label,
  onChange,
  multiple = false,
  helperText = "",
}: {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">
      {label}
    </label>

    <input
      type="file"
      accept="image/*"
      multiple={multiple}
      onChange={onChange}
      className="w-full bg-white border border-gray-300 p-3.5 rounded-2xl text-xs font-semibold text-gray-900 cursor-pointer"
    />

    {helperText && <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{helperText}</p>}
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  height,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  height: string;
}) => (
  <div className="space-y-2">
    <label className="text-xs uppercase font-extrabold text-gray-800 tracking-widest">
      {label}
    </label>

    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-white border border-gray-300 p-4 rounded-2xl outline-none focus:ring-2 ring-black/5 text-sm ${height} resize-none font-semibold text-gray-900`}
    />
  </div>
);

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
    <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
      {icon}
    </div>

    <p className="text-xs uppercase tracking-widest font-extrabold text-gray-500 mb-1">
      {label}
    </p>

    <p className="text-2xl font-extrabold text-gray-900">{value}</p>
  </div>
);

const AttributeBox = ({
  title,
  items,
  getMain,
  getSub,
  onEdit,
  onDelete,
  form,
}: {
  title: string;
  items: any[];
  getMain: (item: any) => string;
  getSub: (item: any) => string;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  form: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[580px]">
    <h3 className="text-xs font-extrabold tracking-[0.2em] uppercase border-b border-gray-200 pb-4 mb-4 shrink-0 text-gray-900">
      {title}
    </h3>

    <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 no-scrollbar">
      {items.map((item) => {
        const id =
          item.id || item.category_id || item.subcategory_id || item.size_id;
        const subText = getSub(item);

        return (
          <div
            key={id}
            className="group bg-gray-50 hover:bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 hover:border-black transition-all"
          >
            <div>
              <span className="text-sm font-extrabold uppercase text-gray-900 block">
                {getMain(item)}
              </span>

              {subText ? (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {subText}
                </span>
              ) : null}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="p-2 bg-gray-200 hover:bg-black hover:text-white rounded-md"
              >
                <Edit size={14} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(Number(id))}
                className="p-2 bg-gray-200 hover:bg-red-500 hover:text-white rounded-md"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {form}
  </div>
);

const CategoryForm = ({
  editing,
  value,
  setValue,
  onSubmit,
  onCancel,
}: any) => (
  <form
    onSubmit={onSubmit}
    className="flex flex-col gap-3 mt-auto shrink-0 border-t border-gray-200 pt-6"
  >
    <input
      required
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={editing ? "Update category" : "New category"}
      className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900"
    />

    <div className="flex gap-2">
      <button
        type="submit"
        className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold"
      >
        {editing ? "Update" : "Add"}
      </button>

      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest"
        >
          Cancel
        </button>
      )}
    </div>
  </form>
);

const SubcategoryForm = ({
  editing,
  categories,
  selectedCatIdForSub,
  setSelectedCatIdForSub,
  value,
  setValue,
  onSubmit,
  onCancel,
}: any) => (
  <form
    onSubmit={onSubmit}
    className="space-y-3 mt-auto shrink-0 border-t border-gray-200 pt-6"
  >
    <select
      required
      value={selectedCatIdForSub}
      onChange={(e) => setSelectedCatIdForSub(e.target.value)}
      className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold cursor-pointer outline-none text-gray-900"
    >
      <option value="">Select Parent Category</option>
      {categories.map((c: any) => (
        <option key={getCategoryId(c)} value={getCategoryId(c)}>
          {c.name}
        </option>
      ))}
    </select>

    <input
      required
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={editing ? "Update subcategory" : "New subcategory"}
      className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900"
    />

    <div className="flex gap-2">
      <button
        type="submit"
        className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold"
      >
        {editing ? "Update" : "Add"}
      </button>

      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest"
        >
          Cancel
        </button>
      )}
    </div>
  </form>
);

const SizeForm = ({
  editing,
  value,
  setValue,
  onSubmit,
  onCancel,
}: any) => (
  <form
    onSubmit={onSubmit}
    className="space-y-3 mt-auto shrink-0 border-t border-gray-200 pt-6"
  >
    <input
      required
      value={value.name}
      onChange={(e) => setValue({ ...value, name: e.target.value })}
      placeholder="Size"
      className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900"
    />

    <input
      required
      type="number"
      value={value.price}
      onChange={(e) => setValue({ ...value, price: e.target.value })}
      placeholder="Price"
      className="w-full bg-white border border-gray-300 p-4 rounded-xl text-xs font-extrabold outline-none focus:border-black text-gray-900"
    />

    <div className="flex gap-2">
      <button
        type="submit"
        className="flex-1 bg-black text-white py-4 rounded-xl text-[11px] tracking-[0.2em] uppercase font-extrabold"
      >
        {editing ? "Update" : "Add"}
      </button>

      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 bg-red-50 text-red-600 rounded-xl text-[11px] font-extrabold uppercase tracking-widest"
        >
          Cancel
        </button>
      )}
    </div>
  </form>
);

const OrderDetailModal = ({
  selectedOrder,
  orderDetailLoading,
  onClose,
  updateOrderStatus,
}: {
  selectedOrder: any;
  orderDetailLoading: boolean;
  onClose: () => void;
  updateOrderStatus: (orderId: number, orderStatus: string) => void;
}) => (
  <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Order Bill
          </h2>

          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
            {selectedOrder.order_no}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-xl"
        >
          <X size={18} />
        </button>
      </div>

      {orderDetailLoading ? (
        <div className="p-20 text-center text-sm font-bold text-gray-500">
          Loading bill...
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoBox title="Customer">
              <p className="text-sm font-extrabold text-gray-900">
                {selectedOrder.shipping_name || "-"}
              </p>

              <p className="text-xs font-bold text-gray-500 mt-1">
                {selectedOrder.shipping_phone || "-"}
              </p>

              <p className="text-xs font-bold text-gray-500">
                {selectedOrder.shipping_email || "-"}
              </p>
            </InfoBox>

            <InfoBox title="Payment">
              <p className="text-sm font-extrabold text-gray-900">
                {selectedOrder.payment_status || "-"}
              </p>

              <p className="text-xs font-bold text-gray-500 mt-1 break-all">
                {selectedOrder.razorpay_payment_id || "-"}
              </p>
            </InfoBox>

            <InfoBox title="Delivery">
              <select
                value={selectedOrder.order_status || "PENDING"}
                onChange={(e) =>
                  updateOrderStatus(selectedOrder.id, e.target.value)
                }
                className={`border px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest outline-none ${getStatusClass(
                  selectedOrder.order_status
                )}`}
              >
                <option value="PENDING">Pending</option>
                <option value="PLACED">Placed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <p className="text-xs font-bold text-gray-500 mt-2">
                {selectedOrder.shipping_city || "-"},{" "}
                {selectedOrder.shipping_state || "-"}
              </p>
            </InfoBox>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest">
                    Product
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest">
                    Size
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-center">
                    Qty
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-right">
                    Price
                  </th>
                  <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-right">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {(selectedOrder.items || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-sm font-bold text-gray-500"
                    >
                      No items found.
                    </td>
                  </tr>
                ) : (
                  selectedOrder.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-16 bg-gray-100 rounded-xl overflow-hidden">
                            <img
                              src={getFullImageUrl(item.image_url)}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <span className="text-sm font-extrabold text-gray-900">
                            {item.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-xs font-bold text-gray-500 uppercase">
                        {item.size_name || item.size_code || "-"}
                      </td>

                      <td className="px-5 py-5 text-center font-bold">
                        {item.qty}
                      </td>

                      <td className="px-5 py-5 text-right font-bold">
                        {formatPrice(item.price)}
                      </td>

                      <td className="px-5 py-5 text-right font-extrabold">
                        {formatPrice(item.line_total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-500">Cart Total</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>

              {Number(selectedOrder.sgst_amount || 0) > 0 && (
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-500">SGST</span>
                  <span>{formatPrice(selectedOrder.sgst_amount)}</span>
                </div>
              )}

              {Number(selectedOrder.cgst_amount || 0) > 0 && (
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-500">CGST</span>
                  <span>{formatPrice(selectedOrder.cgst_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-extrabold border-t border-gray-200 pt-3">
                <span>Paid Amount</span>
                <span>{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const InfoBox = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
      {title}
    </p>

    {children}
  </div>
);

export default AdminDashboard;
