import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Gem, Package, Heart as HeartHand, Star, BadgeCheck, ThumbsUp, ChevronDown } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Rating from "../components/common/Rating";
import Button from "../components/common/Button";
import QuantityStepper from "../components/common/QuantityStepper";
import ProductCard from "../components/common/ProductCard";
import { PageLoader } from "../components/common/Loader";
import { getProductById, products } from "../data/products";
import { reviewSummary, customerPhotos, customerReviewsList } from "../data/reviews";
import { formatINR, discountPercent } from "../utils/format";
import { useCartStore } from "../store/cartStore";

function fetchProduct(id) {
  return new Promise((resolve) => setTimeout(() => resolve(getProductById(id)), 400));
}

const highlights = [
  { icon: Leaf, label: "Pure & Authentic" },
  { icon: Gem, label: "Premium Quality" },
  { icon: Package, label: "All Items Included" },
  { icon: HeartHand, label: "Delivered with Care" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) return <PageLoader />;
  if (!product) return <p className="section-y section text-center">Product not found.</p>;

  const off = discountPercent(product.mrp, product.price);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: product.name }]} />

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="relative overflow-hidden rounded-xl">
                {off > 0 && <span className="absolute left-3 top-3 z-10 badge bg-primary-500 text-white">{off}% OFF</span>}
                <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <div className="mt-2">
                <Rating value={product.rating} count={product.reviews} />
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary-600">{formatINR(product.price)}</span>
                {off > 0 && (
                  <>
                    <span className="text-ink-500 line-through">{formatINR(product.mrp)}</span>
                    <span className="text-sm font-semibold text-success">({off}% OFF)</span>
                  </>
                )}
              </div>

              <p className="mt-4 text-sm text-ink-500">A complete, carefully sourced set of items for your pooja — pure, authentic, and ready to use.</p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {highlights.map((h) => (
                  <div key={h.label} className="card flex flex-col items-center gap-1.5 py-3 text-center">
                    <h.icon size={18} className="text-primary-500" />
                    <span className="text-[11px] font-medium text-ink-700">{h.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4">
                <QuantityStepper value={qty} onChange={setQty} />
                <Button className="flex-1" onClick={() => addItem(product, qty)}>Add to Cart</Button>
              </div>
              <Button variant="outline" fullWidth className="mt-3">Buy Now</Button>
            </div>
          </div>

          {/* Customer Ratings · Customer Photos · Customer Reviews */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Customer Ratings */}
            <div className="card">
              <h3 className="mb-4 font-semibold">Customer Ratings</h3>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">{reviewSummary.average}</span>
                <div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} className={n <= Math.round(reviewSummary.average) ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                    ))}
                  </div>
                  <p className="text-xs text-ink-500">({reviewSummary.total} Reviews)</p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {reviewSummary.breakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-8 shrink-0">{row.stars} ★</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-500/10">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${row.percent}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-ink-500">{row.percent}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-cream-100 p-3 dark:bg-white/5">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-success"><BadgeCheck size={13} /> Verified Buyer</p>
                <p className="text-xs text-ink-500">
                  Very good quality items. Everything was there in the kit. Made my Ganesh Pooja very easy and peaceful.
                </p>
                <p className="mt-1 text-xs font-medium">- Priya S.</p>
              </div>
            </div>

            {/* Customer Photos */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Customer Photos ({customerPhotos.length + 17})</h3>
                <button className="text-xs font-medium text-primary-600">View All Photos</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {customerPhotos.slice(0, 5).map((photo, i) => (
                  <img key={i} src={photo} alt={`Customer photo ${i + 1}`} className="aspect-square rounded-lg object-cover" loading="lazy" />
                ))}
                <button className="flex aspect-square items-center justify-center rounded-lg bg-ink-900/70 text-sm font-semibold text-white">
                  +17 More
                </button>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Customer Reviews</h3>
                <button className="btn-outline btn-sm">Write a Review</button>
              </div>
              <div className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
                {customerReviewsList.map((review) => (
                  <div key={review.id} className="border-b border-ink-500/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                          {review.name.charAt(0)}
                        </span>
                        <div>
                          <p className="flex items-center gap-1 text-sm font-medium">
                            {review.name} {review.verified && <BadgeCheck size={13} className="text-success" />}
                          </p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star key={n} size={11} className={n <= review.rating ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-ink-500">{review.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink-500">{review.text}</p>
                    <div className="mt-2 flex gap-1.5">
                      {review.photos.map((p, i) => (
                        <img key={i} src={p} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                      ))}
                    </div>
                    <button className="mt-2 flex items-center gap-1 text-xs text-ink-500 hover:text-primary-600">
                      <ThumbsUp size={12} /> Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-primary-600">
                Load More Reviews <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-5 text-xl font-bold">You may also like</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
