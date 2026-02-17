import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { products } from "@/lib/data";
import { useCart, FRAME_PRICE } from "@/lib/cart";
import { Star, ShoppingBag, ArrowLeft, Truck } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const sizeMultiplier: Record<string, number> = { A4: 1, A3: 1.4, A2: 1.8 };

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState("A3");
  const [withFrame, setWithFrame] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link to="/shop" className="text-primary underline">Back to shop</Link>
      </div>
    );
  }

  const price = Math.round(product.price * sizeMultiplier[selectedSize]) + (withFrame ? FRAME_PRICE : 0);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <main className="py-8">
      <div className="container mx-auto px-4 md:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {/* Image with zoom */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-secondary aspect-[3/4] cursor-zoom-in"
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={
                zoomed
                  ? { transform: "scale(2)", transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                  : {}
              }
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-light mb-4">{product.title}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-primary text-primary" : "text-border"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <p className="text-foreground/70 mb-8 leading-relaxed">{product.description}</p>

            <p className="font-serif text-3xl mb-8">${price}</p>

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Size</p>
              <div className="flex gap-3">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-5 py-2.5 text-sm transition-colors duration-200 ${
                      selectedSize === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame option */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Frame</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setWithFrame(false)}
                  className={`px-5 py-2.5 text-sm transition-colors duration-200 ${
                    !withFrame ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  No Frame
                </button>
                <button
                  onClick={() => setWithFrame(true)}
                  className={`px-5 py-2.5 text-sm transition-colors duration-200 ${
                    withFrame ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  Add Frame (+${FRAME_PRICE})
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={() => {
                addItem(product, selectedSize, withFrame);
                toast.success("Added to cart", { description: `${product.title} (${selectedSize})` });
              }}
              className="flex items-center justify-center gap-2 bg-foreground text-background py-4 text-sm uppercase tracking-widest font-medium hover:bg-primary transition-colors duration-300 mb-6"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4" /> Estimated delivery by {deliveryDate}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border pt-16">
            <h2 className="font-serif text-2xl font-light mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;
