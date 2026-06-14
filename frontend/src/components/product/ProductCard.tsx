"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, getDiscountPercent, truncate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: { url: string; publicId: string }[];
  category: { name: string; slug: string };
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isOutOfStock?: boolean;
  ratings?: number;
  numReviews?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const wishlisted = isWishlisted(product._id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleAddToCart = () => {
    addItem({
      _id: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price: product.price,
      discountPrice: product.discountPrice,
      quantity: 1,
      category: product.category?.name || "",
    });
    toast.success(`${product.name} added to cart! 🛍️`);
    openCart();
  };

  const discount = product.discountPrice ? getDiscountPercent(product.price, product.discountPrice) : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: isHovered ? "transform 0.1s ease" : "transform 0.4s ease",
      }}
      className="product-card group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        <Image
          src={product.images[0]?.url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay on hover */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to top, rgba(26,10,26,0.6) 0%, transparent 60%)" }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="discount-badge px-2 py-0.5 text-[10px]">-{discount}%</span>
          )}
          {product.isBestSeller && (
            <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-[10px] font-bold">
              ⭐ Best Seller
            </span>
          )}
          {product.isTrending && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
              style={{ background: "linear-gradient(135deg, #E8748A, #9B72CF)" }}>
              🔥 Trending
            </span>
          )}
          {product.isOutOfStock && (
            <span className="bg-gray-900/80 text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product._id); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist! 💕"); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            wishlisted ? "bg-pink-500 text-white" : "bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white"
          } backdrop-blur-sm shadow-sm`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Quick View on hover */}
        <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <Link href={`/product/${product._id}`}>
            <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-white transition-colors shadow-md">
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-pink-400 font-medium uppercase tracking-wide mb-1">
          {product.category?.name}
        </p>

        {/* Name */}
        <Link href={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-800 leading-tight group-hover:text-pink-600 transition-colors text-sm sm:text-base">
            {truncate(product.name, 45)}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{truncate(product.description, 60)}</p>

        {/* Rating */}
        {(product.ratings || 0) > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.ratings || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.numReviews || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="price-discount text-base font-bold">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="price-original text-sm">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddToCart}
            disabled={product.isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              product.isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "btn-luxury"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <Link href={`/checkout?buyNow=${product._id}`}>
            <button
              disabled={product.isOutOfStock}
              className="px-4 py-2.5 rounded-full text-sm font-semibold border border-pink-300 text-pink-600 hover:bg-pink-50 transition-all duration-200"
            >
              Order Now
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
