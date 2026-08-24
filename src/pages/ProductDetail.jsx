import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Leaf, Gem, Package, Heart as HeartHand, Star, BadgeCheck, ThumbsUp } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import QuantityStepper from "../components/common/QuantityStepper";
import { PageLoader } from "../components/common/Loader";
import { getProductDetail, getYouMightLike } from "../api/productApi";
import { updateCart, getCartList } from "../api/cartApi";
import { formatINR } from "../utils/format";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { showToast } from "../components/common/Toast";

const highlights = [
  { icon: Leaf, label: "Pure & Authentic" },
  { icon: Gem, label: "Premium Quality" },
  { icon: Package, label: "All Items Included" },
  { icon: HeartHand, label: "Delivered with Care" },
];

export default function ProductDetail({ type = "product" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

   const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id, type],
    queryFn: () => getProductDetail(id, type),
    select: (res) => res?.data?.data ?? res?.data ?? res,
    enabled: !!id,
  });
  
  // Fetch cart-list so refresh pe bhi correct qty mile
  const { data: cartData } = useQuery({
    queryKey: ["cart-list"],
    queryFn: getCartList,
    select: (res) => res?.data?.data ?? res?.data ?? res,
    enabled: isAuthenticated,
  });
  const cartItems = Array.isArray(cartData) ? cartData : [];
  const cartItem = cartItems.find((i) => i.item_id === product?.id);
  const cartQty = Number(cartItem?.quantity ?? 0);

  const { mutate: cartAction, isPending: cartPending } = useMutation({
    mutationFn: (action) => updateCart(product?.id, type, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart-list"] }),
    onError: (err) => showToast.error(err?.message || "Failed to update cart"),
  });

  function handleCartAction(action) {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("poojify:require-login"));
      return;
    }
    cartAction(action);
  }

  // Add qty items one by one (API takes single action)
  function handleAddToCart() {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("poojify:require-login"));
      return;
    }
    // Call add action `qty` times sequentially
    const calls = Array.from({ length: qty }, (_, i) => i);
    calls.reduce((p) => p.then(() => updateCart(product?.id, type, 1)), Promise.resolve())
      .then(() => queryClient.invalidateQueries({ queryKey: ["cart-list"] }))
      .catch((err) => showToast.error(err?.message || "Failed to add to cart"));
  }

 

  const { data: related = [] } = useQuery({
    queryKey: ["you-might-like", id, type],
    queryFn: () => getYouMightLike(id, type),
    select: (res) => {
      const d = res?.data?.data ?? res?.data?.items ?? res?.data ?? res?.items ?? res;
      return Array.isArray(d) ? d : [];
    },
    enabled: !!id,
  });
 const [lightboxIndex, setLightboxIndex] = useState(null);

  const photos = (product?.reviews ?? [])
    .flatMap((r) => r.photos ?? r.images ?? [])
    .filter(Boolean);

  if (isLoading) return <PageLoader />;
  if (!product) return <p className="section-y section text-center">Product not found.</p>;

  const allImages = [product.main_image ?? product.image, ...(product.images ?? [])].filter(Boolean);
  const price = product.discount_price ?? product.price;
  const mrp = product.price;
  const off = product.discount_percentage ?? (mrp && price < mrp ? Math.round((1 - price / mrp) * 100) : 0);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Shop", to: "/shop" }, { label: product.name }]} />

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images */}
            <div>
              <div className="relative overflow-hidden rounded-xl">
                {off > 0 && <span className="absolute left-3 top-3 z-10 badge bg-primary-500 text-white">{off}% OFF</span>}
                <img src={allImages[activeImg]} alt={product.name} className="aspect-square w-full object-cover" />
              </div>
              {allImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${activeImg === i ? "border-primary-500" : "border-transparent"}`}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={14} className={n <= Math.round(product.average_rating ?? product.product_rating ?? 0) ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                  ))}
                </div>
                <span className="text-sm text-ink-500">({product.total_reviews ?? 0} reviews)</span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary-600">{formatINR(price)}</span>
                {off > 0 && (
                  <>
                    <span className="text-ink-500 line-through">{formatINR(mrp)}</span>
                    <span className="text-sm font-semibold text-success">({off}% OFF)</span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="mt-4 whitespace-pre-line text-sm text-ink-500">{product.description}</p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {highlights.map((h) => (
                  <div key={h.label} className="card flex flex-col items-center gap-1.5 py-3 text-center">
                    <h.icon size={18} className="text-primary-500" />
                    <span className="text-[11px] font-medium text-ink-700">{h.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4">
                {cartQty === 0 ? (
                  <>
                    <QuantityStepper value={qty} onChange={setQty} />
                    <Button className="flex-1" loading={cartPending} onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-white px-3 py-2">
                      <button onClick={() => handleCartAction(-1)} disabled={cartPending} className="text-danger disabled:opacity-40">
                        <span className="text-lg font-bold">−</span>
                      </button>
                      <span className="min-w-[1.5rem] text-center text-base font-bold">{cartQty}</span>
                      <button onClick={() => handleCartAction(1)} disabled={cartPending} className="text-primary-600 disabled:opacity-40">
                        <span className="text-lg font-bold">+</span>
                      </button>
                    </div>
                    <Link to="/cart" className="btn-primary flex-1 text-center">
                      View Cart
                    </Link>
                  </>
                )}
              </div>

              {/* Combo included products — shown below Add to Cart */}
              {type === "combo" && product.products?.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-ink-700">Items included in this combo:</p>
                  <div className="space-y-2">
                    {product.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/shop/product/${p.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl border border-ink-500/10 p-2.5 text-left hover:border-primary-300 transition"
                      >
                        {(p.main_image || p.image) && (
                          <img src={p.main_image ?? p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-sm font-bold text-primary-600">{formatINR(p.discount_price ?? p.price)}</span>
                            {p.discount_price < p.price && (
                              <span className="text-[11px] text-ink-500 line-through">{formatINR(p.price)}</span>
                            )}
                            {p.discount_percentage > 0 && (
                              <span className="text-[11px] font-semibold text-success">{p.discount_percentage}% off</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <h2 className="mb-5 text-xl font-bold">Customer Reviews ({product.total_reviews ?? 0})</h2>
            
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Customer Ratings */}
              <div className="card">
                <h3 className="mb-4 font-semibold">Customer Ratings</h3>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold">{(product.average_rating ?? product.product_rating ?? 0).toFixed(1)}</span>
                  <div>
                    <div className="flex">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={16} className={n <= Math.round(product.average_rating ?? 0) ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                      ))}
                    </div>
                    <p className="text-xs text-ink-500">({product.total_reviews ?? 0} Reviews)</p>
                  </div>
                </div>
                {/* Breakdown bars — 5★ to 1★ */}
                <div className="mt-4 space-y-4">
                  {[5,4,3,2,1].map((star) => {
                    const count = product.reviews?.filter((r) => Math.round(r.rating) === star).length ?? 0;
                    const total = product.reviews?.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-8 shrink-0">{star} ★</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-500/10">
                          <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-ink-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Photos */}
              {/* <div className="card">
                <h3 className="mb-4 font-semibold">Customer Photos</h3>
                {(() => {
                  const photos = (product.reviews ?? []).flatMap((r) => r.photos ?? r.images ?? []).filter(Boolean);
                  return photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.slice(0, 6).map((p, i) => (
                        <img key={i} src={p} alt={`Customer photo ${i+1}`} className="aspect-square rounded-lg object-cover" loading="lazy" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500">No photos yet.</p>
                  );
                })()}
              </div> */}
     
    <div className="card">
      <h3 className="mb-4 font-semibold">Customer Photos</h3>

      {photos.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, 4).map((p, i) => {
              const remaining = photos.length - 4;

              return (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={p}
                    alt={`Customer photo ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  {/* 4th image par +N */}
                  {i === 3 && remaining > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold text-white">
                      +{remaining}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lightbox modal */}
          {lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setLightboxIndex(null)}
            >
              <div
                className="relative max-h-full max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  className="absolute -top-10 right-0 text-white text-2xl font-bold"
                  onClick={() => setLightboxIndex(null)}
                >
                  ✕
                </button>

                {/* Main image */}
                <img
                  src={photos[lightboxIndex]}
                  alt={`Customer photo ${lightboxIndex + 1}`}
                  className="max-h-[70vh] w-full rounded-lg object-contain mx-auto"
                />

                {/* Prev / Next */}
                {photos.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white"
                      onClick={() =>
                        setLightboxIndex(
                          (lightboxIndex - 1 + photos.length) % photos.length
                        )
                      }
                    >
                      ‹
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white"
                      onClick={() =>
                        setLightboxIndex((lightboxIndex + 1) % photos.length)
                      }
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Thumbnail strip - saare photos yahan dikhenge */}
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {photos.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt={`thumb ${i + 1}`}
                      onClick={() => setLightboxIndex(i)}
                      className={`h-14 w-14 flex-shrink-0 cursor-pointer rounded-md object-cover ${
                        i === lightboxIndex ? "ring-2 ring-white" : "opacity-70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-500">No photos yet.</p>
      )}
    </div>


              {/* Customer Reviews */}
              <div className="card">
                <h3 className="mb-4 font-semibold">Customer Reviews</h3>
                {!product.reviews?.length ? (
                  <p className="text-sm text-ink-500">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
                    {product.reviews.map((review, i) => (
                      <div key={i} className="border-b border-ink-500/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                              {review.user_name?.charAt(0) ?? "U"}
                            </span>
                            <div>
                              <p className="flex items-center gap-1 text-sm font-medium">
                                {review.user_name} {review.verified && <BadgeCheck size={13} className="text-success" />}
                              </p>
                              <div className="flex">
                                {[1,2,3,4,5].map((n) => (
                                  <Star key={n} size={11} className={n <= review.rating ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.date && <span className="text-[11px] text-ink-500">{review.date}</span>}
                        </div>
                        {review.review_text && <p className="mt-2 text-sm text-ink-500">{review.review_text}</p>}
                        {review.helpful != null && (
                          <button className="mt-2 flex items-center gap-1 text-xs text-ink-500 hover:text-primary-600">
                            <ThumbsUp size={12} /> Helpful ({review.helpful})
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* You may also like */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-5 text-xl font-bold">You may also like</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {related.map((p) => (
                  <a key={p.id} href={`/shop/product/${p.id}`} className="card group block">
                    <div className="relative overflow-hidden rounded-lg">
                      {p.discount_percentage > 0 && (
                        <span className="absolute left-2 top-2 badge bg-primary-500 text-white text-[10px]">{p.discount_percentage}% OFF</span>
                      )}
                      <img src={p.main_image} alt={p.name} className="aspect-square w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="mt-2 text-xs font-medium line-clamp-2">{p.name}</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-primary-600">{formatINR(p.discount_price ?? p.price)}</span>
                      {p.discount_price && p.discount_price < p.price && (
                        <span className="text-[11px] text-ink-500 line-through">{formatINR(p.price)}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
