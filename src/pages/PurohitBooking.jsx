import { useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Languages, Sparkles, BadgeCheck, Camera, Award, ClipboardList, ChevronDown, Search, RotateCcw } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import { ProductCardSkeleton } from "../components/common/Loader";
import { getPandits } from "../api/panditApi";
import { formatINR } from "../utils/format";

const LIMIT = 10;

export default function PurohitBooking() {
  const [filters, setFilters] = useState({ date: "", location: "", language: "", pujaType: "" });
  const [applied, setApplied] = useState({ date: "", location: "", language: "", pujaType: "" });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["pandits"],
    queryFn: ({ pageParam = 0 }) => getPandits({ limit: LIMIT, offset: pageParam }),
    getNextPageParam: (lastPage) => {
      const fetched = (lastPage.offset ?? 0) + (lastPage.data?.length ?? 0);
      return fetched < (lastPage.total ?? 0) ? fetched : undefined;
    },
    select: (res) => res,
  });

  const allPandits = data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const filtered = allPandits.filter((p) => {
    if (applied.location && !`${p.city} ${p.area}`.toLowerCase().includes(applied.location.toLowerCase())) return false;
    if (applied.language && !p.languages.toLowerCase().includes(applied.language.toLowerCase())) return false;
    if (applied.pujaType && !p.specializations?.some((s) => s.name.toLowerCase().includes(applied.pujaType.toLowerCase()))) return false;
    return true;
  });

  const allPujas = [...new Set(allPandits.flatMap((p) => p.specializations?.map((s) => s.name) ?? []))];

  function handleSearch() { setApplied({ ...filters }); }
  function handleReset() {
    setFilters({ date: "", location: "", language: "", pujaType: "" });
    setApplied({ date: "", location: "", language: "", pujaType: "" });
  }

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

          {/* Filters */}
          <div className="card mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label flex items-center gap-1"><CalendarDays size={13} /> Select Date</label>
              <div className="relative">
                <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input type="date" className="input pl-9" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1"><MapPin size={13} /> Enter Location</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input className="input pl-9" placeholder="City or area" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Languages size={13} /> Select Language</label>
              <div className="relative">
                <Languages size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <select className="input pl-9" value={filters.language} onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}>
                  <option value="">Select Language</option>
                  {["Hindi", "English", "Tamil", "Telugu", "Sanskrit"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Sparkles size={13} /> Select Puja</label>
              <div className="relative">
                <Sparkles size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <select className="input pl-9" value={filters.pujaType} onChange={(e) => setFilters((f) => ({ ...f, pujaType: e.target.value }))}>
                  <option value="">Select Puja</option>
                  {allPujas.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button className="btn-primary w-full" onClick={handleSearch}><Search size={16} /> Search</button>
              <button className="btn-outline px-3" onClick={handleReset} aria-label="Reset filters"><RotateCcw size={16} /></button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((p, i) => <PurohitCard key={p.id} purohit={p} index={i} />)}

            {!isLoading && filtered.length === 0 && (
              <p className="py-12 text-center text-ink-500">No purohits found. Try different filters.</p>
            )}
          </div>

          {/* Load more */}
          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-outline"
              >
                <ChevronDown size={16} />
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function PurohitCard({ purohit }) {
  const startingPrice = purohit.specializations?.[0]?.price ?? null;
  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center">
      <img src={purohit.profile_image} alt={purohit.full_name} className="h-24 w-24 shrink-0 rounded-full object-cover" />
      <div className="flex-1">
        <p className="flex items-center gap-1.5 font-semibold">
          {purohit.full_name} <BadgeCheck size={15} className="text-primary-500" />
        </p>
        <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin size={13} /> {purohit.area}, {purohit.city}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1"><Camera size={13} /> {purohit.experience_years}+ Years Exp.</span>
          <span className="flex items-center gap-1"><Award size={13} /> {purohit.specializations?.length} Specializations</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {purohit.languages.split(",").map((l) => (
            <span key={l} className="badge">{l.trim()}</span>
          ))}
        </div>
      </div>
      <div className="text-right">
        {startingPrice && (
          <>
            <p className="text-xs text-ink-500">Starting From</p>
            <p className="text-lg font-bold text-primary-600">{formatINR(startingPrice)}</p>
          </>
        )}
        <Link to={`/purohit-booking/${purohit.id}`} className="btn-outline btn-sm mt-2">View Details</Link>
      </div>
    </div>
  );
}
