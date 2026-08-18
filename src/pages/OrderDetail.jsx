import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, CheckCircle2, Circle, Star, XCircle } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { getOrderStatus, cancelOrder } from "../api/orderApi";
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
    queryKey: ["order-status", id],
    queryFn: () => getOrderStatus(id),
    select: (res) => res?.data?.data ?? res?.data ?? res,
  });

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="section-y section text-center">Order not found.</p>;

  const currentStepIndex = timelineSteps.findIndex(
    (s) => s.toLowerCase() === (order.status ?? "").toLowerCase()
  );

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Orders", to: "/orders" }, { label: "Order Details" }]} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-sm text-ink-500">Order ID: #{order.id ?? id} · Placed on {order.created_at ?? order.date}</p>
            </div>
            <button className="btn-outline btn-sm"><Download size={14} /> Download Invoice</button>
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
              <h3 className="mb-2 font-semibold">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Item Total</span><span>{formatINR(order.item_total ?? order.amount)}</span></div>
                <div className="flex justify-between"><span className="text-ink-500">Delivery Charges</span><span>{formatINR(order.delivery_charges ?? 0)}</span></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-success"><span>Discount</span><span>- {formatINR(order.discount)}</span></div>
                )}
              </div>
              <div className="mt-2 flex justify-between border-t border-ink-500/10 pt-2 font-semibold">
                <span>Total Amount</span>
                <span className="text-primary-600">{formatINR(order.total_amount ?? order.amount)}</span>
              </div>
              {order.payment_method && (
                <p className="mt-2 text-xs text-ink-500">Payment: {order.payment_method}</p>
              )}
            </div>

            {/* Items */}
            <div className="card lg:col-span-2">
              <h3 className="mb-3 font-semibold">Ordered Items ({(order.items ?? []).length})</h3>
              <div className="space-y-3">
                {(order.items ?? []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium">{item.name ?? item.product_name}</p>
                      <p className="text-sm text-ink-500">Qty: {item.qty ?? item.quantity}</p>
                      <p className="font-semibold text-primary-600">{formatINR(item.price ?? item.amount)}</p>
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
          {order.status?.toLowerCase() !== "cancelled" && order.status?.toLowerCase() !== "delivered" && (
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
                        cancelMutation.mutate({ order_id: order.id ?? id, reason: cancelReason });
                      }}
                    >Confirm Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rate & Review */}}
          {order.status?.toLowerCase() === "delivered" && (
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
