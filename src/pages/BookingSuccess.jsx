import { useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Phone, MessageCircle, CalendarDays, PhoneCall, Flame, Bell, ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { formatINR, formatDate } from "../utils/format";
import { showToast } from "../components/common/Toast";
import { getBookingStatus, verifyBooking, cancelBooking } from "../api/panditApi";

const STATUS_MAP = {
  0: { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
  1: { label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  2: { label: "Completed", cls: "bg-green-100 text-green-700" },
  3: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

const steps = [
  { icon: CalendarDays, title: "Mark your calendar", subtitle: "We've saved the date for your puja." },
  { icon: PhoneCall, title: "Pandit Ji will contact you", subtitle: "You will receive a call 1 hour before the puja." },
  { icon: Flame, title: "Puja will be performed", subtitle: "Pandit Ji will arrive and perform the puja." },
];

export default function BookingSuccess() {
  const { state } = useLocation();
  const { id } = useParams();
  const [pin, setPin] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // bookingId from fresh booking flow OR from URL param
  const bookingId = state?.bookingId ?? id;

  
  const { data: bookingData, isLoading, refetch } = useQuery({
    queryKey: ["booking-status", bookingId],
    queryFn: () => getBookingStatus(bookingId),
    select: (res) => res?.data,
    enabled: !!bookingId,
  });

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: () => cancelBooking(bookingId, cancelReason),
    onSuccess: (res) => {
      showToast.success(res?.message || "Booking cancelled");
      setShowCancel(false);
      setCancelReason("");
      refetch();
    },
    onError: (err) => showToast.error(err?.message || "Failed to cancel booking"),
  });

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: () => verifyBooking(bookingId, pin),
    onSuccess: (res) => {
      showToast.success(res?.message || "Booking verified!");
      setShowVerify(false);
      setPin("");
      refetch();
    },
    onError: (err) => showToast.error(err?.message || "Invalid PIN. Please try again."),
  });

  if (isLoading) return <PageLoader />;
  if (!bookingId) return <p className="section-y section text-center">No booking found.</p>;

  const booking = bookingData ?? {};
  const grandTotal = state?.grandTotal ?? booking.total_amount;
  const date = state?.date ?? booking.booking_date;
  const selectedOptions = state?.selectedOptions ?? [];
  const purohit = state?.purohit ?? null;
  const statusInfo = STATUS_MAP[booking.status] ?? { label: "Unknown", cls: "bg-gray-100 text-gray-600" };
  const canCancel = booking.status === 0 && booking.payment_type === "cod";

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "Confirmed" }]} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
          >
            <div className="flex items-start gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success"
              >
                <CheckCircle2 size={26} />
              </motion.span>
              <div>
                <h1 className="text-xl font-bold">Booking Confirmed!</h1>
                <p className="text-sm text-ink-500">Your puja has been successfully booked.</p>
                <p className="text-sm font-semibold text-success">Booking ID: #{bookingId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}>{statusInfo.label}</span>
              <button onClick={() => setShowVerify(true)} className="btn-outline btn-sm gap-1.5">
                <KeyRound size={13} /> Verify Booking
              </button>
              {canCancel && (
                <button onClick={() => setShowCancel(true)} className="btn-sm rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                  Cancel
                </button>
              )}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {/* Purohit info from state (fresh flow) */}
              {purohit && (
                <div className="card flex items-center gap-4">
                  <img src={purohit.profile_image} alt={purohit.full_name} className="h-20 w-20 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold">{purohit.full_name}</h3>
                    <p className="text-sm text-ink-500">{purohit.area}, {purohit.city}</p>
                  </div>
                </div>
              )}

              {selectedOptions.length > 0 && (
                <div className="card">
                  <h3 className="mb-2 font-semibold">Selected Pujas</h3>
                  {selectedOptions.map((o) => (
                    <div key={o.id} className="flex justify-between text-sm">
                      <span>✦ {o.name}</span>
                      <span className="font-medium">{formatINR(o.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="card flex items-center gap-3 bg-primary-50">
                <Bell size={18} className="text-primary-500" />
                <div>
                  <p className="text-sm font-semibold">We will notify you before Pandit Ji arrives</p>
                  <p className="text-xs text-ink-500">You will receive a call 1 hour before the puja.</p>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-4 font-semibold">What's Next?</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {steps.map((s) => (
                    <div key={s.title} className="flex flex-col items-start gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-500"><s.icon size={16} /></span>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-ink-500">{s.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card">
                <h3 className="mb-2 font-semibold">Need Help?</h3>
                <p className="mb-3 text-sm text-ink-500">Our support team is here for you</p>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium"><Phone size={14} className="text-primary-500" /> +91 78965 43210</p>
                <button className="btn-outline btn-sm w-full text-[#25D366] border-[#25D366]"><MessageCircle size={14} /> Chat on WhatsApp</button>
              </div>

              <div className="card">
                <h3 className="mb-2 font-semibold">Booking Details</h3>
                <Row label="Booking Date" value={formatDate(date)} />
                <Row label="Booking ID" value={`#${bookingId}`} />
                <Row label="Payment Type" value={<span className="capitalize">{booking.payment_type ?? "—"}</span>} />
                <Row label="Payment Status" value={<span className="capitalize">{booking.payment_status ?? "—"}</span>} />
              </div>

              <div className="card">
                <h3 className="mb-2 font-semibold">Payment Summary</h3>
                <Row label="Grand Total" value={formatINR(grandTotal)} bold />
              </div>

              <Link to="/my-bookings" className="btn-primary w-full justify-center">View My Bookings</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-sm">
            <h2 className="mb-1 font-bold">Cancel Booking</h2>
            <p className="mb-4 text-xs text-ink-500">Please provide a reason for cancellation</p>
            <textarea
              className="input mb-4 h-24 resize-none"
              placeholder="Enter reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setShowCancel(false); setCancelReason(""); }}>Go Back</Button>
              <Button fullWidth loading={cancelling} disabled={!cancelReason.trim()}
                className="!bg-red-500 hover:!bg-red-600"
                onClick={() => cancel()}>
                Confirm Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verify Booking PIN Modal */}
      {showVerify && (
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
              maxLength={6}
            />

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setShowVerify(false); setPin(""); }}>Cancel</Button>
              <Button fullWidth loading={verifying} disabled={pin.length < 4} onClick={() => verify()}>
                {verifying ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className={bold ? "font-bold text-primary-600" : "font-medium"}>{value}</span>
    </div>
  );
}
