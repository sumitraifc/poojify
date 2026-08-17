import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Camera, Award, Languages, Sparkles, CalendarDays, Image } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { getPanditById } from "../api/panditApi";
import { formatINR } from "../utils/format";
import { showToast } from "../components/common/Toast";

export default function PurohitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState([]);

  const { data: purohit, isLoading } = useQuery({
    queryKey: ["pandit", id],
    queryFn: () => getPanditById(id),
    select: (res) => res?.data ?? res,
  });

  const total = useMemo(() => {
    if (!purohit) return 0;
    return (purohit.specializations ?? [])
      .filter((o) => selected.includes(o.id))
      .reduce((sum, o) => sum + Number(o.price), 0);
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
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: purohit.full_name }]} />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {/* Profile */}
              <div className="card flex flex-col gap-4 sm:flex-row">
                <img src={purohit.profile_image} alt={purohit.full_name} className="h-28 w-28 rounded-full object-cover" />
                <div>
                  <h1 className="flex items-center gap-1.5 text-xl font-bold">
                    {purohit.full_name} <BadgeCheck className="text-primary-500" />
                  </h1>
                  <p className="flex items-center gap-1 text-sm text-ink-500">
                    <MapPin size={14} /> {purohit.area}, {purohit.city} — {purohit.religion}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-5 text-sm">
                    <Stat icon={Camera} value={`${purohit.experience_years}+`} label="Years Exp." />
                    <Stat icon={Award} value={purohit.specializations?.length} label="Specializations" />
                    <Stat icon={Languages} value={purohit.languages} label="" />
                    <Stat icon={MapPin} value={`${purohit.service_radius} km`} label="Service Radius" />
                  </div>
                  {purohit.about && <p className="mt-3 text-sm text-ink-500">{purohit.about}</p>}
                </div>
              </div>

              {/* Pooja Images */}
              {purohit.pooja_images?.length > 0 && (
                <div className="card">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold"><Image size={15} className="text-primary-500" /> Pooja Gallery</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {purohit.pooja_images.map((img, i) => (
                      <img key={i} src={img} alt={`pooja-${i}`} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              <div className="card">
                <h3 className="mb-3 font-semibold">Languages Known</h3>
                <div className="flex flex-wrap gap-2">
                  {purohit.languages.split(",").map((l) => (
                    <span key={l} className="badge">{l.trim()}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Panel */}
            <div className="card h-fit">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Sparkles size={16} className="text-primary-500" /> Book Pandit Ji
              </h3>

              <label className="label flex items-center gap-1.5"><CalendarDays size={14} /> Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input mb-4" />

              <p className="label">Select Pooja</p>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {(purohit.specializations ?? []).map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink-500/10 p-2.5 hover:bg-cream-100">
                    <input type="checkbox" className="accent-primary-500" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium">{opt.name}</span>
                      <span className="text-sm font-semibold text-primary-600">{formatINR(opt.price)}</span>
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
      {label && <span className="text-ink-500">{label}</span>}
    </span>
  );
}
