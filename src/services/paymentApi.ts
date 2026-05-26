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

const request = async (endpoint: string, payload: any = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Payment API failed");
  }

  return data;
};

export const paymentApi = {
  createRazorpayOrder: (payload: any) =>
    request("/payment/razorpay/create-order", payload),

  verifyRazorpayPayment: (payload: any) =>
    request("/payment/razorpay/verify", payload),
};