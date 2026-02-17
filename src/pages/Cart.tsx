import { Link } from "react-router-dom";
import { useCart, FREE_SHIPPING_THRESHOLD, FRAME_PRICE } from "@/lib/cart";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Cart = () => {
  const { items, updateQuantity, removeItem, total } = useCart();
  const [coupon, setCoupon] = useState("");
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const freeShipping = total >= FREE_SHIPPING_THRESHOLD;

  if (items.length === 0) {
    return (
      <main className="py-20 text-center">
        <div className="container mx-auto px-4">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-serif text-3xl font-light mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Discover our collection and find something you love.</p>
          <Link
            to="/shop"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-widest hover:bg-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-10">Shopping Cart</h1>

        {/* Free shipping bar */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{freeShipping ? "🎉 You've unlocked free shipping!" : `$${(FREE_SHIPPING_THRESHOLD - total).toFixed(0)} away from free shipping`}</span>
            <span>${FREE_SHIPPING_THRESHOLD}</span>
          </div>
          <div className="w-full h-1.5 bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${shippingProgress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 pb-6 border-b border-border"
              >
                <Link to={`/product/${item.product.id}`} className="w-24 h-32 bg-secondary flex-shrink-0 overflow-hidden">
                  <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-lg">{item.product.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Size: {item.size} {item.withFrame && `· Framed (+$${FRAME_PRICE})`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-4 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-2 hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-serif text-lg">
                      ${((item.product.price + (item.withFrame ? FRAME_PRICE : 0)) * item.quantity).toFixed(0)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-secondary p-8">
            <h2 className="font-serif text-xl mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{freeShipping ? "Free" : "$5.99"}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6 flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 bg-background border border-border px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest hover:bg-primary transition-colors">
                Apply
              </button>
            </div>

            <div className="border-t border-border mt-6 pt-6 flex justify-between font-serif text-xl">
              <span>Total</span>
              <span>${(total + (freeShipping ? 0 : 5.99)).toFixed(2)}</span>
            </div>

            <button className="w-full mt-6 bg-foreground text-background py-4 text-sm uppercase tracking-widest font-medium hover:bg-primary transition-colors duration-300">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
