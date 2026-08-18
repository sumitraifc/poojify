import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from "@react-google-maps/api";
import { Camera, Image as ImageIcon, MapPin, LocateFixed, Search, ShieldCheck, Lock, Wallet, Headset } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";
import { getPanditMasterData, registerPandit } from "../api/panditApi";
import { useLocationStore } from "../store/locationStore";

const LIBRARIES = ["places"];
const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const trustBadges = [
  { icon: ShieldCheck, title: "Verified & Trusted", subtitle: "100% verified purohits" },
  { icon: Lock, title: "Secure & Safe", subtitle: "Your information is protected" },
  { icon: Wallet, title: "Timely Payments", subtitle: "Hassle-free earnings & withdrawals" },
  { icon: Headset, title: "24x7 Support", subtitle: "We're always here to help you" },
];

const ID_TYPES = ["aadhaar", "pan", "voter_id", "driving_licence"];

export default function PurohitRegister() {
  const navigate = useNavigate();
  const { latitude: storeLat, longitude: storeLng, setCoords } = useLocationStore();
  const profileRef = useRef(null);
  const poojaImagesRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [mapCenter, setMapCenter] = useState({ lat: storeLat ?? 26.8467, lng: storeLng ?? 80.9462 });
  const [markerPos, setMarkerPos] = useState(storeLat ? { lat: storeLat, lng: storeLng } : null);
  const [lat, setLat] = useState(storeLat ?? "");
  const [lng, setLng] = useState(storeLng ?? "");

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAP_KEY, libraries: LIBRARIES });

  const [form, setForm] = useState({
    full_name: "", email: "", mobile: "", about: "",
    id_type: "aadhaar", id_number: "",
    house_no: "", city: "", area: "", pincode: "",
    religion_id: "", experience_years: "",
    language_ids: [], pooja_ids: [],
  });
  const [files, setFiles] = useState({
    profile_image: null, document_proof: null, document_proof_back: null,
    work_proof: null, certificate: null, pooja_images: [],
  });
  const [previews, setPreviews] = useState({ profile_image: null });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: masterData } = useQuery({
    queryKey: ["pandit-master"],
    queryFn: getPanditMasterData,
    select: (res) => res?.data?.data ?? res?.data ?? res,
  });

  const religions = masterData?.religious ?? [];
  const poojaList = masterData?.pooja_list ?? [];
  const languages = masterData?.languages ?? [];

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function reverseGeocode(lt, ln) {
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lt},${ln}&key=${MAP_KEY}`);
      const data = await res.json();
      if (data.results?.[0]) {
        const c = data.results[0].address_components;
        const get = (type) => c.find((x) => x.types.includes(type))?.long_name || "";
        const city = get("locality") || get("administrative_area_level_2");
        const pincode = get("postal_code");
        const sublocality = get("sublocality_level_1") || get("sublocality");
        const route = get("route");
        const streetNo = get("street_number");
        const house_no = [streetNo, route].filter(Boolean).join(", ");
        const area = sublocality;
        setForm((f) => ({ ...f, city, pincode, area, house_no }));
      }
    } catch {}
  }

  function onMapClick(e) {
    const lt = e.latLng.lat();
    const ln = e.latLng.lng();
    setMarkerPos({ lat: lt, lng: ln });
    setMapCenter({ lat: lt, lng: ln });
    setLat(lt); setLng(ln);
    setCoords(lt, ln);
    reverseGeocode(lt, ln);
  }

  function locateMe() {
    if (!navigator.geolocation) return showToast.error("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lt = pos.coords.latitude;
        const ln = pos.coords.longitude;
        setMarkerPos({ lat: lt, lng: ln });
        setMapCenter({ lat: lt, lng: ln });
        setLat(lt); setLng(ln);
        setCoords(lt, ln);
        reverseGeocode(lt, ln);
        showToast.success("Location detected");
      },
      () => showToast.error("Couldn't access location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function onPlacesChanged() {
    const places = searchBoxRef.current?.getPlaces();
    if (!places?.length) return;
    const place = places[0];
    const lt = place.geometry.location.lat();
    const ln = place.geometry.location.lng();
    setMapCenter({ lat: lt, lng: ln });
    setMarkerPos({ lat: lt, lng: ln });
    setLat(lt); setLng(ln);
    setCoords(lt, ln);
    reverseGeocode(lt, ln);
  }

  function toggleArr(key, id) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));
  }

  function onFileChange(key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((f) => ({ ...f, [key]: file }));
    if (key === "profile_image") setPreviews((p) => ({ ...p, profile_image: URL.createObjectURL(file) }));
  }

  function onPoojaImages(e) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((f) => ({ ...f, pooja_images: selected }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!files.profile_image) return showToast.error("Please upload a profile photo");
    if (!agreed) return showToast.error("Please accept the declaration to continue");
    if (!form.religion_id) return showToast.error("Please select religion");
    if (form.language_ids.length === 0) return showToast.error("Please select at least one language");
    if (form.pooja_ids.length === 0) return showToast.error("Please select at least one pooja");

    setSubmitting(true);
    try {
      const fd = new FormData();
      // text fields
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      fd.append("latitude", String(lat ?? ""));
      fd.append("longitude", String(lng ?? ""));
      fd.append("fcm_token", "web-fcm-token");
      // files
      if (files.profile_image) fd.append("profile_image", files.profile_image);
      if (files.document_proof) fd.append("document_proof", files.document_proof);
      if (files.document_proof_back) fd.append("document_proof_back", files.document_proof_back);
      if (files.work_proof) fd.append("work_proof", files.work_proof);
      if (files.certificate) fd.append("certificate", files.certificate);
      files.pooja_images.forEach((f) => fd.append("pooja_images", f));

      const res = await registerPandit(fd);
      showToast.success(res?.message || "Application submitted! We'll review and get back to you.");
      navigate("/purohit-booking");
    } catch (err) {
      showToast.error(err?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-6xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Purohit Ji Booking", to: "/purohit-booking" }, { label: "Registration" }]} />

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">Purohit (Pandit) Registration</h1>
            <p className="mt-1 text-ink-500">Join Poojify and start serving devotees. Fill in the details below to create your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Basic Info */}
              <FormCard step={1} title="Basic Information">
                <div className="mb-2 flex flex-col items-center gap-2">
                  <button type="button" onClick={() => profileRef.current?.click()}
                    className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-ink-500/20 bg-cream-100 overflow-hidden">
                    {previews.profile_image
                      ? <img src={previews.profile_image} className="h-full w-full object-cover" alt="profile" />
                      : <ImageIcon size={22} className="text-ink-500/40" />}
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white">
                      <Camera size={13} />
                    </span>
                  </button>
                  <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange("profile_image", e)} />
                  <p className="text-xs text-ink-500">Upload Photo</p>
                </div>
                <F label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="Enter full name" required />
                <div>
                  <label className="label">Mobile Number <span className="text-danger">*</span></label>
                  <div className="flex overflow-hidden rounded-lg border border-ink-500/15 focus-within:border-primary-500">
                    <span className="flex items-center bg-cream-100 px-3 text-sm">+91</span>
                    <input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      required type="tel" placeholder="Mobile number" className="w-full px-3 py-2.5 text-sm outline-none" />
                  </div>
                </div>
                <F label="Email ID" type="email" value={form.email} onChange={set("email")} placeholder="Enter email address" required />
                <div>
                  <label className="label">About</label>
                  <textarea value={form.about} onChange={set("about")} rows={3} className="input" placeholder="Tell us about yourself..." />
                </div>
              </FormCard>

              {/* Identity Verification */}
              <FormCard step={2} title="Identity Verification">
                <div>
                  <label className="label">Document Type <span className="text-danger">*</span></label>
                  <select value={form.id_type} onChange={set("id_type")} className="input" required>
                    {ID_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <F label="Document Number" value={form.id_number} onChange={set("id_number")} placeholder="Enter document number" required />
                <div className="grid grid-cols-2 gap-3">
                  <UploadBox label="Front Side" onChange={(e) => onFileChange("document_proof", e)} file={files.document_proof} />
                  <UploadBox label="Back Side" onChange={(e) => onFileChange("document_proof_back", e)} file={files.document_proof_back} />
                </div>
              </FormCard>

              {/* Address */}
              <FormCard step={3} title="Address & Location">
                {/* Search + Locate */}
                <div className="flex gap-2">
                  {isLoaded && (
                    <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
                      <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-lg border border-ink-500/15 px-3 focus-within:border-primary-500">
                        <Search size={14} className="shrink-0 text-ink-500" />
                        <input type="text" placeholder="Search area, city..." className="w-full bg-transparent py-2 text-sm outline-none" />
                      </div>
                    </StandaloneSearchBox>
                  )}
                  <button type="button" onClick={locateMe}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-100">
                    <LocateFixed size={14} /> Me
                  </button>
                </div>

                {/* Map */}
                {isLoaded ? (
                  <GoogleMap
                    mapContainerClassName="w-full h-48 rounded-xl overflow-hidden"
                    center={mapCenter} zoom={15} onClick={onMapClick}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                  >
                    {markerPos && <Marker position={markerPos} />}
                  </GoogleMap>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-cream-200 text-sm text-ink-500">Loading map...</div>
                )}

                <F label="House No / Street" value={form.house_no} onChange={set("house_no")} placeholder="House no, street" required />
                <F label="Area" value={form.area} onChange={set("area")} placeholder="Area / locality" required />
                <div className="grid grid-cols-2 gap-3">
                  <F label="City" value={form.city} onChange={set("city")} placeholder="City" required />
                  <F label="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="Pincode" required />
                </div>
              </FormCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Religious & Professional */}
              <FormCard step={4} title="Religious & Professional Details">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Religion <span className="text-danger">*</span></label>
                    <select value={form.religion_id} onChange={set("religion_id")} className="input" required>
                      <option value="">Select religion</option>
                      {religions.map((r) => <option key={r.id} value={r.id}>{r.religious_name}</option>)}
                    </select>
                  </div>
                  <F label="Experience (Years)" type="number" value={form.experience_years} onChange={set("experience_years")} placeholder="e.g. 5" required />
                </div>

                <div>
                  <label className="label">Languages Known <span className="text-danger">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <button key={l.id} type="button" onClick={() => toggleArr("language_ids", l.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${form.language_ids.includes(l.id) ? "border-primary-500 bg-primary-50 text-primary-600" : "border-ink-500/15 text-ink-500 hover:border-primary-300"}`}>
                        {l.language_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Pooja Specializations <span className="text-danger">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {poojaList.map((p) => (
                      <button key={p.id} type="button" onClick={() => toggleArr("pooja_ids", p.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${form.pooja_ids.includes(p.id) ? "border-primary-500 bg-primary-50 text-primary-600" : "border-ink-500/15 text-ink-500 hover:border-primary-300"}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </FormCard>

              {/* Documents */}
              <FormCard step={5} title="Documents & Work Proof">
                <div className="grid grid-cols-2 gap-3">
                  <UploadBox label="Work Proof" onChange={(e) => onFileChange("work_proof", e)} file={files.work_proof} />
                  <UploadBox label="Certificate" onChange={(e) => onFileChange("certificate", e)} file={files.certificate} />
                </div>
                <div>
                  <label className="label">Pooja Images <span className="text-xs text-ink-500">(multiple)</span></label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-500/20 bg-cream-100 p-4 text-center hover:border-primary-400">
                    <input ref={poojaImagesRef} type="file" accept="image/*" multiple className="hidden" onChange={onPoojaImages} />
                    <ImageIcon size={20} className="text-ink-500/40" />
                    <span className="text-xs font-medium">Upload Pooja Images</span>
                    {files.pooja_images.length > 0
                      ? <span className="text-xs text-primary-600">{files.pooja_images.length} file(s) selected</span>
                      : <span className="text-[10px] text-ink-500">JPG, PNG (Multiple allowed)</span>}
                  </label>
                </div>
              </FormCard>
            </div>

            {/* Declaration */}
            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">6</span>
                <h3 className="font-semibold">Declaration</h3>
              </div>
              <label className="mb-5 flex items-start gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary-500" />
                I hereby declare that the above information is true to the best of my knowledge. I agree to the Terms & Conditions and Privacy Policy of Poojify.
              </label>
              <Button type="submit" fullWidth size="lg" loading={submitting}>Submit Application →</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-primary-50 p-6 sm:grid-cols-4">
              {trustBadges.map((b) => (
                <div key={b.title} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary-500"><b.icon size={16} /></span>
                  <div>
                    <p className="text-xs font-semibold">{b.title}</p>
                    <p className="text-[11px] text-ink-500">{b.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

function FormCard({ step, title, children }) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">{step}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function F({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="input" />
    </div>
  );
}

function UploadBox({ label, onChange, file }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-500/20 bg-cream-100 p-4 text-center hover:border-primary-400">
      <input type="file" className="hidden" accept="image/*,.pdf" onChange={onChange} />
      <ImageIcon size={20} className="text-ink-500/40" />
      <span className="text-xs font-medium">{label}</span>
      {file
        ? <span className="text-[10px] text-primary-600 truncate max-w-full">{file.name}</span>
        : <span className="text-[10px] text-ink-500">JPG, PNG, PDF</span>}
    </label>
  );
}
