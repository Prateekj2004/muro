import { Link } from "react-router-dom";
import { Product } from "@/lib/data";
import { motion } from "framer-motion";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {product.bestseller && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-sans uppercase tracking-widest px-3 py-1">
            Bestseller
          </span>
        )}
      </div>
      <h3 className="font-serif text-lg font-medium text-foreground">{product.title}</h3>
      <p className="text-muted-foreground text-sm mt-1">From ${product.price}</p>
    </Link>
  </motion.div>
);

export default ProductCard;
