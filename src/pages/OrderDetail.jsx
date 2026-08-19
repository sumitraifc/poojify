import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, CheckCircle2, Circle, Star, XCircle } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { getOrderHistory, cancelOrder } from "../api/orderApi";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";

const timelineSteps = ["Order Placed", "Confirmed", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelBox, setShowCancelBox] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: ({ order_id, reason }) => cancelOrder(order_id, reason),
    onSuccess: (res) => {
      showToast.success(res?.message || "Order cancelled successfully");
      setShowCancelBox(false);
    },
    onError: (err) => showToast.error(err?.message || "Failed to cancel order"),
  });

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-history"],
    queryFn: () => getOrderHistory({ limit: 50, offset: 0 }),
    select: (res) => {
      const arr = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(arr) ? arr : [];
      return list.find((o) => String(o.order_id) === String(id)) ?? null;
    },
  });

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="section-y section text-center">Order not found.</p>;

  const items = Array.isArray(order.items) ? order.items : [];
  const status = (order.status ?? "").toLowerCase();
  const currentStepIndex = ["pending", "confirmed", "shipped", "delivered"].indexOf(status);
  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Orders", to: "/orders" }, { label: "Order Details" }]} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-sm text-ink-500">Order ID: #{order.order_id ?? id} · Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            {/* <button className="btn-outline btn-sm"><Download size={14} /> Download Invoice</button> */}
          </div>

          {/* Timeline */}
          <div className="card mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {timelineSteps.map((step, i) => {
                const done = currentStepIndex >= 0 ? i <= currentStepIndex : false;
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
            {/* Summary */}
            <div className="card">
              <h3 className="mb-3 font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Item Total</span><span>{formatINR(order.total_amount)}</span></div>
                {Number(order.gst_amount) > 0 && (
                  <div className="flex justify-between"><span className="text-ink-500">GST ({order.gst_percentage}%)</span><span>{formatINR(order.gst_amount)}</span></div>
                )}
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-success"><span>Discount</span><span>- {formatINR(order.discount_amount)}</span></div>
                )}
              </div>
              <div className="mt-3 flex justify-between border-t border-ink-500/10 pt-3 font-semibold">
                <div>
                  <span>Grand Total</span>
                  <p className="text-[10px] font-normal text-ink-500">(incl. all taxes)</p>
                </div>
                <span className="text-lg text-primary-600">{formatINR(order.payable_amount)}</span>
              </div>
              {order.payment_method && (
                <p className="mt-2 rounded-lg bg-cream-100 px-3 py-2 text-xs text-ink-500">
                  Payment: <span className="font-semibold text-ink-700">{order.payment_method}</span>
                </p>
              )}
              <div className="mt-2">
                <span className={`badge ${
                  status === "delivered" ? "badge-success" :
                  status === "cancelled" ? "badge-danger" : "bg-primary-50 text-primary-600"
                } capitalize`}>{status}</span>
              </div>
            </div>

            {/* Items */}
            <div className="card lg:col-span-2">
              <h3 className="mb-3 font-semibold">Ordered Items ({items.length})</h3>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-ink-500/10 p-3">
                    {item.main_image && <img src={item.main_image} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-ink-500 capitalize">Type: {item.type}</p>
                      <p className="text-xs text-ink-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-primary-600">{formatINR(item.discount_price)}</p>
                      {Number(item.price) > Number(item.discount_price) && (
                        <p className="text-xs text-ink-500 line-through">{formatINR(item.price)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="card mt-6">
              <h3 className="mb-2 font-semibold">Delivery Address</h3>
              <p className="text-sm text-ink-600">{order.address}</p>
            </div>
          )}

          {/* Cancel Order */}
          {status !== "cancelled" && status !== "delivered" && (
            <div className="card mt-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-danger"><XCircle size={16} /> Cancel Order</h3>
              {!showCancelBox ? (
                <Button variant="outline" onClick={() => setShowCancelBox(true)}>Request Cancellation</Button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Reason for cancellation (e.g. Changed my mind)"
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCancelBox(false)}>Back</Button>
                    <Button
                      loading={cancelMutation.isPending}
                      onClick={() => {
                        if (!cancelReason.trim()) return showToast.error("Please enter a reason");
                        cancelMutation.mutate({ order_id: order.order_id ?? id, reason: cancelReason });
                      }}
                    >Confirm Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rate & Review */}
          {status === "delivered" && (
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
