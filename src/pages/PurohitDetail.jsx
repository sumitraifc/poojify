import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Camera, Award, MessageSquare, Sparkles, CalendarDays } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { getPurohitById } from "../data/purohits";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";

function fetchPurohit(id) {
  return new Promise((resolve) => setTimeout(() => resolve(getPurohitById(id)), 400));
}

export default function PurohitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState([]);

  const { data: purohit, isLoading } = useQuery({ queryKey: ["purohit", id], queryFn: () => fetchPurohit(id) });

  const total = useMemo(() => {
    if (!purohit) return 0;
    return purohit.pujaOptions.filter((o) => selected.includes(o.id)).reduce((sum, o) => sum + o.price, 0);
  }, [selected, purohit]);

  function toggleOption(optId) {
    setSelected((s) => (s.includes(optId) ? s.filter((i) => i !== optId) : [...s, optId]));
  }

  function handleBookNow() {
    if (!date) return showToast.error("Please select a date");
    if (selected.length === 0) return showToast.error("Please select at least one puja");
    navigate(`/purohit-booking/${id}/confirm`, { state: { date, selected } });
  }

  if (isLoading) return <PageLoader />;
  if (!purohit) return <p className="section-y section text-center">Purohit not found.</p>;

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "Booking" }]} />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="card flex flex-col gap-4 sm:flex-row">
                <img src={purohit.image} alt={purohit.name} className="h-28 w-28 rounded-full object-cover" />
                <div>
                  <h1 className="flex items-center gap-1.5 text-xl font-bold">{purohit.name} <BadgeCheck className="text-primary-500" /></h1>
                  <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin size={14} /> {purohit.tradition}, {purohit.location}</p>
                  <div className="mt-3 flex flex-wrap gap-5 text-sm">
                    <Stat icon={Camera} value={`${purohit.experience}+`} label="Years Exp." />
                    <Stat icon={Award} value={`${purohit.pujasCompleted}+`} label="Pujas Completed" />
                    <Stat icon={MessageSquare} value={purohit.languages.length} label="Languages" />
                    <Stat icon={Sparkles} value={purohit.services.length} label="Services" />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-3 font-semibold">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {purohit.services.map((s) => (
                    <span key={s} className="rounded-lg border border-ink-500/15 px-3 py-1.5 text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="mb-3 font-semibold">Language Known</h3>
                <div className="flex flex-wrap gap-2">
                  {purohit.languages.map((l) => <span key={l} className="badge">{l}</span>)}
                </div>
              </div>
            </div>

            {/* Booking panel */}
            <div className="card h-fit">
              <h3 className="mb-4 flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-primary-500" /> Book Pandit Ji</h3>

              <label className="label flex items-center gap-1.5"><CalendarDays size={14} /> Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input mb-4" />

              <p className="label">Select Pooja</p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {purohit.pujaOptions.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-ink-500/10 p-2.5 hover:bg-cream-100">
                    <input type="checkbox" className="mt-1 accent-primary-500" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{opt.name}</span>
                        <span className="text-sm font-semibold text-primary-600">{formatINR(opt.price)}</span>
                      </div>
                      <p className="text-xs text-ink-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ink-500/10 pt-3">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-primary-600">{formatINR(total)}</span>
              </div>

              <Button fullWidth className="mt-4" onClick={handleBookNow}>Book Now</Button>
              <p className="mt-2 text-center text-xs text-ink-500">🔒 100% Secure Booking</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon size={15} className="text-primary-500" />
      <span className="font-semibold">{value}</span>
      <span className="text-ink-500">{label}</span>
    </span>
  );
}
