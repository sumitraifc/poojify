import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, ArrowLeft, Lock, ShieldCheck, RefreshCw, Truck, ShoppingCart, Tag, ChevronDown, ChevronUp, Check } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import QuantityStepper from "../components/common/QuantityStepper";
import { PageLoader } from "../components/common/Loader";
import { useAuthStore } from "../store/authStore";
import { getCartList, updateCart, clearCartApi, getCouponList } from "../api/cartApi";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";

const perks = [
  { icon: ShieldCheck, title: "100% Authentic Products", subtitle: "Sourced from trusted vendors" },
  { icon: Lock, title: "Secure & Safe Payments", subtitle: "Multiple payment options" },
  { icon: RefreshCw, title: "Easy Returns", subtitle: "Hassle-free return policy" },
  { icon: Truck, title: "On-Time Delivery", subtitle: "Fast & reliable delivery" },
];

export default function Cart() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cart-list"],
    queryFn: getCartList,
    select: (res) => res?.data ?? [],
  });

  const { data: coupons } = useQuery({
    queryKey: ["coupon-list"],
    queryFn: getCouponList,
    select: (res) => res?.data ?? [],
  });

  const { mutate: cartAction } = useMutation({
    mutationFn: ({ item_id, type, action }) => updateCart(item_id, type, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart-list"] }),
  });

  const { mutate: handleClearCart } = useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart-list"] }),
  });

  function handleRemove(item) {
    cartAction({ item_id: item.item_id ?? item.id, type: item.type ?? "product", action: -1 });
  }

  function handleQtyChange(item, newQty) {
    const diff = newQty - item.qty;
    if (diff === 0) return;
    cartAction({ item_id: item.item_id ?? item.id, type: item.type ?? "product", action: diff > 0 ? 1 : -1 });
  }

  function applyCoupon(code) {
    const coupon = (coupons ?? []).find((c) => c.code.trim().toLowerCase() === code.trim().toLowerCase());
    if (!coupon) return showToast.error("Invalid coupon code");
    if (!coupon.is_active) return showToast.error("This coupon is no longer active");
    const now = new Date();
    if (new Date(coupon.expiry_date) < now) return showToast.error("This coupon has expired");
    if (new Date(coupon.start_date) > now) return showToast.error("This coupon is not valid yet");
    if (subtotal < Number(coupon.min_order_amount))
      return showToast.error(`Min order ${formatINR(coupon.min_order_amount)} required`);
    setAppliedCoupon(coupon);
    setCouponInput("");
    setShowCoupons(false);
    showToast.success(`Coupon "${coupon.code}" applied!`);
  }

  const items = (Array.isArray(data) ? data : []).map((i) => ({
    id: i.item_id,
    name: i.name,
    image: i.main_image ?? i.products?.[0]?.main_image ?? null,
    price: Number(i.discount_price ?? i.price ?? 0),
    mrp: Number(i.price ?? 0),
    qty: Number(i.quantity ?? 1),
    type: i.type ?? "product",
    products: i.products ?? null,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const mrpTotal = items.reduce((sum, i) => sum + (i.mrp || i.price) * i.qty, 0);
  const productDiscount = mrpTotal - subtotal;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percent"
      ? Math.round(subtotal * Number(appliedCoupon.discount_value) / 100)
      : Number(appliedCoupon.discount_value)
    : 0;
  // const deliveryCharge = subtotal >= 499 || items.length === 0 ? 0 : 49;
  const grandTotal = subtotal - couponDiscount ;
  // const grandTotal = subtotal - couponDiscount + deliveryCharge;

  if (isLoading) return <PageLoader />;

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="section-y section">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            subtitle="Looks like you haven't added anything yet."
            actionLabel="Continue Shopping"
            onAction={() => navigate("/shop")}
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
          <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <ShoppingCart className="text-primary-500" /> Your Cart ({items.length} Items)
          </h1>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <div className="card overflow-hidden !p-0">
                {/* Desktop table */}
                <table className="hidden w-full text-sm sm:table">
                  <thead className="bg-cream-100 text-left text-xs text-ink-500">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Total</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-ink-500/10"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {/* {item.image
                                ? <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                                : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-xs text-ink-400">Combo</div>
                              } */}
                              <Link
                                  to={item.type === "combo" ? `/combo-offers/${item.id}` : `/shop/product/${item.id}`}
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-xs text-ink-400">
                                      Combo
                                    </div>
                                  )}
                                </Link>
                              <div>
                                <Link
                                  to={item.type === "combo" ? `/combo-offers/${item.id}` : `/shop/product/${item.id}`}
                                  className="font-medium hover:text-primary-600"
                                >
                                  {item.name}
                                </Link>
                                {item.type === "combo" && item.products?.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                    {item.products.map((p) => (
                                      <p key={p.id} className="text-[11px] text-ink-500 leading-snug">• {p.name.trim()}</p>
                                    ))}
                                  </div>
                                )}
                                {item.type !== "combo" && <p className="text-xs text-ink-500">Delivery in 2-3 days</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-primary-600">{formatINR(item.price)}</span>
                            {item.mrp > item.price && <span className="ml-1 text-xs text-ink-500 line-through">{formatINR(item.mrp)}</span>}
                          </td>
                          <td className="p-4">
                            <QuantityStepper value={item.qty} onChange={(v) => handleQtyChange(item, v)} />
                            {/* <button onClick={() => handleRemove(item)} className="mt-1.5 flex items-center gap-1 text-xs text-danger">
                              <Trash2 size={12} /> Remove
                            </button> */}
                          </td>
                          <td className="p-4 font-semibold">{formatINR(item.price * item.qty)}</td>
                          <td className="p-4">
                            <button onClick={() => handleRemove(item)} aria-label="Remove item" className="text-ink-500 hover:text-danger">
                              <X size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {/* Mobile card list */}
                <div className="sm:hidden">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-ink-500/10 p-3"
                      >
                        {/* Product name on top */}
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <Link
                            to={item.type === "combo" ? `/combo-offers/${item.id}` : `/shop/product/${item.id}`}
                            className="text-sm font-semibold leading-snug hover:text-primary-600"
                          >
                            {item.name}
                          </Link>
                          <button onClick={() => handleRemove(item)} aria-label="Remove" className="shrink-0 text-ink-400 hover:text-danger">
                            <X size={16} />
                          </button>
                        </div>
                        {/* Image + price/qty row */}
                        <div className="flex items-center gap-3">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                            : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-xs text-ink-400">Combo</div>
                          }
                          <div className="flex flex-1 flex-col gap-2">
                            {item.type === "combo" && item.products?.length > 0
                              ? <div className="space-y-0.5">{item.products.map((p) => <p key={p.id} className="text-[11px] text-ink-500 leading-snug">• {p.name.trim()}</p>)}</div>
                              : <p className="text-xs text-ink-500">Delivery in 2-3 days</p>
                            }
                            <div className="flex items-center gap-3">
                              <QuantityStepper value={item.qty} onChange={(v) => handleQtyChange(item, v)} />
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-primary-600">{formatINR(item.price)}</span>
                                {item.mrp > item.price && <span className="text-xs text-ink-500 line-through">{formatINR(item.mrp)}</span>}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-ink-500">Total: <span className="font-semibold text-ink-900 dark:text-cream-100">{formatINR(item.price * item.qty)}</span></span>
                              <button onClick={() => handleRemove(item)} className="flex items-center gap-1 text-xs text-danger">
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <Link to="/shop" className="flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-primary-600">
                    <ArrowLeft size={15} /> Continue Shopping
                  </Link>
                  <button onClick={() => handleClearCart()} className="btn-outline btn-sm border-danger text-danger hover:bg-danger/5">
                    <Trash2 size={14} /> Clear Cart
                  </button>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold"><Tag size={16} className="text-primary-500" /> Apply Coupon</h3>
                  {coupons?.length > 0 && (
                    <button onClick={() => setShowCoupons((p) => !p)} className="flex items-center gap-1 text-xs text-primary-600">
                      View all {showCoupons ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="input flex-1"
                  />
                  <Button variant="outline" onClick={() => applyCoupon(couponInput)}>Apply</Button>
                </div>

                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                    <span className="flex items-center gap-1.5"><Check size={14} /> "{appliedCoupon.code}" applied</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-danger"><X size={14} /></button>
                  </div>
                )}

                <AnimatePresence>
                  {showCoupons && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      {(coupons ?? []).map((c) => {
                        const expired = new Date(c.expiry_date) < new Date();
                        return (
                        <div key={c.id} className={`flex items-center justify-between rounded-lg border border-dashed px-3 py-2.5 ${expired ? "border-ink-300 bg-ink-50 opacity-60" : "border-primary-300 bg-primary-50"}`}>
                          <div>
                            <p className={`text-sm font-bold ${expired ? "text-ink-400" : "text-primary-700"}`}>{c.code}</p>
                            <p className="text-xs text-ink-500">
                              {c.discount_type === "percent" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                              {" · "}Min order {formatINR(c.min_order_amount)}
                            </p>
                            {expired && <p className="text-[11px] text-danger font-medium">Expired</p>}
                          </div>
                          {!expired && (
                            <button onClick={() => applyCoupon(c.code)} className="text-xs font-semibold text-primary-600 hover:underline">
                              Apply
                            </button>
                          )}
                        </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card">
                <h3 className="mb-4 font-semibold">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <Row label={`Subtotal (${items.length} Items)`} value={formatINR(subtotal)} />
                  {/* {productDiscount > 0 && <Row label="Product Discount" value={`- ${formatINR(productDiscount)}`} valueClass="text-success" />} */}
                  {couponDiscount > 0 && <Row label={`Coupon (${appliedCoupon.code})`} value={`- ${formatINR(couponDiscount)}`} valueClass="text-success" />}
                  {/* <Row label="Delivery Charges" value={deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge)} valueClass={deliveryCharge === 0 ? "text-success" : ""} /> */}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink-500/10 pt-3">
                  <span className="font-semibold">Grand Total</span>
                  {/* <span className="text-lg font-bold text-primary-600">{formatINR(subtotal)}</span> */}
                  <span className="text-lg font-bold text-primary-600">{formatINR(grandTotal)}</span>
                </div>
                <Button fullWidth className="mt-4" onClick={() => {
                  if (!isAuthenticated) {
                    window.dispatchEvent(new CustomEvent("poojify:require-login"));
                    return;
                  }
                  navigate("/checkout", { state: { appliedCoupon } });
                }}>
                  <Lock size={15} /> Proceed to Checkout
                </Button>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                  <ShieldCheck size={13} /> Secure Checkout
                </p>
              </div>

              {/* <div className="card">
                <h3 className="mb-3 font-semibold">Why Shop With Poojify?</h3>
                <div className="space-y-3">
                  {perks.map((p) => (
                    <div key={p.title} className="flex items-start gap-2.5">
                      <p.icon size={16} className="mt-0.5 text-primary-500" />
                      <div>
                        <p className="text-sm font-medium">{p.title}</p>
                        <p className="text-xs text-ink-500">{p.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function Row({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
