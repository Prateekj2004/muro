// Base URL directly .env file se uthaya ja raha hai
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to handle tokens and common headers
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); 
  
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // If sending FormData (like for image uploads), remove Content-Type so browser sets it with boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "API request failed");
  }

  return data;
}

export const API = {
  // --- AUTH APIs ---
  login: async (credentials: any) => fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  signup: async (userData: any) => fetchAPI("/auth/signup", { method: "POST", body: JSON.stringify(userData) }),
  getMe: async () => fetchAPI("/auth/me", { method: "GET" }),

  // --- PRODUCT APIs ---
  getProducts: async () => fetchAPI("/products", { method: "GET" }),
  getProductDetail: async (id: number | string) => fetchAPI(`/products/${id}`, { method: "GET" }),

  // --- CART APIs ---
  addToCart: async (productId: number | string, qty: number) => fetchAPI("/cart/add", { method: "POST", body: JSON.stringify({ productId, qty }) }),
  updateCartQty: async (productId: number | string, qty: number) => fetchAPI("/cart/update", { method: "POST", body: JSON.stringify({ productId, qty }) }),
  removeFromCart: async (productId: number | string) => fetchAPI("/cart/remove", { method: "POST", body: JSON.stringify({ productId }) }),
  clearCart: async () => fetchAPI("/cart/clear", { method: "POST", body: JSON.stringify({}) }),
  getCart: async () => fetchAPI("/cart", { method: "GET" }),

  // --- ORDER APIs ---
  createOrder: async (shippingDetails: any) => fetchAPI("/orders/create", { method: "POST", body: JSON.stringify(shippingDetails) }),
  getMyOrders: async () => fetchAPI("/orders", { method: "GET" }),
  getOrderDetail: async (id: number | string) => fetchAPI(`/orders/${id}`, { method: "GET" }),

  // --- ADMIN APIs ---
  adminCreateProduct: async (productData: any) => fetchAPI("/admin/products/create", { method: "POST", body: JSON.stringify(productData) }),
  adminUpdateProduct: async (productData: any) => fetchAPI("/admin/products/update", { method: "POST", body: JSON.stringify(productData) }),
  adminDeleteProduct: async (id: number) => fetchAPI("/admin/products/delete", { method: "POST", body: JSON.stringify({ id }) }),
  adminGetOrders: async () => fetchAPI("/admin/orders", { method: "GET" }),
  adminUpdateOrderStatus: async (data: any) => fetchAPI("/admin/orders/status", { method: "POST", body: JSON.stringify(data) })
};