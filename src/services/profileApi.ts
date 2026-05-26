const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getToken = () => {
  const user = getSavedUser();

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    user?.token ||
    user?.access_token ||
    user?.authToken ||
    ""
  );
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

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
    throw new Error(data?.message || "Profile API failed");
  }

  return data;
};

export const profileApi = {
  getProfile: () => {
    return request("/profile", {
      method: "GET",
    });
  },

  getOrderDetail: (orderId: string | number) => {
    return request(`/profile/order?id=${orderId}`, {
      method: "GET",
    });
  },
};