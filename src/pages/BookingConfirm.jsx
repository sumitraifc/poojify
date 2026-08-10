import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Pencil, Wallet, ShieldCheck } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { getPurohitById } from "../data/purohits";
import { formatINR, formatDate } from "../utils/format";
import { showToast } from "../components/common/Toast";

export default function BookingConfirm() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const purohit = getPurohitById(id);
  const date = state?.date || new Date().toISOString().slice(0, 10);
  const selected = state?.selected || [];
  const selectedOptions = purohit?.pujaOptions.filter((o) => selected.includes(o.id)) || [];
  const itemsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const sevaCharge = 199;
  const platformFee = Math.round(itemsTotal * 0.007 * 100) / 100 || 96.82;
  const grandTotal = itemsTotal + sevaCharge + platformFee;

  function handleConfirm() {
    if (!agreed) return showToast.error("Please accept Terms & Conditions");
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      navigate(`/purohit-booking/${id}/success`, {
        state: { bookingId: `PJ${Math.floor(100000000 + Math.random() * 899999999)}`, date, selectedOptions, grandTotal, purohit },
      });
    }, 900);
  }

  if (!purohit) return <p className="section-y section text-center">Purohit not found.</p>;

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "Booking", to: `/purohit-booking/${id}` }, { label: "Confirm Booking" }]} />

          <div className="card mb-6 flex items-center gap-4">
            <img src={purohit.image} alt={purohit.name} className="h-20 w-20 rounded-full object-cover" />
            <div>
              <h1 className="font-bold">{purohit.name}</h1>
              <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin size={13} /> {purohit.tradition}, {purohit.location}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <SectionCard title="Booking Details" icon={CalendarDays}>
                <p className="text-sm">Booking Date: <span className="font-medium">{formatDate(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span></p>
              </SectionCard>

              <SectionCard title="Selected Pooja">
                <div className="space-y-2">
                  {selectedOptions.map((o) => (
                    <div key={o.id} className="flex justify-between text-sm">
                      <span>✦ {o.name}</span>
                      <span className="font-medium">{formatINR(o.price)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Purohit Visit Address" icon={MapPin}>
                <p className="text-sm font-medium">Home</p>
                <p className="text-sm text-ink-500">123, Shanti Nagar, Indiranagar, Lucknow, Uttar Pradesh - 226016</p>
              </SectionCard>

              <SectionCard title="Payment Method" icon={Wallet}>
                <p className="text-sm">Cash on Delivery — Pay in cash when purohit ji arrives</p>
              </SectionCard>
            </div>

            <div className="card h-fit">
              <h3 className="mb-4 font-semibold">Bill Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-500">Items Total ({selectedOptions.length})</span><span>{formatINR(itemsTotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink-500">Purohit Seva Charge</span><span>{formatINR(sevaCharge)}</span></div>
                <div className="flex justify-between"><span className="text-ink-500">Platform Fee</span><span>{formatINR(platformFee)}</span></div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-500/10 pt-3">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary-600">{formatINR(grandTotal)}</span>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-success/10 p-3 text-xs">
                <ShieldCheck size={14} className="mt-0.5 text-success" />
                <div>
                  <p className="font-semibold text-success">100% Secure Booking</p>
                  <p className="text-ink-500">Your information and booking are safe with us.</p>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-2 text-xs text-ink-500">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary-500" />
                I agree to the <a className="link">Terms & Conditions</a> and <a className="link">Privacy Policy</a> of Poojify.
              </label>

              <Button fullWidth className="mt-4" loading={confirming} onClick={handleConfirm}>🪔 Confirm Booking</Button>
              <button onClick={() => navigate(-1)} className="mt-2 w-full text-center text-sm text-ink-500 hover:text-primary-600">← Go Back</button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          {Icon && <Icon size={16} className="text-primary-500" />} {title}
        </h3>
        <button className="flex items-center gap-1 text-xs text-primary-600"><Pencil size={12} /> Edit</button>
      </div>
      {children}
    </div>
  );
}
