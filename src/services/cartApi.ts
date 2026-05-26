const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    ""
  );
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Cart API failed");
  }

  return data;
};

export const cartApi = {
  getCart: () => {
    return request("/cart", {
      method: "GET",
    });
  },

  addItem: (payload: { product_id: string | number; qty: number }) => {
    return request("/cart/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateQty: (payload: { product_id: string | number; qty: number }) => {
    return request("/cart/update", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  removeItem: (payload: { product_id: string | number }) => {
    return request("/cart/remove", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  clearCart: () => {
    return request("/cart/clear", {
      method: "POST",
    });
  },
};