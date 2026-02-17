import { useSearchParams } from "react-router-dom";
import { products, categories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get("cat") || "All";

  const filtered = activeCat === "All" ? products : products.filter((p) => p.category === activeCat);

  return (
    <main className="py-12">
      <div className="container mx-auto px-4 md:px-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-serif text-4xl md:text-5xl font-light mb-10"
        >
          {activeCat === "All" ? "All Posters" : activeCat}
        </motion.h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (cat === "All") {
                  searchParams.delete("cat");
                } else {
                  searchParams.set("cat", cat);
                }
                setSearchParams(searchParams);
              }}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-200 ${
                activeCat === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No posters found in this category.</p>
        )}
      </div>
    </main>
  );
};

export default Shop;
