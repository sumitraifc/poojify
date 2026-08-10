import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, ArrowLeft, Lock, ShieldCheck, Package, RefreshCw, Truck } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import QuantityStepper from "../components/common/QuantityStepper";
import { useCartStore } from "../store/cartStore";
import { formatINR } from "../utils/format";
import { ShoppingCart } from "lucide-react";

const perks = [
  { icon: ShieldCheck, title: "100% Authentic Products", subtitle: "Sourced from trusted vendors" },
  { icon: Lock, title: "Secure & Safe Payments", subtitle: "Multiple payment options" },
  { icon: RefreshCw, title: "Easy Returns", subtitle: "Hassle-free return policy" },
  { icon: Truck, title: "On-Time Delivery", subtitle: "Fast & reliable delivery" },
];

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, clearCart, subtotal, mrpTotal, discount } = useCartStore();

  const DELIVERY_FREE_THRESHOLD = 499;
  const deliveryCharge = subtotal() >= DELIVERY_FREE_THRESHOLD || items.length === 0 ? 0 : 49;
  const grandTotal = subtotal() + deliveryCharge;

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
            <div className="card overflow-hidden !p-0">
              <table className="w-full text-sm">
                <thead className="hidden bg-cream-100 text-left text-xs text-ink-500 sm:table-header-group">
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
                            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                            <div>
                              <Link to={`/shop/product/${item.id}`} className="font-medium hover:text-primary-600">{item.name}</Link>
                              <p className="text-xs text-ink-500">Delivery in 2-3 days</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-primary-600">{formatINR(item.price)}</span>
                          {item.mrp > item.price && <span className="ml-1 text-xs text-ink-500 line-through">{formatINR(item.mrp)}</span>}
                        </td>
                        <td className="p-4">
                          <QuantityStepper value={item.qty} onChange={(v) => updateQty(item.id, v)} />
                          <button onClick={() => removeItem(item.id)} className="mt-1.5 flex items-center gap-1 text-xs text-danger">
                            <Trash2 size={12} /> Remove
                          </button>
                        </td>
                        <td className="p-4 font-semibold">{formatINR(item.price * item.qty)}</td>
                        <td className="p-4">
                          <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="text-ink-500 hover:text-danger">
                            <X size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link to="/shop" className="flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-primary-600">
                  <ArrowLeft size={15} /> Continue Shopping
                </Link>
                <button onClick={clearCart} className="btn-outline btn-sm border-danger text-danger hover:bg-danger/5">
                  <Trash2 size={14} /> Clear Cart
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card">
                <h3 className="mb-4 font-semibold">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <Row label={`Subtotal (${items.length} Items)`} value={formatINR(subtotal())} />
                  {discount() > 0 && <Row label="Discount" value={`- ${formatINR(discount())}`} valueClass="text-success" />}
                  <Row label="Delivery Charges" value={deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge)} valueClass={deliveryCharge === 0 ? "text-success" : ""} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink-500/10 pt-3">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-lg font-bold text-primary-600">{formatINR(grandTotal)}</span>
                </div>
                <Button fullWidth className="mt-4" onClick={() => navigate("/checkout")}>
                  <Lock size={15} /> Proceed to Checkout
                </Button>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                  <ShieldCheck size={13} /> Secure Checkout
                </p>
              </div>

              <div className="card">
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
              </div>
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
