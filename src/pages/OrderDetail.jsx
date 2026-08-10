import { useState } from "react";
import { useParams } from "react-router-dom";
import { Download, CheckCircle2, Circle, Star } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { orders, statusStyle } from "../data/orders";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";
import Button from "../components/common/Button";

const timelineSteps = ["Order Placed", "Confirmed", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const order = orders.find((o) => o.id === id);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  if (!order) return <p className="section-y section text-center">Order not found.</p>;

  const currentStepIndex = timelineSteps.indexOf(order.status === "Confirmed" ? "Confirmed" : order.status);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Orders", to: "/orders" }, { label: "Order Details" }]} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-sm text-ink-500">Order ID: #{order.id} · Placed on {order.date}</p>
            </div>
            <button className="btn-outline btn-sm"><Download size={14} /> Download Invoice</button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              {timelineSteps.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <div key={step} className="flex items-center gap-2">
                    {done ? <CheckCircle2 size={18} className="text-success" /> : <Circle size={18} className="text-ink-500/30" />}
                    <span className={done ? "text-sm font-medium" : "text-sm text-ink-500"}>{step}</span>
                    {i < timelineSteps.length - 1 && <span className="mx-2 h-px w-8 bg-ink-500/15 sm:w-16" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card">
              <h3 className="mb-2 font-semibold">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Item Total</span><span>{formatINR(order.amount)}</span></div>
                <div className="flex justify-between"><span className="text-ink-500">Delivery Charges</span><span>₹0</span></div>
              </div>
              <div className="mt-2 flex justify-between border-t border-ink-500/10 pt-2 font-semibold">
                <span>Total Amount</span><span className="text-primary-600">{formatINR(order.amount)}</span>
              </div>
            </div>

            <div className="card lg:col-span-2">
              <h3 className="mb-3 font-semibold">Ordered Items ({order.items.length})</h3>
              {order.items.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-ink-500">Qty: {item.qty}</p>
                    <p className="font-semibold text-primary-600">{formatINR(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.status === "Delivered" && (
            <div className="card mt-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Star size={16} className="text-primary-500" /> Rate & Review</h3>
              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}>
                    <Star size={22} className={n <= rating ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                  </button>
                ))}
              </div>
              <textarea value={review} onChange={(e) => setReview(e.target.value)} className="input" rows={3} placeholder="Share your experience (optional)" />
              <Button className="mt-3" onClick={() => showToast.success("Thank you! Your feedback helps us improve.")}>Submit Review</Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
