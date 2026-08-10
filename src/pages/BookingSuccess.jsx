import { useLocation, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share2, Phone, MessageCircle, CalendarDays, PhoneCall, Flame, Bell } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { formatINR, formatDate } from "../utils/format";
import { bookings } from "../data/bookings";
import { getPurohitById, purohits } from "../data/purohits";

export default function BookingSuccess() {
  const { state } = useLocation();
  const { id } = useParams();

  // Support two entry points: fresh booking flow (state passed via navigate)
  // and viewing a past booking from My Bookings (looked up by id).
  let bookingId, date, selectedOptions, grandTotal, purohit;

  if (state) {
    ({ bookingId, date, selectedOptions, grandTotal, purohit } = state);
  } else {
    const record = bookings.find((b) => b.id === id);
    if (record) {
      bookingId = record.id;
      date = record.date;
      selectedOptions = [{ id: record.id, name: record.puja, price: record.amount }];
      grandTotal = record.amount;
      purohit = getPurohitById("pur1") || purohits[0];
    }
  }

  if (!bookingId) return <p className="section-y section text-center">No booking found.</p>;

  const steps = [
    { icon: CalendarDays, title: "Mark your calendar", subtitle: "We've saved the date for your puja." },
    { icon: PhoneCall, title: "Pandit Ji will contact you", subtitle: "You will receive a call 1 hour before the puja." },
    { icon: Flame, title: "Puja will be performed", subtitle: "Pandit Ji will arrive and perform the puja." },
  ];

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
                <p className="text-sm font-semibold text-success">Booking ID: {bookingId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline btn-sm"><Download size={14} /> Download Invoice</button>
              <button className="btn-outline btn-sm"><Share2 size={14} /> Share Booking</button>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="card flex items-center gap-4">
                <img src={purohit.image} alt={purohit.name} className="h-20 w-20 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold">{purohit.name}</h3>
                  <p className="text-sm text-ink-500">{purohit.tradition}, {purohit.location}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card">
                  <h3 className="mb-2 font-semibold">Selected Pujas</h3>
                  {selectedOptions.map((o) => (
                    <div key={o.id} className="flex justify-between text-sm">
                      <span>✦ {o.name}</span>
                      <span className="font-medium">{formatINR(o.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 className="mb-2 font-semibold">Purohit Visit Address</h3>
                  <p className="text-sm text-ink-500">123, Shanti Nagar, Indiranagar, Lucknow, Uttar Pradesh - 226016</p>
                </div>
              </div>

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
                <Row label="Booking ID" value={bookingId} />
              </div>

              <div className="card">
                <h3 className="mb-2 font-semibold">Payment Summary</h3>
                <Row label="Grand Total" value={formatINR(grandTotal)} bold />
              </div>

              <Link to="/orders" className="btn-primary w-full justify-center">View My Bookings</Link>
            </div>
          </div>
        </div>
      </div>
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
