import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // 🔥 FETCH SAVED USER FROM LOCAL STORAGE
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔥 PRE-FILL FORM WITH SAVED USER NAME & PHONE
  const [checkoutData, setCheckoutData] = useState({
    shipping_name: savedUser.name || "", 
    shipping_phone: savedUser.phone || "", 
    shipping_address1: "",
    shipping_address2: "", 
    shipping_city: "", 
    shipping_state: "", 
    shipping_pincode: ""
  });

  // Automatically open checkout if routed from "Buy Now"
  useEffect(() => {
    if (location.state?.openCheckout) {
      setIsCheckoutOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 🔥 FETCH REAL CART FROM BACKEND
  const fetchCartData = async () => {
    setLoading(true);
    try {
      const res = await API.getCart();
      const items = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      
      const mappedItems = items.map((item: any) => {
        const prod = item.product || item; 
        const price = Number(prod.price || 0);
        const qty = Number(item.qty || item.quantity || 1);
        return {
          product_id: item.product_id || prod.id,
          title: prod.title || "Product",
          price: price,
          qty: qty,
          image_url: prod.image_url || "https://images.unsplash.com/photo-1549490349-8643362247b5",
          line_total: price * qty
        };
      });

      setCartItems(mappedItems);
      setCartTotal(mappedItems.reduce((acc, i) => acc + i.line_total, 0));
    } catch (error) {
      console.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCartData(); }, []);

  // 🔥 UPDATE API
  const updateQuantity = async (product_id: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await API.updateCart({ product_id, qty: newQty });
      fetchCartData(); // Refresh UI from DB
    } catch (error) { toast.error("Failed to update cart"); }
  };

  // 🔥 REMOVE API
  const removeItem = async (product_id: number) => {
    try {
      await API.removeFromCart({ product_id });
      toast.success("Item removed");
      fetchCartData(); // Refresh UI from DB
    } catch (error) { toast.error("Failed to remove item"); }
  };

  // 🔥 ORDER API 
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const orderPayload = { ...checkoutData }; 

      const res = await API.userCreateOrder(orderPayload);
      if (res.success !== false) {
        toast.success("Order Placed Successfully! 🎉");
        setIsCheckoutOpen(false);
        setCartItems([]);
        navigate("/"); // Redirect to home ya success page par
      } else {
        toast.error(res.message || "Checkout failed.");
      }
    } catch (error) {
      toast.error("Network error. Order could not be placed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222] pb-24 relative">
      <div className="bg-[#F0EEE9]/30 py-16 text-center border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl font-light tracking-tight">Shopping Cart</h1>
      </div>

      <div className="container mx-auto px-5 md:px-8 mt-12 max-w-6xl">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-6" strokeWidth={1} />
            <p className="text-xl font-serif mb-6 text-gray-400">Your cart is currently empty.</p>
            <Link to="/products" className="bg-[#222222] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#2F4F4F]">Continue Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="flex-1 space-y-6">
              <AnimatePresence>
                {cartItems.map((item, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col md:grid md:grid-cols-12 items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="col-span-6 flex items-center gap-6 w-full">
                      <div className="w-20 md:w-24 aspect-[4/5] bg-[#F4F4F4] flex-shrink-0"><img src={item.image_url} className="w-full h-full object-cover" /></div>
                      <div className="flex flex-col">
                        <span className="font-serif text-lg line-clamp-1">{item.title}</span>
                        <span className="text-[12px] text-gray-500 mt-1 font-medium">₹{item.price}</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center mt-4 md:mt-0">
                      <div className="flex items-center border border-[#E5E5E5] h-10 w-28 bg-white">
                        <button onClick={() => updateQuantity(item.product_id, item.qty - 1)} className="w-8 flex items-center justify-center hover:bg-gray-50"><Minus size={14}/></button>
                        <span className="flex-1 text-center text-xs font-bold">{item.qty}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.qty + 1)} className="w-8 flex items-center justify-center hover:bg-gray-50"><Plus size={14}/></button>
                      </div>
                    </div>
                    <div className="col-span-3 text-right w-full md:w-auto text-sm font-bold">₹{item.line_total}</div>
                    <div className="col-span-1 flex justify-end"><button onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-[#FAFAFA] p-8 border border-[#E5E5E5] sticky top-24">
                <h3 className="font-serif text-xl mb-6">Order Summary</h3>
                <div className="flex justify-between items-center mb-8"><span className="font-bold text-base">Total</span><span className="font-bold text-xl">₹{cartTotal.toLocaleString()}</span></div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#222222] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg flex justify-center gap-2">Proceed to Checkout <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full" >
              <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="font-serif text-xl">Shipping Details</span>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="checkoutForm" onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Full Name *</label>
                    <input required type="text" value={checkoutData.shipping_name} onChange={(e) => setCheckoutData({...checkoutData, shipping_name: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Phone Number *</label>
                    <input required type="tel" maxLength={10} value={checkoutData.shipping_phone} onChange={(e) => setCheckoutData({...checkoutData, shipping_phone: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Address Line 1 *</label>
                    <input required type="text" value={checkoutData.shipping_address1} onChange={(e) => setCheckoutData({...checkoutData, shipping_address1: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="House/Flat No." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Address Line 2</label>
                    <input type="text" value={checkoutData.shipping_address2} onChange={(e) => setCheckoutData({...checkoutData, shipping_address2: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="Landmark / Area" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">City *</label>
                      <input required type="text" value={checkoutData.shipping_city} onChange={(e) => setCheckoutData({...checkoutData, shipping_city: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">State *</label>
                      <input required type="text" value={checkoutData.shipping_state} onChange={(e) => setCheckoutData({...checkoutData, shipping_state: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Pincode *</label>
                    <input required type="text" maxLength={6} value={checkoutData.shipping_pincode} onChange={(e) => setCheckoutData({...checkoutData, shipping_pincode: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] bg-[#FAFAFA]">
                <div className="flex justify-between items-center mb-4"><span className="font-bold text-gray-500">Amount to Pay</span><span className="font-bold text-xl text-black">₹{cartTotal.toFixed(2)}</span></div>
                <button type="submit" form="checkoutForm" disabled={actionLoading} className={`w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 ${actionLoading ? 'opacity-50' : 'hover:bg-gray-800'}`}>
                  {actionLoading ? "Processing..." : "Place Order Now"}
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