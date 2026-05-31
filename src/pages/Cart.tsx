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
  const payableAmount = cartSummary.grand_total || subtotal;
  const itemCount =
    cartSummary.item_count || cartItems.reduce((acc, item) => acc + item.qty, 0);

  const fetchCartData = async () => {
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
      toast.error(error?.message || "Failed to load cart");
      setCartItems([]);
      setCartSummary(emptySummary);
      emitCartUpdated(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();

    const handleCartUpdate = () => {
      fetchCartData();
    };

    window.addEventListener("muro_cart_updated", handleCartUpdate);

    return () => {
      window.removeEventListener("muro_cart_updated", handleCartUpdate);
    };
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
    }
  };

  const removeItem = async (productId: number, sizeId?: number) => {
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
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      toast.success("Cart cleared");
      setCartItems([]);
      setCartSummary(emptySummary);
      emitCartUpdated(0);
      await fetchCartData();
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      toast.error(error?.message || "Failed to clear cart");
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
          color: "#1C1C1C",
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222] pb-24 relative">
      <div className="bg-[#F0EEE9]/30 py-16 text-center border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl font-light tracking-tight">
          Shopping Cart
        </h1>
      </div>

      <div className="container mx-auto px-5 md:px-8 mt-12 max-w-6xl">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag
              className="w-16 h-16 text-gray-200 mb-6"
              strokeWidth={1}
            />

            <p className="text-xl font-serif mb-6 text-gray-400">
              Your cart is currently empty.
            </p>

            <Link
              to="/products"
              className="bg-[#222222] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#2F4F4F]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="flex-1 space-y-6">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={`${item.product_id}-${item.size_id || "no-size"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col md:grid md:grid-cols-12 items-center gap-4 pb-6 border-b border-gray-100"
                  >
                    <div className="col-span-6 flex items-center gap-6 w-full">
                      <div className="w-20 md:w-24 aspect-[4/5] bg-[#F4F4F4] flex-shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={getFullImageUrl(item.image_url)}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[15px] leading-snug mb-2">
                          {item.title}
                        </h3>

                        {(item.size_name || item.size_code) && (
                          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 font-semibold mb-2">
                            Size: {item.size_name || item.size_code}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id, item.size_id)}
                          className="text-[11px] uppercase tracking-widest text-red-500 flex items-center gap-1 hover:text-red-700"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-center md:text-left">
                      <p className="text-sm font-semibold">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <div className="inline-flex items-center border border-gray-200 h-10">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.size_id,
                              item.qty - 1
                            )
                          }
                          className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-10 text-center text-sm font-semibold">
                          {item.qty}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.size_id,
                              item.qty + 1
                            )
                          }
                          className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-right w-full">
                      <p className="text-sm font-bold">
                        {formatPrice(item.line_total)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] uppercase tracking-[0.18em] text-gray-400 hover:text-red-500"
              >
                Clear Cart
              </button>
            </div>

            <aside className="lg:w-[360px]">
              <div className="bg-[#F8F8F8] border border-[#EAEAEA] p-7 sticky top-28">
                <h2 className="text-xl font-serif mb-6">Order Summary</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Subtotal ({itemCount} items)
                    </span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {cartSummary.sgst_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        SGST {cartSummary.sgst_percent}%
                      </span>
                      <span className="font-semibold">
                        {formatPrice(cartSummary.sgst_amount)}
                      </span>
                    </div>
                  )}

                  {cartSummary.cgst_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        CGST {cartSummary.cgst_percent}%
                      </span>
                      <span className="font-semibold">
                        {formatPrice(cartSummary.cgst_amount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(payableAmount)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="mt-7 w-full bg-[#222222] text-white h-14 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#006039] flex items-center justify-center gap-2"
                >
                  Checkout
                  <ArrowRight size={15} />
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute right-5 top-5 p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-3xl mb-6">Checkout Details</h2>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="bg-[#F8F8F8] p-4 flex justify-between text-sm font-semibold">
                  <span>Payable Amount</span>
                  <span>{formatPrice(payableAmount)}</span>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-[#222222] text-white h-14 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#006039] disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Pay Now"}
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
    <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-gray-500 mb-2">
      {label}
    </span>

    <input
      required
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 h-12 px-4 outline-none focus:border-black text-sm"
    />
  </label>
);

export default Cart;
