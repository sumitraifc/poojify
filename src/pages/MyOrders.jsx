import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, PackageSearch } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import { PageLoader } from "../components/common/Loader";
import ReviewModal from "../components/common/ReviewModal";
import { getOrderHistory } from "../api/orderApi";
import { formatINR } from "../utils/format";

const tabs = ["All", "Pending", "Confirmed", "Delivered", "Cancelled"];

const statusStyle = {
  Pending:   "badge bg-yellow-100 text-yellow-700",
  Confirmed: "badge bg-blue-100 text-blue-700",
  Shipped:   "badge bg-purple-100 text-purple-700",
  Delivered: "badge bg-green-100 text-green-700",
  Cancelled: "badge bg-red-100 text-red-700",
  Returned:  "badge bg-ink-500/10 text-ink-500",
};

export default function MyOrders() {
  const [tab, setTab] = useState("All");
  const [reviewModal, setReviewModal] = useState(null); // { order_id, item }
  // track submitted reviews: key = `${order_id}_${item_id}`
  const [submitted, setSubmitted] = useState({});
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["order-history"],
    queryFn: () => getOrderHistory({ limit: 50, offset: 0 }),
    select: (res) => res?.data?.data ?? res?.data ?? [],
  });

  const filtered = useMemo(() => {
    if (tab === "All") return orders;
    return orders.filter((o) => o.status?.toLowerCase() === tab.toLowerCase());
  }, [tab, orders]);

  if (isLoading) return <PageLoader />;

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Orders" }]} />
          <h1 className="mb-1 text-2xl font-bold">My Orders</h1>
          <p className="mb-6 text-sm text-ink-500">Track and manage all your orders in one place</p>

          <div className="mb-6 flex gap-2 overflow-x-auto border-b border-ink-500/10 pb-1 scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
                  tab === t ? "border-primary-500 text-primary-600" : "border-transparent text-ink-500 hover:text-primary-600"
                }`}
              >
                {t} {t === "All" && `(${orders.length})`}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No orders found" subtitle="You don't have any orders in this category yet." />
          ) : (
            <div className="space-y-4">
              {filtered.map((order) => (
                <div key={order.order_id} className="card flex flex-col gap-4 sm:flex-row sm:items-start">
                  {/* Clickable item images */}
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <div className="flex gap-2 flex-wrap">
                      {order.items?.slice(0, 2).map((item) => (
                        <button
                          key={item.item_id}
                          onClick={() => navigate(item.type === "combo" ? `/combo-offers/${item.item_id}` : `/shop/product/${item.item_id}`)}
                          className="group relative overflow-hidden rounded-lg"
                          title={item.name}
                        >
                          <img
                            src={item.main_image}
                            alt={item.name}
                            className="h-16 w-16 object-cover transition group-hover:scale-105"
                          />
                        </button>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-cream-100 text-xs font-semibold text-ink-500">
                          +{order.items.length - 2}
                        </div>
                      )}
                    </div>

                    {/* Per-item review buttons (only for delivered orders) */}
                    {order.status?.toLowerCase() === "delivered" && (
                      <div className="flex flex-col gap-1">
                        {order.items?.map((item) => {
                          const key = `${order.order_id}_${item.item_id}`;
                          const done = submitted[key];
                          return (
                            <button
                              key={item.item_id}
                              disabled={done}
                              onClick={() => !done && setReviewModal({ order_id: order.order_id, item })}
                              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${
                                done
                                  ? "bg-green-50 text-green-600 cursor-default"
                                  : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                              }`}
                            >
                              <Star size={11} className={done ? "fill-green-500 text-green-500" : "text-primary-500"} />
                              {done ? "Reviewed" : `Review: ${item.name?.slice(0, 20)}${item.name?.length > 20 ? "…" : ""}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">#{order.order_id}</p>
                      <span className={statusStyle[order.status?.charAt(0).toUpperCase() + order.status?.slice(1)] ?? "badge"}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                      <span className="badge bg-ink-500/10 text-ink-500 capitalize">{order.payment_method}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-600">
                      {order.items?.map((i) => (
                        <button
                          key={i.item_id}
                          onClick={() => navigate(i.type === "combo" ? `/combo-offers/${i.item_id}` : `/shop/product/${i.item_id}`)}
                          className="hover:text-primary-600 hover:underline mr-1"
                        >
                          {i.name}
                        </button>
                      ))}
                    </p>
                    <p className="text-xs text-ink-500">
                      Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink-500 line-through">{formatINR(order.total_amount)}</p>
                    <p className="font-bold text-primary-600">{formatINR(order.payable_amount)}</p>
                    <Link to={`/orders/${order.order_id}`} className="btn-outline btn-sm mt-1 inline-block">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          order_id={reviewModal.order_id}
          item={reviewModal.item}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            const key = `${reviewModal.order_id}_${reviewModal.item.item_id}`;
            setSubmitted((prev) => ({ ...prev, [key]: true }));
            setReviewModal(null);
          }}
        />
      )}
    </PageTransition>
  );
}
