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
  page: "#FFFFFF",
  paper: "#F2F2F2",
  ink: "#111111",
  muted: "#777777",
  line: "#E6E6E6",
  accent: "#ECFF66",
  green: "#006039",
};

const serifFont = "Georgia, 'Times New Roman', serif";

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
  return `₹${numeric.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
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
    return "border-[#006039]/25 bg-[#006039]/10 text-[#006039]";
  }

  if (["PENDING", "PROCESSING", "SHIPPED"].includes(s)) {
    return "border-[#ECFF66] bg-[#ECFF66] text-[#111111]";
  }

  if (["FAILED", "CANCELLED", "CANCELED", "REJECTED"].includes(s)) {
    return "border-red-200 bg-red-50 text-red-600";
  }

  return "border-[#E6E6E6] bg-[#F2F2F2] text-[#777777]";
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
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(getSavedUser());
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await profileApi.getProfile();

      setUser(res?.data?.user || getSavedUser());
      setOrders(Array.isArray(res?.data?.orders) ? res.data.orders : []);
    } catch (error: any) {
      console.error("Profile fetch failed:", error);

      if (error?.status === 401 || error?.response?.status === 401) {
        setOrders([]);
      } else {
        toast.error(error?.message || "Failed to load profile");
      }
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
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-white pb-20 font-sans text-[#111111] selection:bg-[#111111] selection:text-white"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      <section className="border-b border-[#E6E6E6] bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B8B8B]">
                <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-[#F2F2F2] px-4 py-2 transition-colors hover:bg-[#ECFF66] hover:text-[#111111]">
                  <Home size={13} strokeWidth={1.8} />
                  Home
                </Link>
                <span>/</span>
                <span className="text-[#111111]">Profile</span>
              </div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8B8B8B]">
                Customer account
              </p>

              <h1
                className="text-[34px] font-normal leading-none tracking-[-0.05em] text-[#111111] md:text-[46px] lg:text-[54px]"
                style={{ fontFamily: serifFont }}
              >
                Your profile
              </h1>

              <p className="mt-4 max-w-[650px] text-[14px] leading-relaxed text-[#555555] md:text-[16px]">
                Track your orders, payment status, delivery progress and complete bill details in one place.
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111111] px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039]"
              >
                Continue shopping
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#D8D8D8] bg-white px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111] hover:bg-[#F2F2F2]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pt-8 md:px-8">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[390px_minmax(0,1fr)] xl:gap-10">
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[24px] border border-[#E6E6E6] bg-white">
              <div className="bg-[#ECFF66] px-7 py-5">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111111]">
                  Account details
                </p>
              </div>

              <div className="p-7">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-white">
                    <User className="h-7 w-7" strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="truncate text-[24px] font-normal leading-none tracking-[-0.04em] text-[#111111]"
                      style={{ fontFamily: serifFont }}
                    >
                      {user?.name || "Muro Customer"}
                    </h2>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B8B8B]">
                      Customer account
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-[14px]">
                  <InfoLine icon={Mail} value={user?.email || "Email not available"} />
                  <InfoLine icon={Phone} value={user?.phone || user?.mobile || "Phone not available"} />
                  <InfoLine icon={Clock} value={`Joined: ${formatDate(user?.created_at)}`} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#111111] p-7 text-white">
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#ECFF66]">
                Account summary
              </p>

              <div className="grid grid-cols-3 gap-3">
                <SummaryNumber value={orders.length} label="Orders" />
                <SummaryNumber value={paidOrders} label="Paid" />
                <SummaryNumber value={pendingOrders} label="Pending" />
              </div>
            </div>

           
          </aside>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DashboardCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} />
              <DashboardCard icon={CreditCard} label="Payment Success" value={String(paidOrders)} />
              <DashboardCard icon={Truck} label="Latest Status" value={latestOrder?.order_status || "No Order"} />
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#E6E6E6] bg-white">
              <div className="flex flex-col gap-4 border-b border-[#E6E6E6] p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <TabButton label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                  <TabButton label="Orders" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
                </div>

                <button
                  type="button"
                  onClick={fetchProfile}
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[#D8D8D8] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#111111] transition-colors hover:border-[#111111] hover:bg-[#F2F2F2]"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              {activeTab === "overview" ? (
                <div className="p-5 md:p-7">
                  {latestOrder ? (
                    <div>
                      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8B8B8B]">
                            Latest order
                          </p>

                          <h3
                            className="text-[28px] font-normal leading-none tracking-[-0.04em] text-[#111111]"
                            style={{ fontFamily: serifFont }}
                          >
                            {latestOrder.order_no}
                          </h3>

                          <p className="mt-3 text-[14px] text-[#777777]">
                            Placed on {formatDate(latestOrder.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <StatusPill label={`Payment: ${latestOrder.payment_status || "PENDING"}`} status={latestOrder.payment_status} />
                          <StatusPill label={`Order: ${latestOrder.order_status || "PENDING"}`} status={latestOrder.order_status} />
                        </div>
                      </div>

                      <TrackingTimeline order={latestOrder} />

                      <button
                        type="button"
                        onClick={() => openOrderDetail(latestOrder)}
                        className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#111111] px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039]"
                      >
                        View bill
                        <ReceiptText size={15} />
                      </button>
                    </div>
                  ) : (
                    <EmptyOrders />
                  )}
                </div>
              ) : (
                <div>
                  {orders.length === 0 ? (
                    <div className="p-6">
                      <EmptyOrders />
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E6E6E6]">
                      {orders.map((order) => {
                        const PayIcon = paymentIcon(order.payment_status);

                        return (
                          <div key={order.id} className="p-5 transition-colors hover:bg-[#F8F8F8] md:p-7">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                              <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ECFF66] text-[#111111]">
                                  <Package className="h-5 w-5" strokeWidth={1.8} />
                                </div>

                                <div>
                                  <h3
                                    className="text-[22px] font-normal leading-none tracking-[-0.04em] text-[#111111]"
                                    style={{ fontFamily: serifFont }}
                                  >
                                    {order.order_no}
                                  </h3>

                                  <p className="mt-2 text-[13px] text-[#777777]">
                                    Ordered on {formatDate(order.created_at)}
                                  </p>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <span
                                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${statusClass(
                                        order.payment_status
                                      )}`}
                                    >
                                      <PayIcon className="mr-1 h-3 w-3" />
                                      {order.payment_status || "PENDING"}
                                    </span>

                                    <StatusPill label={order.order_status || "PENDING"} status={order.order_status} small />
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B8B8B]">
                                    Paid amount
                                  </p>
                                  <p className="mt-1 text-[22px] font-bold text-[#111111]">
                                    {formatPrice(order.total_amount)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openOrderDetail(order)}
                                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#006039]"
                                >
                                  <Eye size={15} />
                                  View bill
                                </button>
                              </div>
                            </div>

                            <div className="mt-6">
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

const InfoLine = ({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="mt-[1px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2F2F2] text-[#111111]">
      <Icon className="h-4 w-4" strokeWidth={1.8} />
    </span>
    <span className="break-all pt-[5px] text-[#555555]">{value}</span>
  </div>
);

const SummaryNumber = ({ value, label }: { value: number; label: string }) => (
  <div>
    <p
      className="text-[30px] font-normal leading-none tracking-[-0.04em]"
      style={{ fontFamily: serifFont }}
    >
      {value}
    </p>
    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
      {label}
    </p>
  </div>
);

const DashboardCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="rounded-[24px] border border-[#E6E6E6] bg-white p-6">
    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#ECFF66] text-[#111111]">
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </div>
    <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#8B8B8B]">
      {label}
    </p>
    <p
      className="line-clamp-1 text-[26px] font-normal leading-none tracking-[-0.04em] text-[#111111]"
      style={{ fontFamily: serifFont }}
    >
      {value}
    </p>
  </div>
);

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-10 rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
      active
        ? "bg-[#111111] text-white"
        : "border border-[#D8D8D8] bg-white text-[#111111] hover:bg-[#F2F2F2]"
    }`}
  >
    {label}
  </button>
);

const StatusPill = ({
  label,
  status,
  small = false,
}: {
  label: string;
  status?: string;
  small?: boolean;
}) => (
  <span
    className={`rounded-full border font-bold uppercase tracking-[0.14em] ${statusClass(status)} ${
      small ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-[11px]"
    }`}
  >
    {label}
  </span>
);

const EmptyOrders = () => {
  return (
    <div className="flex min-h-[310px] flex-col items-center justify-center rounded-[22px] bg-[#F2F2F2] px-6 text-center">
      <ShoppingBag className="mb-5 h-14 w-14 text-[#CFCFCF]" strokeWidth={1.15} />
      <h3
        className="text-[26px] font-normal tracking-[-0.04em] text-[#111111]"
        style={{ fontFamily: serifFont }}
      >
        No orders found
      </h3>
      <p className="mt-3 mb-7 max-w-md text-[14px] leading-relaxed text-[#777777]">
        You have not placed any order yet. Start shopping and your orders will appear here.
      </p>
      <Link
        to="/products"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111111] px-7 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039]"
      >
        Shop posters
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
                className={`mb-3 h-1.5 rounded-full ${
                  active ? "bg-[#ECFF66]" : "bg-[#E6E6E6]"
                }`}
              />

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    active
                      ? "bg-[#111111] text-[#ECFF66]"
                      : "border border-[#E6E6E6] bg-white text-[#B0B0B0]"
                  }`}
                >
                  {active ? <CheckCircle2 size={14} /> : <Clock size={13} />}
                </div>

                {!compact && (
                  <span
                    className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
                      active ? "text-[#111111]" : "text-[#B0B0B0]"
                    }`}
                  >
                    {step}
                  </span>
                )}
              </div>

              {compact && (
                <p
                  className={`mt-2 text-[10px] font-bold uppercase tracking-[0.1em] ${
                    active ? "text-[#111111]" : "text-[#B0B0B0]"
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
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#E6E6E6] bg-[#ECFF66] p-5 md:p-6">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#111111]/70">
              Order bill
            </p>
            <h2
              className="text-[26px] font-normal leading-none tracking-[-0.04em] text-[#111111] md:text-[32px]"
              style={{ fontFamily: serifFont }}
            >
              {order.order_no}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111111] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#006039]"
            >
              <Download size={14} />
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111111] transition-colors hover:bg-[#F2F2F2]"
              aria-label="Close bill"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-110px)] overflow-y-auto bg-white p-5 md:p-6">
          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-[22px] border border-[#E6E6E6] bg-white p-5 md:p-6">
              <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-[18px] bg-[#F2F2F2] p-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#777777]">
                    Customer
                  </p>
                  <h3
                    className="text-[24px] font-normal leading-none tracking-[-0.04em] text-[#111111]"
                    style={{ fontFamily: serifFont }}
                  >
                    {order.shipping_name || "-"}
                  </h3>
                  <p className="mt-3 text-[14px] text-[#555555]">
                    {order.shipping_email || "-"}
                  </p>
                  <p className="text-[14px] text-[#555555]">
                    {order.shipping_phone || "-"}
                  </p>
                </div>

                <div className="rounded-[18px] bg-[#F2F2F2] p-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#777777]">
                    Shipping address
                  </p>
                  <div className="flex gap-2 text-[14px] leading-relaxed text-[#555555]">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#111111]" />
                    <span>{address || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                <InfoBox label="Payment" value={order.payment_status || "-"} />
                <InfoBox label="Order" value={order.order_status || "-"} />
                <InfoBox label="Paid On" value={formatDate(order.paid_at)} />
                <InfoBox label="Payment ID" value={order.razorpay_payment_id || "-"} />
              </div>

              <div className="overflow-x-auto rounded-[18px] border border-[#E6E6E6]">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-[#F2F2F2]">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em]">
                        Product
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.16em]">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em]">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em]">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E6E6E6]">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-[#777777]">
                          No bill items found
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#F2F2F2] p-2">
                                <img
                                  src={getFullImageUrl(item.image_url)}
                                  alt={item.title || "Product"}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <span className="font-semibold text-[#111111]">
                                {item.title || "Product"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">{item.qty || 1}</td>
                          <td className="px-4 py-4 text-right">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-4 text-right font-bold">
                            {formatPrice(item.line_total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-3 rounded-[18px] bg-[#F2F2F2] p-5">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#777777]">Actual Cart Total</span>
                    <span className="font-bold text-[#111111]">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#E0E0E0] pt-3 text-[20px]">
                    <span className="font-bold text-[#111111]">Paid Amount</span>
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
    <div className="rounded-[16px] border border-[#E6E6E6] bg-white p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#777777]">
        {label}
      </p>
      <p className="break-all text-[14px] font-bold text-[#111111]">{value}</p>
    </div>
  );
};

export default Profile;
