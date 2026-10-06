import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Camera, Image as ImageIcon, MapPin, LocateFixed, Search, ShieldCheck, Lock, Wallet, Headset, CheckCircle2 } from "lucide-react";
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

const ID_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card", placeholder: "XXXX XXXX XXXX", maxLen: 12, numeric: true },
  { value: "voter_id", label: "Voter ID", placeholder: "ABC1234567", maxLen: 10, numeric: false },
  { value: "pan", label: "PAN Card", placeholder: "ABCDE1234F", maxLen: 10, numeric: false },
  { value: "passport", label: "Passport", placeholder: "A1234567", maxLen: 8, numeric: false },
];

export default function PurohitRegister() {
  const navigate = useNavigate();
  const { latitude: storeLat, longitude: storeLng, setCoords } = useLocationStore();
  const profileRef = useRef(null);
  const poojaImagesRef = useRef(null);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [mapCenter, setMapCenter] = useState({ lat: storeLat ?? 26.8467, lng: storeLng ?? 80.9462 });
  const [markerPos, setMarkerPos] = useState(storeLat ? { lat: storeLat, lng: storeLng } : { lat: 26.8467, lng: 80.9462 });
  const [lat, setLat] = useState(storeLat ?? "");
  const [lng, setLng] = useState(storeLng ?? "");
  const [detectedAddress, setDetectedAddress] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);

  const [textQuery, setTextQuery] = useState("");
  const [textResults, setTextResults] = useState([]);
  const [loadingTextSearch, setLoadingTextSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAP_KEY, libraries: LIBRARIES });

  const [form, setForm] = useState({
    full_name: "", email: "", mobile: "", about: "",
    id_type: "aadhaar", id_number: "",
    house_no: "", city: "", area: "", pincode: "", state: "",
    religion_id: "", experience_years: "", service_radius: "",
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

  // auto-detect on mount
  useEffect(() => {
    if (storeLat) return; // already have location
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => pinLocation(pos.coords.latitude, pos.coords.longitude),
      () => pinLocation(26.8467, 80.9462),
      { enableHighAccuracy: true, timeout: 80000 }
    );
  }, []);

  // debounced text search
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!textQuery.trim() || textQuery.trim().length < 3) {
      setTextResults([]); setShowSuggestions(false); return;
    }
    debounceTimerRef.current = setTimeout(() => performTextSearch(textQuery), 500);
    return () => clearTimeout(debounceTimerRef.current);
  }, [textQuery]);

  // nearby on marker change
  useEffect(() => {
    if (markerPos && placesServiceRef.current) fetchNearbyPlaces(markerPos.lat, markerPos.lng);
  }, [markerPos]);

  function onMapLoad(map) {
    mapRef.current = map;
    if (window.google?.maps?.places)
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    // agar markerPos abhi bhi null hai to default center pe pin lagao
    setMarkerPos((prev) => prev ?? { lat: 26.8467, lng: 80.9462 });
  }

  async function reverseGeocode(lt, ln) {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lt},${ln}&key=${MAP_KEY}&language=en&region=IN`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const c = data.results[0].address_components;
        const get = (type) => c.find((x) => x.types.includes(type))?.long_name || "";
        const city     = get("locality") || get("administrative_area_level_2");
        const pincode  = get("postal_code");
        const state    = get("administrative_area_level_1");
        const house_no = [get("subpremise"), get("premise"), get("street_number"), get("route"), get("sublocality_level_2"), get("sublocality_level_1") || get("sublocality")].filter(Boolean).join(", ");
        const area     = get("sublocality_level_1") || get("sublocality") || get("sublocality_level_2");
        const detected = { house_no, area, city, state, pincode };
        setDetectedAddress(detected);
        setCoords(lt, ln);
        setForm((f) => ({ ...f, house_no, area, city: city || f.city, state: state || f.state, pincode: pincode || f.pincode }));
        return detected;
      }
    } catch {}
    finally { setGeocoding(false); }
  }

  function performTextSearch(query) {
    if (!placesServiceRef.current || !window.google) return;
    setLoadingTextSearch(true);
    placesServiceRef.current.textSearch({ query }, (results, status) => {
      setLoadingTextSearch(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setTextResults(results.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setTextResults([]); setShowSuggestions(false);
      }
    });
  }

  function fetchNearbyPlaces(lt, ln) {
    if (!placesServiceRef.current || !window.google) return;
    placesServiceRef.current.nearbySearch(
      { location: new window.google.maps.LatLng(lt, ln), radius: 500 },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results)
          setNearbyPlaces(results.slice(0, 5));
        else setNearbyPlaces([]);
      }
    );
  }

  function handlePickTextResult(place) {
    const lt = place.geometry.location.lat();
    const ln = place.geometry.location.lng();
    setTextQuery(place.formatted_address || place.name || "");
    setTextResults([]);
    setShowSuggestions(false);
    pinLocation(lt, ln);
    // fill from address_components if available
    const c = place.address_components ?? [];
    const get = (type) => c.find((x) => x.types.includes(type))?.long_name || "";
    const city    = get("locality") || get("administrative_area_level_2");
    const state   = get("administrative_area_level_1");
    const pincode = get("postal_code");
    const house_no = [get("subpremise"), get("premise"), get("street_number"), get("route"), get("sublocality_level_2"), get("sublocality_level_1") || get("sublocality")].filter(Boolean).join(", ");
    const area    = get("sublocality_level_1") || get("sublocality") || get("sublocality_level_2");
    if (city) setForm((f) => ({ ...f, house_no, area, city, state, pincode }));
    // else reverseGeocode will fill via pinLocation
  }

  function handlePickNearbyPlace(place) {
    const lt = place.geometry.location.lat();
    const ln = place.geometry.location.lng();
    pinLocation(lt, ln);
  }

  function pinLocation(lt, ln) {
    setMarkerPos({ lat: lt, lng: ln });
    setMapCenter({ lat: lt, lng: ln });
    setLat(lt); setLng(ln);
    setCoords(lt, ln);
    reverseGeocode(lt, ln);
  }

  const onMarkerDragEnd = useCallback((e) => {
    pinLocation(e.latLng.lat(), e.latLng.lng());
  }, []);

  function onMapClick(e) { pinLocation(e.latLng.lat(), e.latLng.lng()); }

  function locateMe() {
    if (!navigator.geolocation) return showToast.error("Location not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pinLocation(pos.coords.latitude, pos.coords.longitude);
        showToast.success("Location detected");
        setLocating(false);
      },
      () => { showToast.error("Couldn't access location"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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
            <h1 className="text-2xl font-bold sm:text-3xl">Purohit Registration</h1>
            <p className="mt-1 text-ink-500">Join Poojify and start serving devotees. Fill in the details below to create your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Basic Info */}
              <FormCard step={1} title="Basic Information">
                <div className="mb-2 flex flex-col items-center gap-2">
                  <button type="button" onClick={() => profileRef.current?.click()}
                    className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-ink-500/20 bg-cream-100">
                    {previews.profile_image
                      ? <img src={previews.profile_image} className="h-full w-full object-cover rounded-full overflow-hidden" alt="profile" />
                      : <ImageIcon size={22} className="text-ink-500/40" />}
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-md z-10">
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
                {/* <F
  label="Email ID"
  type="email"
  value={form.email}
  onChange={set("email")}
  placeholder="Enter email address"
  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
  title="Please enter a valid email address"
  required
/> */}
                <div>
                  <label className="label">About</label>
                  <textarea value={form.about} onChange={set("about")} rows={3} className="input" placeholder="Tell us about yourself..." />
                </div>
              </FormCard>

              {/* Identity Verification */}
              <FormCard step={2} title="Identity Verification">
                <div>
                  <label className="label">Document Type <span className="text-danger">*</span></label>
                  <select value={form.id_type} onChange={(e) => setForm((f) => ({ ...f, id_type: e.target.value, id_number: "" }))} className="input" required>
                    {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Document Number <span className="text-danger">*</span></label>
                  <input
                    value={form.id_number}
                    onChange={(e) => {
                      const active = ID_TYPES.find((t) => t.value === form.id_type);
                      let val = e.target.value;
                      if (active?.numeric) val = val.replace(/\D/g, "").slice(0, active.maxLen);
                      else val = val.toUpperCase().slice(0, active?.maxLen ?? 20);
                      setForm((f) => ({ ...f, id_number: val }));
                    }}
                    placeholder={ID_TYPES.find((t) => t.value === form.id_type)?.placeholder ?? "Enter document number"}
                    className="input"
                    required
                  />
                  <p className="mt-1 text-xs text-ink-500">
                    {form.id_type === "aadhaar" && `${form.id_number.length}/12 digits`}
                    {form.id_type === "voter_id" && "Format: ABC1234567 (10 chars)"}
                    {form.id_type === "pan" && "Format: ABCDE1234F (10 chars)"}
                    {form.id_type === "passport" && "Format: A1234567 (8 chars)"}
                  </p>
                </div>
                <div className={form.id_type === "pan" ? "" : "grid grid-cols-2 gap-3"}>
                  <UploadBox label="Front Side" onChange={(e) => onFileChange("document_proof", e)} file={files.document_proof} />
                  {form.id_type !== "pan" && (
                    <UploadBox label="Back Side" onChange={(e) => onFileChange("document_proof_back", e)} file={files.document_proof_back} />
                  )}
                </div>
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

              {/* Address */}
              <FormCard step={3} title="Address & Location">
                {/* Search box with debounce suggestions */}
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-lg border border-ink-500/15 px-3 focus-within:border-primary-500">
                    <Search size={14} className="shrink-0 text-ink-500" />
                    <input
                      type="text"
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Search area, city, landmark..."
                      className="w-full bg-transparent py-2 text-sm outline-none"
                    />
                    {loadingTextSearch && (
                      <div className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    )}
                  </div>
                  {showSuggestions && textResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-ink-500/10 bg-white shadow-md">
                      {textResults.map((place) => (
                        <button
                          key={place.place_id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handlePickTextResult(place)}
                          className="flex w-full items-start gap-2 border-b border-ink-500/5 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-primary-50"
                        >
                          <MapPin size={13} className="mt-0.5 shrink-0 text-primary-500" />
                          <span>
                            <span className="font-medium text-ink-800">{place.name}</span>
                            <span className="block text-[11px] text-ink-500">{place.formatted_address}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map with floating Locate Me */}
                <div className="relative rounded-xl shadow-sm" style={{ overflow: "visible" }}>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "224px", borderRadius: "12px", overflow: "hidden" }}
                      center={mapCenter} zoom={16}
                      onClick={onMapClick}
                      onLoad={onMapLoad}
                      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, gestureHandling: "greedy" }}
                    >
                      {markerPos && (
                        <Marker
                          position={markerPos}
                          draggable
                          onDragEnd={(e) => pinLocation(e.latLng.lat(), e.latLng.lng())}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-xl bg-cream-200 text-sm text-ink-500">Loading map...</div>
                  )}
                  <button type="button" onClick={locateMe} disabled={locating}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-lg hover:bg-primary-50 hover:text-primary-600 transition disabled:opacity-60" style={{ zIndex: 10 }}>
                    <LocateFixed size={13} className={locating ? "animate-spin text-primary-500" : ""} />
                    {locating ? "Detecting..." : "Locate Me"}
                  </button>
                </div>

                {/* Detected address preview */}
                {detectedAddress && (
                  <div className="flex items-start justify-between gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      {geocoding
                        ? <div className="mt-0.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                        : <MapPin size={14} className="mt-0.5 shrink-0 text-primary-500" />}
                      <p className="text-xs text-ink-700 leading-snug">
                        {geocoding ? "Fetching address..." : [detectedAddress.house_no, detectedAddress.city, detectedAddress.state, detectedAddress.pincode].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    {!geocoding && (
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, house_no: detectedAddress.house_no, area: detectedAddress.area, city: detectedAddress.city, state: detectedAddress.state, pincode: detectedAddress.pincode }))}
                        className="shrink-0 flex items-center gap-1 rounded-lg bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-primary-600 transition">
                        <CheckCircle2 size={11} /> Use This
                      </button>
                    )}
                  </div>
                )}

                {/* Nearby landmarks */}
                {/* {nearbyPlaces.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Nearby Landmarks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {nearbyPlaces.map((place) => (
                        <button key={place.place_id} type="button" onClick={() => handlePickNearbyPlace(place)}
                          className="rounded-full border border-ink-500/15 bg-white px-2.5 py-1 text-[11px] text-ink-700 hover:border-primary-300 hover:bg-primary-50 transition">
                          {place.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )} */}

                <div>
                  <label className="label">House No / Street <span className="text-danger">*</span></label>
                  <input value={form.house_no} onChange={set("house_no")} placeholder="House no, street" required className="input" />
                  <p className="mt-1 text-xs text-ink-500">📍 Map se area detect hota hai — house/flat number manually verify karein</p>
                </div>
                <F label="Area" value={form.area} onChange={set("area")} placeholder="Area / locality" required />
                <div className="grid grid-cols-2 gap-3">
                  <F label="City" value={form.city} onChange={set("city")} placeholder="City" required />
                  <F label="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="Pincode" required />
                </div>
                <F label="State" value={form.state} onChange={set("state")} placeholder="State" required />

                <div>
                  <label className="label">Service Radius (km) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    min={1} max={100}
                    value={form.service_radius}
                    onChange={(e) => setForm((f) => ({ ...f, service_radius: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                    placeholder="e.g. 10"
                    className="input"
                    required
                  />
                </div>
              </FormCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-1">
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

            </div>

            {/* Declaration */}
            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">5</span>
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
