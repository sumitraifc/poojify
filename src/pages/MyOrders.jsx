import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import { orders, statusStyle } from "../data/orders";
import { formatINR } from "../utils/format";
import { PackageSearch } from "lucide-react";

const tabs = ["All Orders", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];

export default function MyOrders() {
  const [tab, setTab] = useState("All Orders");

  const filtered = useMemo(() => {
    if (tab === "All Orders") return orders;
    return orders.filter((o) => o.status === tab);
  }, [tab]);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Orders" }]} />
          <h1 className="mb-1 text-2xl font-bold">My Orders</h1>
          <p className="mb-6 text-sm text-ink-500">Track and manage all your orders in one place</p>

          <div className="mb-6 flex gap-2 overflow-x-auto border-b border-ink-500/10 pb-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
                  tab === t ? "border-primary-500 text-primary-600" : "border-transparent text-ink-500 hover:text-primary-600"
                }`}
              >
                {t} {t === "All Orders" && `(${orders.length})`}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No orders found" subtitle="You don't have any orders in this category yet." />
          ) : (
            <div className="space-y-4">
              {filtered.map((order) => (
                <div key={order.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img src={order.items[0].image} alt={order.items[0].name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">#{order.id}</p>
                      <span className={statusStyle[order.status]}>{order.status}</span>
                    </div>
                    <p className="text-sm text-ink-500">{order.items[0].name} · Qty {order.items[0].qty}</p>
                    <p className="text-xs text-ink-500">Placed on {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatINR(order.amount)}</p>
                    <Link to={`/orders/${order.id}`} className="btn-outline btn-sm mt-1">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
