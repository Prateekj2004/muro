import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./data";

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  withFrame: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, withFrame: boolean) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FRAME_PRICE = 15;
const FREE_SHIPPING_THRESHOLD = 75;

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export { FREE_SHIPPING_THRESHOLD, FRAME_PRICE };

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: string, withFrame: boolean) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.size === size && i.withFrame === withFrame
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size && i.withFrame === withFrame
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, size, withFrame }];
    });
  };

  const removeItem = (productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQuantity = (productId: string, size: string, qty: number) => {
    if (qty <= 0) return removeItem(productId, size);
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
      )
    );
  };

  const total = items.reduce(
    (sum, i) => sum + (i.product.price + (i.withFrame ? FRAME_PRICE : 0)) * i.quantity,
    0
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
