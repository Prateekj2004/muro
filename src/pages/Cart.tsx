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
  title: string;
  price: number;
  qty: number;
  stock?: number;
  image_url?: string;
  line_total: number;
};

const TEST_PAYMENT_AMOUNT = 1;

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/300x400?text=No+Image";

  if (path.startsWith("http")) return path;

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (!cleanPath.includes("uploads/product")) {
    cleanPath = `uploads/product/${cleanPath}`;
  }

  return `https://muroposter.com/${cleanPath}`;
};

const formatPrice = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
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

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const savedUser = getSavedUser();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + Number(item.line_total || item.price * item.qty || 0);
    }, 0);
  }, [cartItems]);

  const fetchCartData = async () => {
    setLoading(true);

    try {
      const res = await cartApi.getCart();
      const items = Array.isArray(res?.data?.items) ? res.data.items : [];

      const mappedItems = items.map((item: any) => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 1);

        return {
          product_id: Number(item.product_id),
          title: item.title || "Product",
          price,
          qty,
          stock: Number(item.stock || 999999),
          image_url: item.image_url || "",
          line_total: Number(item.line_total || price * qty),
        };
      });

      setCartItems(mappedItems);
    } catch (error: any) {
      console.error("Failed to load cart:", error);
      toast.error(error?.message || "Failed to load cart");
      setCartItems([]);
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

  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) return;

    try {
      await cartApi.updateQty({
        product_id: productId,
        qty: newQty,
      });

      await fetchCartData();
    } catch (error: any) {
      console.error("Failed to update cart:", error);
      toast.error(error?.message || "Failed to update cart");
    }
  };

  const removeItem = async (productId: number) => {
    try {
      await cartApi.removeItem({
        product_id: productId,
      });

      toast.success("Item removed");
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
        test_payment_amount: TEST_PAYMENT_AMOUNT,
      });

      const paymentData = createRes?.data;

      if (!paymentData?.razorpay_order_id || !paymentData?.razorpay_key_id) {
        toast.error("Razorpay order creation failed");
        setActionLoading(false);
        return;
      }

      const options = {
        key: paymentData.razorpay_key_id,
        amount: TEST_PAYMENT_AMOUNT * 100,
        currency: paymentData.currency || "INR",
        name: "Muro Poster",
        description: `Test Payment ₹${TEST_PAYMENT_AMOUNT} - Order ${paymentData.order_no}`,
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
                    key={item.product_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col md:grid md:grid-cols-12 items-center gap-4 pb-6 border-b border-gray-100"
                  >
                    <div className="col-span-6 flex items-center gap-6 w-full">
                      <div className="w-20 md:w-24 aspect-[4/5] bg-[#F4F4F4] flex-shrink-0 overflow-hidden">
                        <img
                          src={getFullImageUrl(item.image_url)}
                          className="w-full h-full object-contain"
                          alt={item.title}
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-serif text-lg line-clamp-1">
                          {item.title}
                        </span>

                        <span className="text-[12px] text-gray-500 mt-1 font-medium">
                          {formatPrice(item.price)}
                        </span>

                        {typeof item.stock === "number" && (
                          <span className="text-[11px] text-gray-400 mt-1">
                            Stock: {item.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-center mt-4 md:mt-0">
                      <div className="flex items-center border border-[#E5E5E5] h-10 w-28 bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.qty - 1)
                          }
                          disabled={item.qty <= 1}
                          className={`w-8 flex items-center justify-center hover:bg-gray-50 ${
                            item.qty <= 1 ? "opacity-40 cursor-not-allowed" : ""
                          }`}
                          type="button"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="flex-1 text-center text-xs font-bold">
                          {item.qty}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.qty + 1)
                          }
                          disabled={
                            typeof item.stock === "number" &&
                            item.qty >= item.stock
                          }
                          className={`w-8 flex items-center justify-center hover:bg-gray-50 ${
                            typeof item.stock === "number" &&
                            item.qty >= item.stock
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                          type="button"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-3 text-right w-full md:w-auto text-sm font-bold">
                      {formatPrice(item.line_total)}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-gray-400 hover:text-red-500 p-2"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-[#FAFAFA] p-8 border border-[#E5E5E5] sticky top-24">
                <h3 className="font-serif text-xl mb-6">Order Summary</h3>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Items</span>
                  <span className="text-sm font-bold">
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Order Total</span>
                  <span className="text-sm font-bold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-8 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded">
                  <span className="font-bold text-base">Frontend Test Amount</span>
                  <span className="font-bold text-xl">
                    {formatPrice(TEST_PAYMENT_AMOUNT)}
                  </span>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[#222222] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg flex justify-center gap-2"
                  type="button"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 border border-[#E5E5E5] bg-white text-[#222222] py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-gray-50"
                  type="button"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!actionLoading) setIsCheckoutOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="font-serif text-xl">Shipping Details</span>

                <button
                  onClick={() => {
                    if (!actionLoading) setIsCheckoutOpen(false);
                  }}
                  className="text-gray-400 hover:text-black"
                  type="button"
                  disabled={actionLoading}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form
                  id="checkoutForm"
                  onSubmit={handleCheckoutSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={checkoutData.shipping_name}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          shipping_name: e.target.value,
                        })
                      }
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={checkoutData.shipping_email}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          shipping_email: e.target.value,
                        })
                      }
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={checkoutData.shipping_phone}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          shipping_phone: e.target.value,
                        })
                      }
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Address Line 1 *
                    </label>
                    <input
                      required
                      type="text"
                      value={checkoutData.shipping_address1}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          shipping_address1: e.target.value,
                        })
                      }
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                      placeholder="House/Flat No."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={checkoutData.shipping_address2}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          shipping_address2: e.target.value,
                        })
                      }
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                      placeholder="Landmark / Area"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                        City *
                      </label>
                      <input
                        required
                        type="text"
                        value={checkoutData.shipping_city}
                        onChange={(e) =>
                          setCheckoutData({
                            ...checkoutData,
                            shipping_city: e.target.value,
                          })
                        }
                        className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                        State *
                      </label>
                      <input
                        required
                        type="text"
                        value={checkoutData.shipping_state}
                        onChange={(e) =>
                          setCheckoutData({
                            ...checkoutData,
                            shipping_state: e.target.value,
                          })
                        }
                        className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      Pincode *
                    </label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={checkoutData.shipping_pincode}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          shipping_pincode: e.target.value,
                        })
                      }
                      className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-[#E5E5E5] bg-[#FAFAFA]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Actual Order Total</span>
                  <span className="text-sm font-bold text-gray-500">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-500">Amount to Pay</span>
                  <span className="font-bold text-xl text-black">
                    {formatPrice(TEST_PAYMENT_AMOUNT)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="checkoutForm"
                  disabled={actionLoading}
                  className={`w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 ${
                    actionLoading ? "opacity-50" : "hover:bg-gray-800"
                  }`}
                >
                  {actionLoading ? "Processing..." : "Pay ₹1 Now"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Cart;