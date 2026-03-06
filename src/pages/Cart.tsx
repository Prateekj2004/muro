import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  
  // INITIALIZE FROM LOCAL STORAGE
  const [cartItems, setCartItems] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem("muro_cart") || "[]");
  });

  const [cartTotal, setCartTotal] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState({
    shipping_name: "", shipping_phone: "", shipping_address1: "",
    shipping_city: "", shipping_pincode: ""
  });

  // Calculate total whenever items change & sync with storage
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.qty), 0);
    setCartTotal(total);
    localStorage.setItem("muro_cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("storage"));
  }, [cartItems]);

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const newItems = [...cartItems];
    newItems[index].qty = newQty;
    newItems[index].line_total = (parseFloat(newItems[index].price) * newQty).toFixed(2);
    setCartItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
    toast.success("Item removed from cart.");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setTimeout(() => {
      toast.success("Order Placed Successfully! 🎉");
      setIsCheckoutOpen(false);
      setCartItems([]);
      localStorage.removeItem("muro_cart");
      setActionLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <main className="bg-white min-h-screen font-sans text-[#222222] pb-24 relative">
      <div className="bg-[#F0EEE9]/30 py-16 text-center border-b border-[#E5E5E5]">
        <h1 className="font-serif text-4xl font-light tracking-tight">Shopping Cart</h1>
      </div>

      <div className="container mx-auto px-5 md:px-8 mt-12 max-w-6xl">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-100 mb-6" strokeWidth={1} />
            <p className="text-xl font-serif mb-6">Your cart is currently empty.</p>
            <Link to="/products" className="bg-[#222222] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#2F4F4F] transition-colors">Continue Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="flex-1">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#E5E5E5] text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {cartItems.map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col md:grid md:grid-cols-12 items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="col-span-6 flex items-center gap-6 w-full">
                        <div className="w-20 md:w-24 aspect-[4/5] bg-[#F4F4F4] flex-shrink-0 border border-gray-100">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-serif text-lg line-clamp-1">{item.title}</span>
                          <span className="text-[11px] text-gray-400 uppercase font-bold tracking-widest mt-1">{item.variant}</span>
                          <span className="text-[12px] text-gray-500 mt-1 font-medium">₹{item.price}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center mt-4 md:mt-0">
                        <div className="flex items-center border border-[#E5E5E5] h-10 w-28 bg-white">
                          <button onClick={() => updateQuantity(idx, item.qty - 1)} className="w-8 flex items-center justify-center hover:bg-gray-50"><Minus size={14}/></button>
                          <span className="flex-1 text-center text-xs font-bold">{item.qty}</span>
                          <button onClick={() => updateQuantity(idx, item.qty + 1)} className="w-8 flex items-center justify-center hover:bg-gray-50"><Plus size={14}/></button>
                        </div>
                      </div>
                      <div className="col-span-3 text-right w-full md:w-auto text-sm font-bold">₹{item.line_total}</div>
                      <div className="col-span-1 flex justify-end"><button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button></div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-[#FAFAFA] p-8 border border-[#E5E5E5] sticky top-24">
                <h3 className="font-serif text-xl mb-6">Order Summary</h3>
                <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="text-green-600 font-medium">Free</span></div>
                </div>
                <div className="flex justify-between items-center mb-8"><span className="font-bold text-base">Total</span><span className="font-bold text-xl">₹{cartTotal.toFixed(2)}</span></div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#222222] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#2F4F4F] transition-colors flex items-center justify-center gap-2 shadow-lg">Proceed to Checkout <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col" >
              <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <span className="font-serif text-xl">Shipping Details</span>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form id="checkoutForm" onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Full Name *</label>
                    <input required type="text" value={checkoutData.shipping_name} onChange={(e) => setCheckoutData({...checkoutData, shipping_name: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="Suraj Poswal" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Phone Number *</label>
                    <input required type="tel" maxLength={10} value={checkoutData.shipping_phone} onChange={(e) => setCheckoutData({...checkoutData, shipping_phone: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="9999999999" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Address *</label>
                    <input required type="text" value={checkoutData.shipping_address1} onChange={(e) => setCheckoutData({...checkoutData, shipping_address1: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="House 10, Street 2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">City *</label>
                      <input required type="text" value={checkoutData.shipping_city} onChange={(e) => setCheckoutData({...checkoutData, shipping_city: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="Delhi" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Pincode *</label>
                      <input required type="text" maxLength={6} value={checkoutData.shipping_pincode} onChange={(e) => setCheckoutData({...checkoutData, shipping_pincode: e.target.value})} className="w-full border-b border-gray-200 py-2 outline-none focus:border-black text-sm" placeholder="110001" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-[#E5E5E5] bg-[#FAFAFA]">
                <div className="flex justify-between items-center mb-4"><span className="font-bold text-gray-500">Amount to Pay</span><span className="font-bold text-xl text-black">₹{cartTotal.toFixed(2)}</span></div>
                <button type="submit" form="checkoutForm" disabled={actionLoading} className={`w-full bg-[#57663D] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 ${actionLoading ? 'opacity-50' : 'hover:bg-[#465330]'}`}>
                  {actionLoading ? "Processing..." : "Place Order Now"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Cart;