const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const API = {
  // --- PRODUCTS ---
  getProducts: async () => {
    const res = await fetch(`${BASE_URL}/products`, { method: "GET", headers: { "Accept": "application/json" }});
    return res.json();
  },
  adminCreateProduct: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/products/create`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminUpdateProduct: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/products/update`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },
  adminDeleteProduct: async (payload: { product_id: number }) => {
    const res = await fetch(`${BASE_URL}/admin/products/delete`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) });
    return res.json();
  },

  // --- CART APIs ---
  getCart: async () => {
    const res = await fetch(`${BASE_URL}/cart`, { method: "GET", headers: getAuthHeaders() });
    return res.json();
  },
  addToCart: async (payload: { product_id: number, qty: number }) => {
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
  // ... (baaki functions same rahenge)
  adminUpdateOrderStatus: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/admin/orders/status`, { 
      method: "POST", 
      headers: getAuthHeaders(), 
      body: JSON.stringify(payload) 
    });
    return res.json();
  }
};