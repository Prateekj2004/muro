import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Info,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/services/api";
import { cartApi } from "@/services/cartApi";

type ProductItem = {
  id?: string | number;
  product_id?: string | number;
  productId?: string | number;
  title?: string;
  name?: string;
  price?: string | number;
  base_price?: string | number;
  original_price?: string | number;
  originalPrice?: string | number;
  category?: string;
  subcategory?: string;
  description?: string;
  about_artwork?: string;
  quote?: string;
  main_poster_url?: string;
  defaultImg?: string;
  image_url?: string;
  zoom_in_url?: string;
  wall_poster_url?: string;
  hoverImg?: string;
  tags?: string[] | string;
};

const COLORS = {
  cloud: "#F0EEE9",
  blackboard: "#1C1C1C",
  green: "#006039",
};

const getFullImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/600x800?text=No+Image";

  if (path.startsWith("http")) return path;

  let cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (!cleanPath.includes("uploads/product")) {
    cleanPath = `uploads/product/${cleanPath}`;
  }

  return `https://muroposter.com/${cleanPath}`;
};

const safeNumber = (value?: string | number) => {
  const cleanValue = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  const num = Number(cleanValue);
  return Number.isFinite(num) && num > 0 ? num : 500;
};

const formatPrice = (price?: string | number) => {
  const numericValue = safeNumber(price);
  return `₹${numericValue.toLocaleString("en-IN")}`;
};

const getProductTitle = (product?: ProductItem | null) => {
  return product?.title || product?.name || "Product";
};

const getProductPrice = (product?: ProductItem | null) => {
  return product?.price || product?.base_price || 500;
};

const getMainPosterImage = (product?: ProductItem | null) => {
  return (
    product?.zoom_in_url ||
    product?.main_poster_url ||
    product?.defaultImg ||
    product?.image_url ||
    product?.wall_poster_url ||
    product?.hoverImg ||
    ""
  );
};

const getCardPosterImage = (product?: ProductItem | null) => {
  return (
    product?.zoom_in_url ||
    product?.main_poster_url ||
    product?.defaultImg ||
    product?.image_url ||
    product?.wall_poster_url ||
    product?.hoverImg ||
    ""
  );
};

const resolveProductId = (
  product?: ProductItem | null,
  routeId?: string
): number | null => {
  const possibleId =
    product?.id ??
    product?.product_id ??
    product?.productId ??
    routeId ??
    "";

  const cleanId = String(possibleId).trim();

  if (!cleanId || cleanId === "undefined" || cleanId === "null") {
    return null;
  }

  const numericId = Number(cleanId);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return null;
  }

  return numericId;
};

const sizeOptions = ["A4", "A6", "12x18"];

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stateProduct = (location.state as any)?.productData as
    | ProductItem
    | undefined;

  const [product, setProduct] = useState<ProductItem | null>(
    stateProduct || null
  );

  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(!stateProduct);
  const [selectedSize, setSelectedSize] = useState("A4");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);

      try {
        const res: any = await API.getProducts().catch(() => []);
        const items: ProductItem[] = Array.isArray(res)
          ? res
          : res?.data?.items || res?.data || [];

        setAllProducts(items);

        if (!stateProduct) {
          const found = items.find((item) => {
            const itemId = resolveProductId(item);
            return String(itemId) === String(id);
          });

          setProduct(found || null);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, stateProduct]);

  useEffect(() => {
    if (stateProduct && allProducts.length === 0) {
      const fetchRelatedOnly = async () => {
        try {
          const res: any = await API.getProducts().catch(() => []);
          const items: ProductItem[] = Array.isArray(res)
            ? res
            : res?.data?.items || res?.data || [];

          setAllProducts(items);
        } catch (error) {
          console.error("Failed to fetch related products:", error);
        }
      };

      fetchRelatedOnly();
    }
  }, [stateProduct, allProducts.length]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const currentProductId = resolveProductId(product, id);

    const sameCategory = allProducts.filter((item) => {
      const itemId = resolveProductId(item);
      const notSame = String(itemId) !== String(currentProductId);

      const categoryMatch =
        product.category &&
        item.category &&
        item.category.toLowerCase() === product.category.toLowerCase();

      return notSame && categoryMatch;
    });

    const fallback = allProducts.filter((item) => {
      const itemId = resolveProductId(item);
      return String(itemId) !== String(currentProductId);
    });

    return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 5);
  }, [allProducts, product, id]);

  const productTitle = getProductTitle(product);
  const productPrice = getProductPrice(product);
  const mainImage = getMainPosterImage(product);

  const productTags = useMemo(() => {
    if (!product?.tags) {
      return [
        product?.category || "Poster",
        product?.subcategory || "Wall Art",
      ].filter(Boolean);
    }

    if (Array.isArray(product.tags)) return product.tags;

    return String(product.tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [product]);

  const handleQuantityChange = (type: "minus" | "plus") => {
    setQuantity((prev) => {
      if (type === "minus") return Math.max(1, prev - 1);
      return prev + 1;
    });
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (!product) {
      toast.error("Product data missing");
      return false;
    }

    const productId = resolveProductId(product, id);

    if (!productId) {
      console.error("Invalid cart product id:", {
        routeId: id,
        product,
      });

      toast.error("Product id missing or invalid");
      return false;
    }

    setCartLoading(true);

    try {
      await cartApi.addItem({
        product_id: productId,
        qty: quantity,
      });

      toast.success("Item added to cart");
      window.dispatchEvent(new Event("muro_cart_updated"));
      return true;
    } catch (error: any) {
      console.error("Add to cart failed:", error);
      toast.error(error?.message || "Failed to add item to cart");
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();

    if (added) {
      navigate("/cart", {
        state: {
          openCheckout: true,
        },
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0EEE9] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F0EEE9] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[28px] font-semibold text-[#1C1C1C] mb-4">
            Product not found
          </h1>

          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-[#1C1C1C] text-white px-8 py-3 text-[12px] uppercase tracking-[0.18em]"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden font-sans"
      style={{
        backgroundColor: COLORS.cloud,
        color: COLORS.blackboard,
      }}
    >
      <section className="w-full py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#1C1C1C]/45">
            <Link to="/" className="hover:text-[#1C1C1C] transition-colors">
              Home
            </Link>

            <ChevronRight size={13} />

            <Link
              to="/products"
              className="hover:text-[#1C1C1C] transition-colors"
            >
              Products
            </Link>

            {product.category && (
              <>
                <ChevronRight size={13} />
                <span className="text-[#1C1C1C] font-semibold">
                  {product.category}
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-start">
            <div className="w-full">
              <img
                src={getFullImageUrl(mainImage)}
                alt={productTitle}
                className="block w-full h-auto object-contain"
              />
            </div>

            <div className="w-full lg:pt-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#1C1C1C]/40 mb-5">
                {product.category || "Poster"}
                {product.subcategory ? ` > ${product.subcategory}` : ""}
              </p>

              <h1 className="text-[34px] md:text-[42px] lg:text-[46px] leading-tight text-[#1C1C1C] font-normal tracking-[-0.04em] mb-5">
                {productTitle}
              </h1>

              <p className="text-[28px] md:text-[32px] font-semibold text-[#1C1C1C] mb-5">
                {formatPrice(productPrice)}
              </p>

              <p className="text-[15px] md:text-[16px] leading-relaxed text-[#1C1C1C]/60 mb-8 max-w-[620px]">
                {product.quote ||
                  product.description ||
                  "Premium wall poster designed to bring focus, mood and personality into your space."}
              </p>

              <div className="h-px bg-[#1C1C1C]/12 mb-8" />

              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#1C1C1C]/45 font-semibold mb-4">
                  Select Size
                </p>

                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[76px] h-[42px] px-5 rounded-[12px] text-[13px] font-semibold uppercase tracking-[0.08em] transition-all ${
                        selectedSize === size
                          ? "bg-[#1C1C1C] text-white shadow-sm"
                          : "bg-white border border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#1C1C1C]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4 mb-5">
                <div className="h-[56px] border border-[#1C1C1C]/15 bg-white flex items-center justify-between px-4">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("minus")}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#F0EEE9] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="text-[16px] font-semibold">{quantity}</span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange("plus")}
                    className="w-7 h-7 flex items-center justify-center hover:bg-[#F0EEE9] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className={`h-[56px] border border-[#1C1C1C] bg-transparent text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all text-[12px] font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-3 ${
                    cartLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <ShoppingBag size={17} />
                  {cartLoading ? "Adding..." : "Add To Cart"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={cartLoading}
                className={`w-full h-[58px] bg-[#1C1C1C] text-white hover:bg-[#006039] transition-colors text-[12px] font-semibold uppercase tracking-[0.2em] mb-8 ${
                  cartLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {cartLoading ? "Processing..." : "Buy It Now"}
              </button>

              <div className="rounded-[22px] bg-white/65 border border-[#1C1C1C]/8 p-6 md:p-7 mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={17} className="text-[#1C1C1C]" />

                  <h2 className="text-[13px] uppercase tracking-[0.18em] font-semibold text-[#1C1C1C]">
                    About This Artwork
                  </h2>
                </div>

                <p className="text-[14px] md:text-[15px] leading-relaxed text-[#1C1C1C]/65 mb-5">
                  {product.about_artwork ||
                    product.description ||
                    "This artwork is designed to add meaning, mood and visual impact to your wall. It works well for bedrooms, workspaces, study corners and creative interiors."}
                </p>

                <p className="text-[14px] md:text-[15px] leading-relaxed text-[#1C1C1C]/65">
                  Best for: anyone who wants a clean, motivational and premium
                  wall decor piece.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tag size={15} className="text-[#1C1C1C]/45" />

                {productTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/70 border border-[#1C1C1C]/8 px-3 py-2 text-[10px] uppercase tracking-[0.12em] font-semibold text-[#1C1C1C]/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-14 bg-[#F0EEE9] border-t border-[#1C1C1C]/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-normal tracking-[0.18em] text-[22px] md:text-[26px] text-[#1C1C1C] uppercase leading-none">
              You Might Also Like
            </h2>

            <Link
              to="/products"
              className="shrink-0 text-[12px] md:text-[14px] font-medium tracking-[0.18em] text-[#1C1C1C] uppercase hover:text-[#006039] transition-colors"
            >
              View All
            </Link>
          </div>

          {relatedProducts.length === 0 ? (
            <div className="h-[18vh] flex items-center justify-center text-[#1C1C1C]/45">
              <p className="text-sm tracking-widest uppercase">
                No related products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7 items-start">
              {relatedProducts.map((item, index) => {
                const itemTitle = getProductTitle(item);
                const posterImage = getCardPosterImage(item);
                const itemPrice = getProductPrice(item);
                const relatedId = resolveProductId(item);

                if (!relatedId) return null;

                return (
                  <Link
                    key={relatedId || index}
                    to={`/product/${relatedId}`}
                    state={{ productData: item }}
                    className="group cursor-pointer flex flex-col h-full w-full"
                  >
                    <div className="w-full">
                      <div className="relative w-full mb-4 overflow-hidden">
                        <img
                          src={getFullImageUrl(posterImage)}
                          alt={itemTitle}
                          className="block w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>

                      <div className="w-full text-left">
                        <h3 className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C] leading-snug mb-2 w-full min-h-[42px]">
                          {itemTitle}
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[15px] md:text-[16px] font-semibold text-[#1C1C1C]">
                            {formatPrice(itemPrice)}
                          </span>

                          {(item.original_price || item.originalPrice) && (
                            <span className="text-[13px] md:text-[14px] text-[#1C1C1C]/40 line-through">
                              {formatPrice(
                                item.original_price || item.originalPrice
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;