const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers: any = {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
  // Agar FormData bhej rahe ho toh browser ko Content-Type khud set karne do
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

export const API = {
  // --- PRODUCTS ---
  getProducts: async () => {
    const res = await fetch(`${BASE_URL}/products`, { method: "GET", headers: { "Accept": "application/json" }});
    return res.json();
  },
  adminGetProducts: async (params: any = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "" && v !== null));
    const queryString = new URLSearchParams(cleanParams as any).toString();
    const res = await fetch(`${BASE_URL}/admin/products/list?${queryString}`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  adminCreateProduct: async (payload: FormData) => {
    const res = await fetch(`${BASE_URL}/admin/products/create`, { method: "POST", headers: getAuthHeaders(true), body: payload });
    return res.json();
  },
  adminUpdateProduct: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/products/update`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminDeleteProduct: async (payload: FormData) => {
    const res = await fetch(`${BASE_URL}/admin/products/delete`, { method: "POST", headers: getAuthHeaders(true), body: payload });
    return res.json();
  },

  // --- CATEGORIES ---
  adminGetCategories: async () => {
    const res = await fetch(`${BASE_URL}/admin/categories/list`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  adminCreateCategory: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/categories/create`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminUpdateCategory: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/categories/update`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminDeleteCategory: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/categories/delete`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },

  // --- SUBCATEGORIES ---
  adminGetSubcategories: async () => {
    const res = await fetch(`${BASE_URL}/admin/subcategories/list`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  adminCreateSubcategory: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/subcategories/create`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminUpdateSubcategory: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/subcategories/update`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminDeleteSubcategory: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/subcategories/delete`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },

  // --- SIZES ---
  adminGetSizes: async () => {
    const res = await fetch(`${BASE_URL}/admin/sizes/list`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  adminCreateSize: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/sizes/create`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminUpdateSize: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/sizes/update`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminDeleteSize: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/sizes/delete`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },

  // --- CART ---
  getCart: async () => {
    const res = await fetch(`${BASE_URL}/cart`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  addToCart: async (payload: { product_id: number, qty: number, size_id?: number }) => {
    const res = await fetch(`${BASE_URL}/cart/add`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  updateCart: async (payload: { product_id: number, qty: number }) => {
    const res = await fetch(`${BASE_URL}/cart/update`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  removeFromCart: async (payload: { product_id: number }) => {
    const res = await fetch(`${BASE_URL}/cart/remove`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },

  // --- ORDERS ---
  userCreateOrder: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/orders/create`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminGetOrders: async () => {
    const res = await fetch(`${BASE_URL}/admin/orders`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  adminUpdateOrderStatus: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/orders/status`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  }
};