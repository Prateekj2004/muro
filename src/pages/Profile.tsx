import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/services/profileApi";

type UserData = {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  created_at?: string;
};

type OrderItem = {
  id?: number;
  order_id?: number;
  product_id?: number;
  title?: string;
  price?: number;
  qty?: number;
  line_total?: number;
  image_url?: string;
};

type OrderData = {
  id: number;
  order_no: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  currency?: string;
  subtotal?: number;
  total_amount?: number;
  payment_status?: string;
  order_status?: string;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_email?: string;
  shipping_address1?: string;
  shipping_address2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  paid_at?: string;
  created_at?: string;
  items?: OrderItem[];
};

const COLORS = {
  cloud: "#F0EEE9",
  blackboard: "#1C1C1C",
  green: "#006039",
};

const getSavedUser = (): UserData => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";

  if (path.startsWith("http")) return path;

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (!cleanPath.includes("uploads/product")) {
    cleanPath = `uploads/product/${cleanPath}`;
  }

  return `https://muroposter.com/${cleanPath}`;
};

const formatPrice = (value?: number | string) => {
  const numeric = Number(value || 0);
  return `₹${numeric.toLocaleString("en-IN")}`;
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = (status?: string) => {
  const s = String(status || "").toUpperCase();

  if (["PAID", "PLACED", "COMPLETED", "DELIVERED", "SUCCESS"].includes(s)) {
    return "bg-[#006039]/10 text-[#006039] border-[#006039]/20";
  }

  if (["PENDING", "PROCESSING", "SHIPPED"].includes(s)) {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  if (["FAILED", "CANCELLED", "CANCELED", "REJECTED"].includes(s)) {
    return "bg-red-50 text-red-600 border-red-200";
  }

  return "bg-[#1C1C1C]/5 text-[#1C1C1C]/65 border-[#1C1C1C]/10";
};

const paymentIcon = (status?: string) => {
  const s = String(status || "").toUpperCase();

  if (s === "PAID") return CheckCircle2;
  if (["FAILED", "CANCELLED", "CANCELED"].includes(s)) return XCircle;
  return Clock;
};

const trackingSteps = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

const getStepIndex = (status?: string) => {
  const s = String(status || "").toUpperCase();

  if (s === "PENDING") return 0;
  if (s === "PLACED") return 0;
  if (s === "PROCESSING") return 1;
  if (s === "SHIPPED") return 2;
  if (s === "DELIVERED" || s === "COMPLETED") return 3;

  return 0;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData>(getSavedUser());
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");

  const paidOrders = useMemo(() => {
    return orders.filter(
      (order) => String(order.payment_status || "").toUpperCase() === "PAID"
    ).length;
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) => String(order.payment_status || "").toUpperCase() !== "PAID"
    ).length;
  }, [orders]);

  const latestOrder = orders[0];

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const res = await profileApi.getProfile();

      setUser(res?.data?.user || getSavedUser());
      setOrders(Array.isArray(res?.data?.orders) ? res.data.orders : []);
    } catch (error: any) {
      console.error("Profile fetch failed:", error);
      toast.error(error?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openOrderDetail = async (order: OrderData) => {
    setDetailLoading(true);

    try {
      const res = await profileApi.getOrderDetail(order.id);
      setSelectedOrder(res?.data?.order || order);
    } catch (error: any) {
      console.error("Order detail fetch failed:", error);
      toast.error(error?.message || "Failed to load order detail");
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrintBill = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0EEE9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen font-sans text-[#1C1C1C] pb-20"
      style={{ backgroundColor: COLORS.cloud }}
    >
      <section className="w-full border-b border-[#1C1C1C]/10 bg-[#F0EEE9]">
        <div className="max-w-[1400px] mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#1C1C1C]/45 mb-5">
                <Link to="/" className="hover:text-[#006039]">
                  Home
                </Link>
                <span>/</span>
                <span className="text-[#1C1C1C] font-semibold">Profile</span>
              </div>

            

              <p className="mt-4 text-[15px] md:text-[17px] text-[#1C1C1C]/60 max-w-2xl leading-relaxed">
                Track your orders, payment status, delivery progress and view
                your complete bill details in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="h-12 px-6 bg-[#1C1C1C] text-white text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-[#006039] transition-colors"
              >
                Continue Shopping
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="h-12 px-6 border border-[#1C1C1C]/20 bg-white/60 text-[#1C1C1C] text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 lg:gap-8">
          <aside className="space-y-5">
            <div className="rounded-[26px] bg-white/70 border border-[#1C1C1C]/10 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#006039]/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-[#006039]" strokeWidth={1.8} />
                </div>

                <div>
                  <h2 className="text-[22px] font-semibold leading-tight">
                    {user?.name || "Muro Customer"}
                  </h2>
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#1C1C1C]/45 mt-1">
                    Customer Account
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-[14px]">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-[2px] text-[#006039]" />
                  <span className="text-[#1C1C1C]/70 break-all">
                    {user?.email || "Email not available"}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-[2px] text-[#006039]" />
                  <span className="text-[#1C1C1C]/70">
                    {user?.phone || user?.mobile || "Phone not available"}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-[2px] text-[#006039]" />
                  <span className="text-[#1C1C1C]/70">
                    Joined: {formatDate(user?.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] bg-[#1C1C1C] text-white p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-2">
                Account Summary
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[28px] font-semibold">{orders.length}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                    Orders
                  </p>
                </div>

                <div>
                  <p className="text-[28px] font-semibold">{paidOrders}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                    Paid
                  </p>
                </div>

                <div>
                  <p className="text-[28px] font-semibold">{pendingOrders}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                    Pending
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[22px] bg-white/70 border border-[#1C1C1C]/10 p-5">
                <div className="w-10 h-10 rounded-full bg-[#006039]/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-5 h-5 text-[#006039]" />
                </div>
                <p className="text-[13px] text-[#1C1C1C]/55 mb-1">
                  Total Orders
                </p>
                <p className="text-[28px] font-semibold">{orders.length}</p>
              </div>

              <div className="rounded-[22px] bg-white/70 border border-[#1C1C1C]/10 p-5">
                <div className="w-10 h-10 rounded-full bg-[#006039]/10 flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5 text-[#006039]" />
                </div>
                <p className="text-[13px] text-[#1C1C1C]/55 mb-1">
                  Payment Success
                </p>
                <p className="text-[28px] font-semibold">{paidOrders}</p>
              </div>

              <div className="rounded-[22px] bg-white/70 border border-[#1C1C1C]/10 p-5">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <Truck className="w-5 h-5 text-yellow-700" />
                </div>
                <p className="text-[13px] text-[#1C1C1C]/55 mb-1">
                  Latest Status
                </p>
                <p className="text-[22px] font-semibold">
                  {latestOrder?.order_status || "No Order"}
                </p>
              </div>
            </div>

            <div className="rounded-[26px] bg-white/70 border border-[#1C1C1C]/10 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-[#1C1C1C]/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`px-5 h-10 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                      activeTab === "overview"
                        ? "bg-[#1C1C1C] text-white"
                        : "bg-white text-[#1C1C1C] border border-[#1C1C1C]/10"
                    }`}
                  >
                    Overview
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className={`px-5 h-10 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                      activeTab === "orders"
                        ? "bg-[#1C1C1C] text-white"
                        : "bg-white text-[#1C1C1C] border border-[#1C1C1C]/10"
                    }`}
                  >
                    Orders
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchProfile}
                  className="h-10 px-4 bg-white border border-[#1C1C1C]/10 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-[#F0EEE9]"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              {activeTab === "overview" ? (
                <div className="p-5 md:p-6">
                  {latestOrder ? (
                    <div>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#1C1C1C]/45 mb-2">
                            Latest Order
                          </p>

                          <h3 className="text-[28px] font-semibold tracking-[-0.03em]">
                            {latestOrder.order_no}
                          </h3>

                          <p className="text-[14px] text-[#1C1C1C]/55 mt-2">
                            Placed on {formatDate(latestOrder.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-3 py-2 rounded-full border text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClass(
                              latestOrder.payment_status
                            )}`}
                          >
                            Payment: {latestOrder.payment_status || "PENDING"}
                          </span>

                          <span
                            className={`px-3 py-2 rounded-full border text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClass(
                              latestOrder.order_status
                            )}`}
                          >
                            Order: {latestOrder.order_status || "PENDING"}
                          </span>
                        </div>
                      </div>

                      <TrackingTimeline order={latestOrder} />

                      <button
                        type="button"
                        onClick={() => openOrderDetail(latestOrder)}
                        className="mt-6 h-12 px-6 bg-[#1C1C1C] text-white text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center gap-2 hover:bg-[#006039] transition-colors"
                      >
                        View Bill
                        <ReceiptText size={15} />
                      </button>
                    </div>
                  ) : (
                    <EmptyOrders />
                  )}
                </div>
              ) : (
                <div className="p-0">
                  {orders.length === 0 ? (
                    <div className="p-6">
                      <EmptyOrders />
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1C1C1C]/10">
                      {orders.map((order) => {
                        const PayIcon = paymentIcon(order.payment_status);

                        return (
                          <div
                            key={order.id}
                            className="p-5 md:p-6 hover:bg-white/50 transition-colors"
                          >
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#006039]/10 flex items-center justify-center shrink-0">
                                  <Package className="w-5 h-5 text-[#006039]" />
                                </div>

                                <div>
                                  <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
                                    {order.order_no}
                                  </h3>

                                  <p className="text-[13px] text-[#1C1C1C]/50 mt-1">
                                    Ordered on {formatDate(order.created_at)}
                                  </p>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <span
                                      className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-[0.13em] ${statusClass(
                                        order.payment_status
                                      )}`}
                                    >
                                      <PayIcon className="inline w-3 h-3 mr-1" />
                                      {order.payment_status || "PENDING"}
                                    </span>

                                    <span
                                      className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-[0.13em] ${statusClass(
                                        order.order_status
                                      )}`}
                                    >
                                      {order.order_status || "PENDING"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#1C1C1C]/40">
                                    Paid Amount
                                  </p>
                                  <p className="text-[20px] font-semibold">
                                    {formatPrice(order.total_amount)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openOrderDetail(order)}
                                  className="h-11 px-5 bg-[#1C1C1C] text-white text-[11px] font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 hover:bg-[#006039] transition-colors"
                                >
                                  <Eye size={15} />
                                  View Bill
                                </button>
                              </div>
                            </div>

                            <div className="mt-5">
                              <TrackingTimeline order={order} compact />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedOrder && (
          <OrderBillModal
            order={selectedOrder}
            loading={detailLoading}
            onClose={() => setSelectedOrder(null)}
            onPrint={handlePrintBill}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

const EmptyOrders = () => {
  return (
    <div className="min-h-[260px] flex flex-col items-center justify-center text-center">
      <ShoppingBag className="w-14 h-14 text-[#1C1C1C]/15 mb-5" />
      <h3 className="text-[24px] font-semibold mb-2">No orders found</h3>
      <p className="text-[14px] text-[#1C1C1C]/55 mb-6 max-w-md">
        You have not placed any order yet. Start shopping and your orders will
        appear here.
      </p>
      <Link
        to="/products"
        className="h-12 px-6 bg-[#1C1C1C] text-white text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-[#006039]"
      >
        Shop Posters
        <ArrowRight size={15} />
      </Link>
    </div>
  );
};

const TrackingTimeline = ({
  order,
  compact = false,
}: {
  order: OrderData;
  compact?: boolean;
}) => {
  const currentIndex = getStepIndex(order.order_status);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2">
        {trackingSteps.map((step, index) => {
          const active = index <= currentIndex;

          return (
            <div key={step} className="relative">
              <div
                className={`h-1.5 rounded-full mb-3 ${
                  active ? "bg-[#006039]" : "bg-[#1C1C1C]/10"
                }`}
              />

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-[#006039] text-white"
                      : "bg-white text-[#1C1C1C]/35 border border-[#1C1C1C]/10"
                  }`}
                >
                  {active ? <CheckCircle2 size={14} /> : <Clock size={13} />}
                </div>

                {!compact && (
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      active ? "text-[#006039]" : "text-[#1C1C1C]/35"
                    }`}
                  >
                    {step}
                  </span>
                )}
              </div>

              {compact && (
                <p
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                    active ? "text-[#006039]" : "text-[#1C1C1C]/35"
                  }`}
                >
                  {step}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderBillModal = ({
  order,
  loading,
  onClose,
  onPrint,
}: {
  order: OrderData;
  loading: boolean;
  onClose: () => void;
  onPrint: () => void;
}) => {
  const items = Array.isArray(order.items) ? order.items : [];

  const address = [
    order.shipping_address1,
    order.shipping_address2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[28px] bg-[#F0EEE9] shadow-2xl border border-white/30"
      >
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#1C1C1C]/10 bg-white/70">
          <div>
            <h2 className="text-[24px] md:text-[30px] font-semibold tracking-[-0.03em]">
              Order Bill
            </h2>
            <p className="text-[13px] text-[#1C1C1C]/50 mt-1">
              {order.order_no}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="h-10 px-4 bg-[#1C1C1C] text-white text-[11px] font-semibold uppercase tracking-[0.14em] flex items-center gap-2 hover:bg-[#006039]"
            >
              <Download size={14} />
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border border-[#1C1C1C]/10 flex items-center justify-center hover:bg-[#F0EEE9]"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-90px)] p-5 md:p-6">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-[22px] border border-[#1C1C1C]/10 p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#1C1C1C]/40 mb-2">
                    Customer
                  </p>
                  <h3 className="text-[20px] font-semibold">
                    {order.shipping_name || "-"}
                  </h3>
                  <p className="text-[14px] text-[#1C1C1C]/60 mt-2">
                    {order.shipping_email || "-"}
                  </p>
                  <p className="text-[14px] text-[#1C1C1C]/60">
                    {order.shipping_phone || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#1C1C1C]/40 mb-2">
                    Shipping Address
                  </p>
                  <div className="flex gap-2 text-[14px] text-[#1C1C1C]/65 leading-relaxed">
                    <MapPin className="w-4 h-4 mt-1 text-[#006039] shrink-0" />
                    <span>{address || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <InfoBox label="Payment" value={order.payment_status || "-"} />
                <InfoBox label="Order" value={order.order_status || "-"} />
                <InfoBox label="Paid On" value={formatDate(order.paid_at)} />
                <InfoBox
                  label="Payment ID"
                  value={order.razorpay_payment_id || "-"}
                />
              </div>

              <div className="overflow-x-auto border border-[#1C1C1C]/10 rounded-[18px]">
                <table className="w-full text-left min-w-[720px]">
                  <thead className="bg-[#F0EEE9]">
                    <tr>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-[0.16em]">
                        Product
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-center">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-right">
                        Price
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-right">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#1C1C1C]/10">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-[#1C1C1C]/45"
                        >
                          No bill items found
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-16 bg-[#F0EEE9] rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={getFullImageUrl(item.image_url)}
                                  alt={item.title || "Product"}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="font-medium">
                                {item.title || "Product"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {item.qty || 1}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold">
                            {formatPrice(item.line_total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#1C1C1C]/55">Actual Cart Total</span>
                    <span className="font-semibold">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[18px] border-t border-[#1C1C1C]/10 pt-3">
                    <span className="font-semibold">Paid Amount</span>
                    <span className="font-bold text-[#006039]">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InfoBox = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-[16px] bg-[#F0EEE9] border border-[#1C1C1C]/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#1C1C1C]/40 mb-2">
        {label}
      </p>
      <p className="text-[14px] font-semibold break-all">{value}</p>
    </div>
  );
};

export default Profile;