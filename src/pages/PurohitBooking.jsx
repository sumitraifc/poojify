import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Languages, Sparkles, Search, RotateCcw, BadgeCheck, Camera, Award, MessageSquare, ClipboardList } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Rating from "../components/common/Rating";
import { ProductCardSkeleton } from "../components/common/Loader";
import { purohits } from "../data/purohits";
import { formatINR } from "../utils/format";

function fetchPurohits() {
  return new Promise((resolve) => setTimeout(() => resolve(purohits), 500));
}

export default function PurohitBooking() {
  const [filters, setFilters] = useState({ date: "", location: "", language: "", pujaType: "" });
  const { data, isLoading } = useQuery({ queryKey: ["purohits"], queryFn: fetchPurohits });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.language && !p.languages.includes(filters.language)) return false;
      return true;
    });
  }, [data, filters]);

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking" }]} />

          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="flex items-center justify-center gap-2 text-2xl font-bold sm:text-3xl">
              <Sparkles className="text-primary-500" /> Book Purohit Ji <Sparkles className="text-primary-500" />
            </h1>
            <p className="mt-1 text-ink-500">Select a Purohit Ji to book for your puja.</p>
            <Link to="/my-bookings" className="btn-outline btn-sm mt-3">
              <ClipboardList size={14} /> My Bookings
            </Link>
          </div>

          <div className="card mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field icon={CalendarDays} label="Select Date" type="date" onChange={(v) => setFilters((f) => ({ ...f, date: v }))} />
            <Field icon={MapPin} label="Enter Location" onChange={(v) => setFilters((f) => ({ ...f, location: v }))} />
            <SelectField icon={Languages} label="Select Language" options={["Hindi", "English", "Tamil", "Telugu", "Sanskrit"]} onChange={(v) => setFilters((f) => ({ ...f, language: v }))} />
            <SelectField icon={Sparkles} label="Select Puja" options={["Ganesh Puja", "Navratri Puja", "Vastu Puja", "Wedding Puja"]} onChange={(v) => setFilters((f) => ({ ...f, pujaType: v }))} />
            <div className="flex items-end gap-2">
              <button className="btn-primary w-full"><Search size={16} /> Search</button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((p, i) => <PurohitCard key={p.id} purohit={p} index={i} />)}

            {!isLoading && filtered.length === 0 && (
              <p className="py-12 text-center text-ink-500">No purohits match your filters. Try resetting.</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function Field({ icon: Icon, label, type = "text", onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input type={type} onChange={(e) => onChange(e.target.value)} className="input pl-9" placeholder={label} />
      </div>
    </div>
  );
}

function SelectField({ icon: Icon, label, options, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <select onChange={(e) => onChange(e.target.value)} className="input pl-9" defaultValue="">
          <option value="">{label}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function PurohitCard({ purohit, index }) {
  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center" style={{ animationDelay: `${index * 60}ms` }}>
      <img src={purohit.image} alt={purohit.name} className="h-24 w-24 shrink-0 rounded-full object-cover" />
      <div className="flex-1">
        <p className="flex items-center gap-1.5 font-semibold">{purohit.name} <BadgeCheck size={15} className="text-primary-500" /></p>
        <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin size={13} /> {purohit.location}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1"><Camera size={13} /> {purohit.experience}+ Years Exp.</span>
          <span className="flex items-center gap-1"><Award size={13} /> {purohit.pujasCompleted}+ Pujas Completed</span>
          <span className="flex items-center gap-1"><MessageSquare size={13} /> {purohit.languages.length} Languages</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {purohit.languages.map((l) => <span key={l} className="badge">{l}</span>)}
        </div>
      </div>
      <div className="text-right">
        <Rating value={purohit.rating} count={purohit.reviews} />
        <p className="mt-1 text-xs text-ink-500">Starting From</p>
        <p className="text-lg font-bold text-primary-600">{formatINR(purohit.startingPrice)}</p>
        <Link to={`/purohit-booking/${purohit.id}`} className="btn-outline btn-sm mt-2">View Details</Link>
      </div>
    </div>
  );
}
