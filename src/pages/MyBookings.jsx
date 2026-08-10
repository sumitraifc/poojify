import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, CalendarDays, MapPin, Eye } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import EmptyState from "../components/common/EmptyState";
import { bookings, bookingStatusStyle } from "../data/bookings";
import { formatINR } from "../utils/format";
import { CalendarX } from "lucide-react";

const PER_PAGE = 5;

export default function MyBookings() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(bookings.length / PER_PAGE) || 1;
  const visible = bookings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "My Bookings" }]} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-sm text-ink-500">List of all your purohit ji bookings.</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline btn-sm"><Filter size={14} /> Filter</button>
              <button className="btn-outline btn-sm"><CalendarDays size={14} /> Select Date</button>
            </div>
          </div>

          {bookings.length === 0 ? (
            <EmptyState icon={CalendarX} title="No bookings yet" subtitle="Book a Purohit Ji for your next puja." actionLabel="Book Now" />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-ink-500/10 lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 text-left text-xs text-ink-500">
                    <tr>
                      <th className="p-4">Purohit Ji Details</th>
                      <th className="p-4">Puja Details</th>
                      <th className="p-4">Booking Date & Time</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((b) => (
                      <tr key={b.id} className="border-t border-ink-500/10">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={b.image} alt={b.purohit} className="h-11 w-11 rounded-full object-cover" />
                            <div>
                              <p className="font-medium">{b.purohit}</p>
                              <p className="flex items-center gap-1 text-xs text-ink-500"><MapPin size={11} /> {b.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{b.puja}</p>
                          <p className="text-xs text-ink-500">{b.pujaFor}</p>
                        </td>
                        <td className="p-4">
                          <p>{b.date}</p>
                          <p className="text-xs text-ink-500">{b.time}</p>
                        </td>
                        <td className="p-4 font-semibold text-primary-600">{formatINR(b.amount)}</td>
                        <td className="p-4"><span className={bookingStatusStyle[b.status]}>{b.status}</span></td>
                        <td className="p-4">
                          <Link to={`/my-bookings/${b.id}`} className="btn-outline btn-sm"><Eye size={13} /> View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-4 lg:hidden">
                {visible.map((b) => (
                  <div key={b.id} className="card">
                    <div className="mb-3 flex items-center gap-3">
                      <img src={b.image} alt={b.purohit} className="h-12 w-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{b.purohit}</p>
                        <p className="text-xs text-ink-500">{b.location}</p>
                      </div>
                      <span className={bookingStatusStyle[b.status]}>{b.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{b.puja}</p>
                        <p className="text-xs text-ink-500">{b.date} · {b.time}</p>
                      </div>
                      <p className="font-semibold text-primary-600">{formatINR(b.amount)}</p>
                    </div>
                    <Link to={`/my-bookings/${b.id}`} className="btn-outline btn-sm mt-3 w-full">View Details</Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-ink-500">
                  Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, bookings.length)} of {bookings.length} bookings
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium ${page === i + 1 ? "bg-primary-500 text-white" : "border border-ink-500/15 hover:bg-cream-100"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
