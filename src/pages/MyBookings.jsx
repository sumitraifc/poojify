import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, CalendarX, ShieldCheck, KeyRound, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { PageLoader } from "../components/common/Loader";
import { getBookingHistory, verifyBooking, cancelBooking } from "../api/panditApi";
import { formatINR, formatDate } from "../utils/format";
import { showToast } from "../components/common/Toast";

// const STATUS_MAP = {
//   0: { label: "Pending",   cls: "badge bg-yellow-100 text-yellow-700" },
//   1: { label: "Confirmed", cls: "badge bg-blue-100 text-blue-700" },
//   2: { label: "Completed", cls: "badge bg-green-100 text-green-700" },
//   3: { label: "Cancelled", cls: "badge bg-red-100 text-red-700" },
// };

const STATUS_MAP = {
  0: { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
  3: { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
  1: { label: "Completed", cls: "bg-green-100 text-green-700" },
  2: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  // 3: { label: "On Going",  cls: "bg-blue-100 text-blue-700" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: "Unknown", cls: "badge" };
  return <span className={s.cls}>{s.label}</span>;
}

export default function MyBookings() {
  const qc = useQueryClient();
  const [verifyBookingId, setVerifyBookingId] = useState(null);
  const [pin, setPin] = useState("");
  const [cancelId, setCancelId] = useState(null);
  const [reason, setReason] = useState("");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["pandit-booking-history"],
    queryFn: getBookingHistory,
    select: (res) => res?.data ?? [],
  });

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: () => verifyBooking(verifyBookingId, pin),
    onSuccess: (res) => {
      showToast.success(res?.message || "Booking verified!");
      qc.invalidateQueries({ queryKey: ["pandit-booking-history"] });
      setVerifyBookingId(null);
      setPin("");
    },
    onError: (err) => showToast.error(err?.message || "Invalid PIN. Please try again."),
  });

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: () => cancelBooking(cancelId, reason),
    onSuccess: (res) => {
      showToast.success(res?.message || "Booking cancelled!");
      qc.invalidateQueries({ queryKey: ["pandit-booking-history"] });
      setCancelId(null);
      setReason("");
    },
    onError: (err) => showToast.error(err?.message || "Could not cancel booking."),
  });

  function openVerify(id) {
    setPin("");
    setVerifyBookingId(id);
  }

  if (isLoading) return <PageLoader />;

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "My Bookings" }]} />

          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <p className="text-sm text-ink-500">List of all your purohit ji bookings.</p>
          </div>

          {bookings.length === 0 ? (
            <EmptyState icon={CalendarX} title="No bookings yet" subtitle="Book a Purohit Ji for your next puja." actionLabel="Book Now" />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-ink-500/10 lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 text-left text-xs text-ink-500">
                    <tr>
                      <th className="p-4">Pandit Ji</th>
                      <th className="p-4">Poojas</th>
                      <th className="p-4">Booking Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">PIN</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-t border-ink-500/10">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-50 text-lg font-bold text-yellow-600">
                              {b.pandit?.name?.charAt(0)?.toUpperCase() ?? "P"}
                            </span>
                            <div>
                              <p className="font-medium">{b.pandit?.name ?? "—"}</p>
                              <p className="text-xs text-ink-500">{b.pandit?.experience} yrs exp</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {b.poojas?.map((p) => (
                            <p key={p.id} className="text-xs">✦ {p.pooja_name}</p>
                          ))}
                        </td>
                        <td className="p-4">
                          <p className="flex items-center gap-1">
                            <CalendarDays size={13} className="text-primary-500" />
                            {formatDate(b.booking_date)}
                          </p>
                        </td>
                        <td className="p-4 font-semibold text-primary-600">{formatINR(b.total_amount)}</td>
                        <td className="p-4">
                          <span className="rounded-lg bg-primary-50 px-3 py-1 text-sm font-bold tracking-widest text-primary-600">{b.booking_pin ?? "—"}</span>
                        </td>
                        <td className="p-4 capitalize">
                          <p>{b.payment?.type ?? b.payment_type}</p>
                          <p className="text-xs text-ink-500 capitalize">{b.payment?.status ?? b.payment_status}</p>
                        </td>
                        <td className="p-4"><StatusBadge status={b.status} /></td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            {/* <Link to={`/my-bookings/${b.id}`} className="btn-outline btn-sm"><Eye size={13} /> View</Link> */}
                            {b.status !== 2 && b.status !== 3 && (
                              <button onClick={() => { setReason(""); setCancelId(b.id); }} className="btn-sm flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                                <XCircle size={12} /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-4 lg:hidden">
                {bookings.map((b) => (
                  <div key={b.id} className="card">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-50 text-lg font-bold text-yellow-600">
                        {b.pandit?.name?.charAt(0)?.toUpperCase() ?? "P"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{b.pandit?.name ?? "—"}</p>
                        <p className="flex items-center gap-1 text-xs text-ink-500">
                          <MapPin size={11} /> {b.address?.city}, {b.address?.state}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mb-2 space-y-0.5">
                      {b.poojas?.map((p) => (
                        <p key={p.id} className="text-xs text-ink-600">✦ {p.pooja_name}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="flex items-center gap-1 text-xs text-ink-500">
                        <CalendarDays size={12} /> {formatDate(b.booking_date)}
                      </p>
                      <p className="font-semibold text-primary-600">{formatINR(b.total_amount)}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-ink-500">Booking PIN:</span>
                      <span className="rounded-lg bg-primary-50 px-3 py-1 text-sm font-bold tracking-widest text-primary-600">{b.booking_pin ?? "—"}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {/* <Link to={`/my-bookings/${b.id}`} className="btn-outline btn-sm flex-1">View Details</Link> */}
                      {b.status !== 2 && b.status !== 3 && (
                        <button onClick={() => { setReason(""); setCancelId(b.id); }} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                          <XCircle size={12} /> Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500"><XCircle size={20} /></span>
              <div>
                <h2 className="font-bold">Cancel Booking</h2>
                <p className="text-xs text-ink-500">Please provide a reason for cancellation</p>
              </div>
            </div>
            <textarea
              className="input mb-4 h-24 resize-none"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setCancelId(null); setReason(""); }}>Back</Button>
              <Button fullWidth loading={cancelling} disabled={!reason.trim()} onClick={() => cancel()} className="!bg-red-500 hover:!bg-red-600">Confirm Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verify PIN Modal */}
      {verifyBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="font-bold">Verify Booking</h2>
                <p className="text-xs text-ink-500">Enter the PIN shared by Pandit Ji</p>
              </div>
            </div>
            <input
              type="number"
              className="input mb-4 text-center text-xl tracking-widest"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 6))}
            />
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setVerifyBookingId(null); setPin(""); }}>Cancel</Button>
              <Button fullWidth loading={verifying} disabled={pin.length < 4} onClick={() => verify()}>Verify</Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
