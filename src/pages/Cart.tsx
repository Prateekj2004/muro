import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  X,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cartApi } from "@/services/cartApi";
import { paymentApi } from "@/services/paymentApi";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type CartItem = {
  product_id: number;
  size_id?: number;
  size_name?: string;
  size_code?: string;
  title: string;
  price: number;
  qty: number;
  stock?: number;
  image_url?: string;

  line_total: number;
  line_subtotal?: number;
  line_sgst_amount?: number;
  line_cgst_amount?: number;
  line_gst_amount?: number;
  line_total_with_gst?: number;

  sgst_percent?: number;
  cgst_percent?: number;
  gst_percent?: number;
};

type CartSummary = {
  subtotal: number;
  taxable_amount: number;

  sgst_percent: number;
  cgst_percent: number;
  gst_percent: number;

  sgst_amount: number;
  cgst_amount: number;
  gst_amount: number;

  grand_total: number;
  item_count: number;
};

const emptySummary: CartSummary = {
  subtotal: 0,
  taxable_amount: 0,

  sgst_percent: 0,
  cgst_percent: 0,
  gst_percent: 0,

  sgst_amount: 0,
  cgst_amount: 0,
  gst_amount: 0,

  grand_total: 0,
  item_count: 0,
};

const COLORS = {
  page: "#FFFFFF",
  paper: "#F2F2F2",
  paperDark: "#ECECEC",
  ink: "#111111",
  muted: "#8B8B8B",
  line: "#E6E6E6",
  accent: "#ECFF66",
  green: "#006039",
};

const serifFont = "Georgia, 'Times New Roman', serif";

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";

  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (cleanPath.includes("api/public/uploads")) {
    return `https://muroposter.com/${cleanPath}`;
  }

  if (cleanPath.includes("uploads/product")) {
    return `https://muroposter.com/${cleanPath}`;
  }

  return `https://muroposter.com/uploads/product/${cleanPath}`;
};

const toNumber = (value: any, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatPrice = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const emitCartUpdated = (itemCount?: number) => {
  window.dispatchEvent(
    new CustomEvent("muro_cart_updated", {
      detail: {
        item_count: Number(itemCount || 0),
      },
    })
  );
};

const getRazorpayAmountInPaise = (
  paymentData: any,
  fallbackAmountInRupees: number
) => {
  const possiblePaise =
    paymentData?.amount_paise ??
    paymentData?.amount_in_paise ??
    paymentData?.razorpay_amount ??
    paymentData?.amountPaise;

  if (Number.isFinite(Number(possiblePaise)) && Number(possiblePaise) > 0) {
    return Number(possiblePaise);
  }

  const possibleRupees =
    paymentData?.amount ??
    paymentData?.grand_total ??
    paymentData?.payable_amount ??
    fallbackAmountInRupees;

  return Math.round(Number(possibleRupees || 0) * 100);
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const savedUser = getSavedUser();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [checkoutData, setCheckoutData] = useState({
    shipping_name: savedUser.name || "",
    shipping_phone: savedUser.phone || "",
    shipping_email: savedUser.email || "",
    shipping_address1: "",
    shipping_address2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
  });

  const fallbackSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + Number(item.line_total || item.price * item.qty || 0);
    }, 0);
  }, [cartItems]);

  const subtotal = cartSummary.subtotal || fallbackSubtotal;
  const sgstAmount = cartSummary.sgst_amount || 0;
  const cgstAmount = cartSummary.cgst_amount || 0;
  const gstAmount = cartSummary.gst_amount || sgstAmount + cgstAmount;
  const payableAmount = cartSummary.grand_total || subtotal + gstAmount;
  const itemCount =
    cartSummary.item_count || cartItems.reduce((acc, item) => acc + item.qty, 0);

  const fetchCartData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartItems([]);
      setCartSummary(emptySummary);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await cartApi.getCart();
      const items = Array.isArray(res?.data?.items) ? res.data.items : [];
      const summary = res?.data?.summary || {};

      const mappedItems: CartItem[] = items.map((item: any) => {
        const price = toNumber(item.price);
        const qty = toNumber(item.qty, 1);

        return {
          product_id: Number(item.product_id),
          size_id: Number(item.size_id || 0),
          size_name: item.size_name || "",
          size_code: item.size_code || "",
          title: item.title || "Product",
          price,
          qty,
          stock: Number(item.stock || 999999),
          image_url: item.image_url || "",

          line_total: toNumber(item.line_total, price * qty),
          line_subtotal: toNumber(item.line_subtotal, price * qty),
          line_sgst_amount: toNumber(item.line_sgst_amount),
          line_cgst_amount: toNumber(item.line_cgst_amount),
          line_gst_amount: toNumber(item.line_gst_amount),
          line_total_with_gst: toNumber(
            item.line_total_with_gst,
            toNumber(item.line_total, price * qty)
          ),

          sgst_percent: toNumber(item.sgst_percent),
          cgst_percent: toNumber(item.cgst_percent),
          gst_percent: toNumber(item.gst_percent),
        };
      });

      const mappedSummary: CartSummary = {
        subtotal: toNumber(summary.subtotal),
        taxable_amount: toNumber(summary.taxable_amount, summary.subtotal),

        sgst_percent: toNumber(summary.sgst_percent),
        cgst_percent: toNumber(summary.cgst_percent),
        gst_percent: toNumber(summary.gst_percent),

        sgst_amount: toNumber(summary.sgst_amount),
        cgst_amount: toNumber(summary.cgst_amount),
        gst_amount: toNumber(summary.gst_amount),

        grand_total: toNumber(summary.grand_total, summary.subtotal),
        item_count: toNumber(summary.item_count),
      };

      setCartItems(mappedItems);
      setCartSummary(mappedSummary);
      emitCartUpdated(mappedSummary.item_count);
    } catch (error: any) {
      console.error("Failed to load cart:", error);

      if (error?.status === 401 || error?.response?.status === 401) {
        setCartItems([]);
        setCartSummary(emptySummary);
        emitCartUpdated(0);
      } else {
        toast.error(error?.message || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    if (location.state?.openCheckout) {
      setIsCheckoutOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const updateQuantity = async (
    productId: number,
    sizeId: number | undefined,
    newQty: number
  ) => {
    if (newQty < 1) return;

    setActionLoading(true);

    try {
      const res = await cartApi.updateQty({
        product_id: productId,
        size_id: sizeId,
        qty: newQty,
      });

      const updatedCount = Number(res?.data?.summary?.item_count || 0);
      emitCartUpdated(updatedCount);
      await fetchCartData();
    } catch (error: any) {
      console.error("Failed to update cart:", error);
      toast.error(error?.message || "Failed to update cart");
    } finally {
      setActionLoading(false);
    }
  };

  const removeItem = async (productId: number, sizeId?: number) => {
    setActionLoading(true);

    try {
      const res = await cartApi.removeItem({
        product_id: productId,
        size_id: sizeId,
      });

      toast.success("Item removed");

      const updatedCount = Number(res?.data?.summary?.item_count || 0);
      emitCartUpdated(updatedCount);
      await fetchCartData();
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      toast.error(error?.message || "Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    setActionLoading(true);

    try {
      await cartApi.clearCart();
      toast.success("Cart cleared");
      setCartItems([]);
      setCartSummary(emptySummary);
      emitCartUpdated(0);
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      toast.error(error?.message || "Failed to clear cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (payableAmount <= 0) {
      toast.error("Invalid cart amount");
      return;
    }

    setActionLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load");
        setActionLoading(false);
        return;
      }

      const createRes = await paymentApi.createRazorpayOrder({
        ...checkoutData,
      });

      const paymentData = createRes?.data;

      if (!paymentData?.razorpay_order_id || !paymentData?.razorpay_key_id) {
        toast.error("Razorpay order creation failed");
        setActionLoading(false);
        return;
      }

      const razorpayAmountInPaise = getRazorpayAmountInPaise(
        paymentData,
        payableAmount
      );

      const options = {
        key: paymentData.razorpay_key_id,
        amount: razorpayAmountInPaise,
        currency: paymentData.currency || "INR",
        name: "Muro Poster",
        description: `Order ${paymentData.order_no || ""}`,
        order_id: paymentData.razorpay_order_id,
        prefill: paymentData.prefill || {
          name: checkoutData.shipping_name,
          email: checkoutData.shipping_email,
          contact: checkoutData.shipping_phone,
        },
        theme: {
          color: COLORS.ink,
        },
        handler: async function (response: any) {
          setActionLoading(true);

          try {
            await paymentApi.verifyRazorpayPayment({
              order_id: paymentData.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful. Order placed.");
            setIsCheckoutOpen(false);
            setCartItems([]);
            setCartSummary(emptySummary);
            emitCartUpdated(0);
            navigate("/");
          } catch (error: any) {
            console.error("Payment verification failed:", error);
            toast.error(error?.message || "Payment verification failed");
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setActionLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error?.message || "Payment failed");
      setActionLoading(false);
    }
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
      className="min-h-screen bg-white pb-24 font-sans text-[#111111]"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      <section className="border-b border-[#E6E6E6] bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-10 md:px-8 md:py-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8B8B8B]">
              Shopping bag
            </p>
            <h1
              className="text-[42px] font-normal leading-none tracking-[-0.06em] text-[#111111] md:text-[68px]"
              style={{ fontFamily: serifFont }}
            >
              Your cart
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold text-[#111111]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFF66] px-4 py-2">
              <ShieldCheck size={15} strokeWidth={1.8} />
              Secure checkout
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F2F2F2] px-4 py-2">
              <Truck size={15} strokeWidth={1.8} />
              Tracked delivery
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F2F2F2] px-4 py-2">
              <RotateCcw size={15} strokeWidth={1.8} />
              Easy support
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-[1500px] px-5 md:px-8">
        {cartItems.length === 0 ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[22px] bg-[#F2F2F2] px-6 text-center">
            <ShoppingBag
              className="mb-6 h-16 w-16 text-[#CFCFCF]"
              strokeWidth={1}
            />

            <h2
              className="text-[32px] font-normal tracking-[-0.05em] text-[#111111] md:text-[44px]"
              style={{ fontFamily: serifFont }}
            >
              Your cart is empty
            </h2>

            <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-[#777777]">
              Add posters to your bag and continue checkout from here.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-9 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039]"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-12">
            <section>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-[15px] font-bold uppercase tracking-[0.16em] text-[#111111]">
                  Items ({itemCount})
                </h2>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={actionLoading}
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B8B8B] transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  Clear cart
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const itemTotal = item.line_total || item.price * item.qty;

                    return (
                      <motion.article
                        key={`${item.product_id}-${item.size_id || "no-size"}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        className="group grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-[16px] border border-[#E7E7E7] bg-white p-3 transition-shadow hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] sm:grid-cols-[118px_minmax(0,1fr)_150px] md:gap-5 md:p-4 lg:grid-cols-[128px_minmax(0,1fr)_165px]"
                      >
                        <div className="relative flex h-[128px] w-[96px] items-center justify-center overflow-hidden rounded-[12px] bg-[#F2F2F2] p-3 sm:h-[154px] sm:w-[118px] lg:h-[164px] lg:w-[128px]">
                          <img
                            src={getFullImageUrl(item.image_url)}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.10)] transition-transform duration-500 group-hover:scale-[1.025]"
                          />
                        </div>

                        <div className="min-w-0 py-1 sm:py-2">
                          <div className="flex items-start justify-between gap-3 sm:block">
                            <div className="min-w-0">
                              <p className="mb-1 text-[12px] text-[#A0A0A0] md:text-[13px]">
                                Muro Poster
                              </p>

                              <h3
                                className="line-clamp-2 text-[20px] font-normal leading-[1.08] tracking-[-0.04em] text-[#111111] md:text-[24px]"
                                style={{ fontFamily: serifFont }}
                              >
                                {item.title}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.product_id, item.size_id)}
                              disabled={actionLoading}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F2F2] text-[#777777] transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50 sm:hidden"
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} strokeWidth={1.6} />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777777]">
                            {(item.size_name || item.size_code) && (
                              <span>
                                Size: <span className="text-[#111111]">{item.size_name || item.size_code}</span>
                              </span>
                            )}
                            <span>
                              Price: <span className="text-[#111111]">{formatPrice(item.price)}</span>
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-4">
                            <div className="inline-flex h-9 items-center rounded-full border border-[#DDDDDD] bg-white">
                              <button
                                type="button"
                                disabled={actionLoading || item.qty <= 1}
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.size_id,
                                    item.qty - 1
                                  )
                                }
                                className="flex h-full w-10 items-center justify-center rounded-l-full hover:bg-[#F2F2F2] disabled:opacity-40"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} strokeWidth={1.8} />
                              </button>

                              <span className="min-w-[34px] text-center text-[14px] font-bold">
                                {item.qty}
                              </span>

                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.size_id,
                                    item.qty + 1
                                  )
                                }
                                className="flex h-full w-10 items-center justify-center rounded-r-full hover:bg-[#F2F2F2] disabled:opacity-40"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} strokeWidth={1.8} />
                              </button>
                            </div>

                            <div className="sm:hidden">
                              <p className="text-[11px] text-[#A0A0A0]">Item total</p>
                              <p className="text-[15px] font-bold text-[#111111]">
                                {formatPrice(itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-between border-t border-[#EEEEEE] pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-2">
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id, item.size_id)}
                            disabled={actionLoading}
                            className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F2] text-[#777777] transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50 sm:flex"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} strokeWidth={1.6} />
                          </button>

                          <div className="text-left sm:text-right">
                            <p className="text-[12px] text-[#A0A0A0]">Item total</p>
                            <p className="text-[18px] font-bold text-[#111111] md:text-[20px]">
                              {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="overflow-hidden rounded-[22px] border border-[#E7E7E7] bg-white">
                <div className="bg-[#ECFF66] px-7 py-5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111111]">
                    Order summary
                  </p>
                </div>

                <div className="p-7">
                  <div className="space-y-4 text-[14px]">
                    <div className="flex justify-between gap-5">
                      <span className="text-[#777777]">
                        Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
                      </span>
                      <span className="font-bold text-[#111111]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5">
                      <span className="text-[#777777]">Shipping</span>
                      <span className="text-right font-medium text-[#777777]">
                        Calculated at checkout
                      </span>
                    </div>

                    {cartSummary.sgst_amount > 0 && (
                      <div className="flex justify-between gap-5">
                        <span className="text-[#777777]">
                          SGST {cartSummary.sgst_percent}%
                        </span>
                        <span className="font-semibold text-[#111111]">
                          {formatPrice(cartSummary.sgst_amount)}
                        </span>
                      </div>
                    )}

                    {cartSummary.cgst_amount > 0 && (
                      <div className="flex justify-between gap-5">
                        <span className="text-[#777777]">
                          CGST {cartSummary.cgst_percent}%
                        </span>
                        <span className="font-semibold text-[#111111]">
                          {formatPrice(cartSummary.cgst_amount)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-[#E7E7E7] pt-5">
                      <div className="flex justify-between gap-5 text-[21px] font-bold text-[#111111]">
                        <span>Total</span>
                        <span>{formatPrice(payableAmount)}</span>
                      </div>

                      {gstAmount > 0 && (
                        <div className="mt-3 flex justify-between gap-5 text-[13px] text-[#777777]">
                          <span>Total tax</span>
                          <span>{formatPrice(gstAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={actionLoading || cartItems.length === 0}
                    className="mt-7 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#111111] text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Checkout
                    <ArrowRight size={15} />
                  </button>

                  <Link
                    to="/products"
                    className="mt-4 flex h-[48px] w-full items-center justify-center rounded-full border border-[#D8D8D8] text-[12px] font-bold uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
                  >
                    Continue shopping
                  </Link>

                  <div className="mt-6 grid grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#777777]">
                    <span className="rounded-full bg-[#F2F2F2] px-3 py-2">
                      GPay
                    </span>
                    <span className="rounded-full bg-[#F2F2F2] px-3 py-2">
                      UPI
                    </span>
                    <span className="rounded-full bg-[#F2F2F2] px-3 py-2">
                      Cards
                    </span>
                    <span className="rounded-full bg-[#F2F2F2] px-3 py-2">
                      Razorpay
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-white p-6 shadow-2xl md:p-8"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F2F2F2]"
                aria-label="Close checkout"
              >
                <X size={20} />
              </button>

              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B8B8B]">
                Checkout
              </p>

              <h2
                className="mb-7 text-[34px] font-normal tracking-[-0.05em] text-[#111111]"
                style={{ fontFamily: serifFont }}
              >
                Delivery details
              </h2>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Name"
                    value={checkoutData.shipping_name}
                    onChange={(value) =>
                      setCheckoutData({
                        ...checkoutData,
                        shipping_name: value,
                      })
                    }
                  />

                  <Input
                    label="Phone"
                    value={checkoutData.shipping_phone}
                    onChange={(value) =>
                      setCheckoutData({
                        ...checkoutData,
                        shipping_phone: value,
                      })
                    }
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={checkoutData.shipping_email}
                    onChange={(value) =>
                      setCheckoutData({
                        ...checkoutData,
                        shipping_email: value,
                      })
                    }
                  />

                  <Input
                    label="Pincode"
                    value={checkoutData.shipping_pincode}
                    onChange={(value) =>
                      setCheckoutData({
                        ...checkoutData,
                        shipping_pincode: value,
                      })
                    }
                  />
                </div>

                <Input
                  label="Address Line 1"
                  value={checkoutData.shipping_address1}
                  onChange={(value) =>
                    setCheckoutData({
                      ...checkoutData,
                      shipping_address1: value,
                    })
                  }
                />

                <Input
                  label="Address Line 2"
                  value={checkoutData.shipping_address2}
                  onChange={(value) =>
                    setCheckoutData({
                      ...checkoutData,
                      shipping_address2: value,
                    })
                  }
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="City"
                    value={checkoutData.shipping_city}
                    onChange={(value) =>
                      setCheckoutData({
                        ...checkoutData,
                        shipping_city: value,
                      })
                    }
                  />

                  <Input
                    label="State"
                    value={checkoutData.shipping_state}
                    onChange={(value) =>
                      setCheckoutData({
                        ...checkoutData,
                        shipping_state: value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-between rounded-[16px] bg-[#ECFF66] p-4 text-[14px] font-bold text-[#111111]">
                  <span>Payable Amount</span>
                  <span>{formatPrice(payableAmount)}</span>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="h-14 w-full rounded-full bg-[#111111] text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039] disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Pay now"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const Input = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <label className="block">
    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#777777]">
      {label}
    </span>

    <input
      required
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full rounded-full border border-[#D8D8D8] px-5 text-[14px] text-[#111111] outline-none transition-colors focus:border-[#111111]"
    />
  </label>
);

export default Cart;
