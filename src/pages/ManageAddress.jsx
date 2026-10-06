import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, OverlayView } from "@react-google-maps/api";
import { LocateFixed, MapPin, Plus, Home, Briefcase, Tag, Edit, Trash2, CheckCircle2, Search } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";
import { useLocationStore } from "../store/locationStore";
import { getAddressList, addAddress, updateAddress, deleteAddress } from "../api/userApi";

const LIBRARIES = ["places"];
const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const ADDRESS_TYPES = [
  { value: "home", icon: Home },
  { value: "work", icon: Briefcase },
  { value: "other", icon: Tag },
];

const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControlOptions: { position: 9 }, // RIGHT_CENTER
  gestureHandling: "greedy",
};

const DEBOUNCE_MS = 500; // typing rukne ke baad itni der wait karke search chalega
const MIN_QUERY_LEN = 3; // 3 letters se kam pe search nahi chalega (fizool API calls bachane ke liye)

function emptyForm() {
  return { id: null, houseNo: "", landmark: "", city: "", pincode: "", state: "", addressType: "home" };
}

export default function ManageAddress() {
  const { setCoords, setAddress } = useLocationStore();
  const { state } = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null); // Details / Nearby / Text Search (legacy PlacesService)
  const debounceTimerRef = useRef(null);
  const queryClient = useQueryClient();

  const [center, setCenter] = useState({ lat: 26.8467, lng: 80.9462 });
  const [markerPos, setMarkerPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [addresses, setAddresses] = useState([]);
  const [detectedAddress, setDetectedAddress] = useState(null);

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const [textQuery, setTextQuery] = useState("");
  const [textResults, setTextResults] = useState([]);
  const [loadingTextSearch, setLoadingTextSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAP_KEY, libraries: LIBRARIES });

  const { data: addressListData } = useQuery({
    queryKey: ["address-list"],
    queryFn: getAddressList,
  });

  useEffect(() => {
    if (addressListData?.data) {
      const addrList = Array.isArray(addressListData.data)
        ? addressListData.data
        : addressListData.data.addresses || [];
      setAddresses(addrList);
    }
  }, [addressListData]);

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  useEffect(() => {
    if (markerPos && placesServiceRef.current) {
      fetchNearbyPlaces(markerPos.lat, markerPos.lng);
    }
  }, [markerPos]);

  // ---------------- DEBOUNCED TEXT SEARCH ----------------
  // Jab bhi textQuery badalta hai, purana timer cancel karke naya timer lagate hain.
  // Sirf jab user typing rok deta hai (DEBOUNCE_MS tak koi naya keystroke nahi), tabhi API call hoti hai.
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!textQuery.trim() || textQuery.trim().length < MIN_QUERY_LEN) {
      setTextResults([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performTextSearch(textQuery);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimerRef.current);
  }, [textQuery]);

  function onMapLoad(map) {
    mapRef.current = map;
    if (window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
      console.log("[Places] PlacesService ready — Nearby / Text Search ab kaam karenge");
    }
  }

  // ---------------- GEOCODING API (REST) ----------------
  async function reverseGeocode(lat, lng) {
    setGeocoding(true);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_KEY}&language=en&region=IN`;
    console.log("[Geocoding API] URL ->", url);
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("[Geocoding API] Response status ->", data.status);
      console.log("[Geocoding API] Full response ->", data);

      if (data.status !== "OK") {
        console.warn("[Geocoding API] Error/No result. Status:", data.status, data.error_message || "");
        return null;
      }

      if (data.results?.[0]) {
        const c = data.results[0].address_components;
        const get = (type) => c.find((x) => x.types.includes(type))?.long_name || "";

        const city       = get("locality") || get("administrative_area_level_2");
        const state      = get("administrative_area_level_1");
        const pincode    = get("postal_code");
        const subpremise = get("subpremise");
        const premise    = get("premise");
        const streetNo   = get("street_number");
        const route      = get("route");
        const sub2       = get("sublocality_level_2");
        const sub1       = get("sublocality_level_1") || get("sublocality");
        const houseNo    = [subpremise, premise, streetNo, route, sub2, sub1].filter(Boolean).join(", ");

        const detected = {
          houseNo: houseNo || "",
          city: city || "",
          state: state || "",
          pincode: pincode || "",
          full: data.results[0].formatted_address,
          lat,
          lng,
        };
        console.log("[Geocoding API] Parsed address ->", detected);
        console.log("[Geocoding API] Parsed address----- data ->", data);

        setDetectedAddress(detected);
        setAddress(city ? `${city}, ${state}` : detected.full);
        setCoords(lat, lng);

        // form fields auto-fill
        setForm((f) => ({
          ...f,
          houseNo: detected.houseNo,
          city: detected.city || f.city,
          state: detected.state || f.state,
          pincode: detected.pincode || f.pincode,
        }));

        return detected;
      }
    } catch (err) {
      console.error("[Geocoding API] Fetch error:", err);
    } finally {
      setGeocoding(false);
    }
    return null;
  }

  // ---------------- NEARBY SEARCH API (JS library) ----------------
  function fetchNearbyPlaces(lat, lng) {
    if (!placesServiceRef.current || !window.google) return;
    setLoadingNearby(true);
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 500,
    };
    console.log("[Nearby Search API] Request ->", { lat, lng, radius: request.radius });

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      setLoadingNearby(false);
      console.log("[Nearby Search API] Status ->", status);

      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const clean = results.map((p) => ({
          name: p.name,
          place_id: p.place_id,
          lat: p.geometry?.location?.lat(),
          lng: p.geometry?.location?.lng(),
          vicinity: p.vicinity,
        }));
        console.log("[Nearby Search API] Results (clean) ->", clean);
        setNearbyPlaces(results.slice(0, 5));
      } else {
        console.warn("[Nearby Search API] No results / error status:", status);
        setNearbyPlaces([]);
      }
    });
  }

  // ---------------- TEXT SEARCH API (JS library) — ab debounce ke saath auto-suggestions ----------------
  function performTextSearch(query) {
    if (!placesServiceRef.current || !window.google) return;
    setLoadingTextSearch(true);
    console.log("[Text Search API] Query ->", query);

    placesServiceRef.current.textSearch({ query }, (results, status) => {
      setLoadingTextSearch(false);
      console.log("[Text Search API] Status ->", status);

      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const clean = results.map((p) => ({
          name: p.name,
          place_id: p.place_id,
          formatted_address: p.formatted_address,
          lat: p.geometry?.location?.lat(),
          lng: p.geometry?.location?.lng(),
        }));
        console.log("[Text Search API] Results (clean) ->", clean);
        setTextResults(results.slice(0, 5));
        setShowSuggestions(true);
      } else {
        console.warn("[Text Search API] No results / error status:", status);
        setTextResults([]);
        setShowSuggestions(false);
      }
    });
  }

  function handlePickTextResult(place) {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCenter({ lat, lng });
    setMarkerPos({ lat, lng });
    setTextQuery(place.formatted_address || place.name || "");
    setTextResults([]);
    setShowSuggestions(false);

    // address components directly from place (agar available ho)
    const c = place.address_components ?? [];
    const get = (type) => c.find((x) => x.types.includes(type))?.long_name || "";
    const city    = get("locality") || get("administrative_area_level_2");
    const state   = get("administrative_area_level_1");
    const pincode = get("postal_code");
    const sub1    = get("sublocality_level_1") || get("sublocality");
    const sub2    = get("sublocality_level_2");
    const route   = get("route");
    const streetNo = get("street_number");
    const premise  = get("premise");
    const subpremise = get("subpremise");
    const houseNo = [subpremise, premise, streetNo, route, sub2, sub1].filter(Boolean).join(", ");

    const detected = { houseNo, city, state, pincode, full: place.formatted_address, lat, lng };
    setDetectedAddress(detected);
    setCoords(lat, lng);
    setAddress(city ? `${city}, ${state}` : place.formatted_address);

    // form fill
    setForm((f) => ({
      ...f,
      houseNo: houseNo,
      city: city || f.city,
      state: state || f.state,
      pincode: pincode || f.pincode,
    }));

    // fallback: agar address_components nahi mila toh reverseGeocode se fill karo
    if (!city) reverseGeocode(lat, lng);
  }

  function handlePickNearbyPlace(place) {
    setForm((f) => ({ ...f, landmark: place.name ?? "" }));
  }

  function detectCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("[Browser Geolocation] Detected ->", { lat, lng });
        setCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        await reverseGeocode(lat, lng);
        setLocating(false);
      },
      () => {
        console.warn("[Browser Geolocation] Permission denied — fallback to Lucknow");
        setMarkerPos({ lat: 26.8467, lng: 80.9462 });
        reverseGeocode(26.8467, 80.9462);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 80000 }
    );
  }

  function locateMe() {
    if (!navigator.geolocation) return showToast.error("Location not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("[Browser Geolocation] Use My Location ->", { lat, lng });
        setCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        await reverseGeocode(lat, lng);
        setLocating(false);
        showToast.success("Location detected!");
      },
      () => { showToast.error("Allow location permission"); setLocating(false); },
      { enableHighAccuracy: true, timeout: 80000 }
    );
  }

  const onMarkerDragEnd = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    console.log("[Marker Drag] New position ->", { lat, lng });
    setMarkerPos({ lat, lng });
    setCenter({ lat, lng });
    reverseGeocode(lat, lng);
  }, []);

  function onMapClick(e) {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    console.log("[Map Click] Position ->", { lat, lng });
    setMarkerPos({ lat, lng });
    setCenter({ lat, lng });
    reverseGeocode(lat, lng);
  }

  function handleUseThisLocation() {
    if (!detectedAddress) return;
    setForm((f) => ({
      ...f,
      houseNo: detectedAddress.houseNo,
      city: detectedAddress.city || f.city,
      state: detectedAddress.state || f.state,
      pincode: detectedAddress.pincode || f.pincode,
    }));
    setShowForm(true);
    setTimeout(() => document.getElementById("addr-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function handleAddNew() {
    setForm(detectedAddress
      ? { id: null, houseNo: detectedAddress.houseNo, landmark: "", city: detectedAddress.city, pincode: detectedAddress.pincode, state: detectedAddress.state, addressType: "home" }
      : emptyForm()
    );
    setShowForm(true);
    setTimeout(() => document.getElementById("addr-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function handleEditAddress(addr) {
    setForm({
      id: addr.id,
      houseNo: addr.house_no || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
      state: addr.state || "",
      addressType: addr.address_type || "home",
    });
    const lat = parseFloat(addr.latitude);
    const lng = parseFloat(addr.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPos({ lat, lng });
      setCenter({ lat, lng });
    }
    setShowForm(true);
    setTimeout(() => document.getElementById("addr-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleDeleteAddress(addressId) {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await deleteAddress(addressId);
      showToast.success(res.message || "Address deleted");
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch (err) {
      showToast.error(err.message || "Failed to delete");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!markerPos) return showToast.error("Please pin your location on the map");
    setSaving(true);
    try {
      const payload = {
        latitude: String(markerPos.lat),
        longitude: String(markerPos.lng),
        house_no: form.houseNo,
        landmark: form.landmark,
        city: form.city,
        pincode: form.pincode,
        state: form.state,
        address_type: form.addressType,
      };

      let res;
      if (form.id) {
        res = await updateAddress({ ...payload, address_id: form.id });
        setAddresses((prev) => prev.map((a) => a.id === form.id ? { ...a, ...payload, address_type: form.addressType, house_no: form.houseNo } : a));
      } else {
        res = await addAddress(payload);
        const newAddr = res.data ?? { ...payload, id: Date.now(), address_type: form.addressType, house_no: form.houseNo };
        setAddresses((prev) => [...prev, newAddr]);
        queryClient.invalidateQueries({ queryKey: ["address-list"] });
      }

      showToast.success(res.message || (form.id ? "Address updated!" : "Address saved!"));
      setShowForm(false);
      setForm(emptyForm());
      if (state?.redirectTo) navigate(state.redirectTo, { state: state.bookingState });
    } catch (err) {
      showToast.error(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-2xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Manage Address" }]} />
          <h1 className="mb-1 text-2xl font-bold">Manage Address</h1>
          <p className="mb-5 text-sm text-ink-500">Search or drag the pin to set your exact delivery location</p>

          {/* Search box — Text Search API, debounce ke saath auto-suggestions */}
          <div className="relative mb-3">
            <div className="flex items-center gap-2 rounded-xl border border-ink-500/15 bg-white px-4 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
              <Search size={16} className="shrink-0 text-ink-500" />
              <input
                type="text"
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search your area, street, landmark, place..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
              {loadingTextSearch && (
                <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              )}
            </div>

            {showSuggestions && textResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-ink-500/10 bg-white shadow-md overflow-hidden">
                {textResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePickTextResult(place)}
                    className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary-50 border-b border-ink-500/5 last:border-0"
                  >
                    <MapPin size={14} className="mt-0.5 shrink-0 text-primary-500" />
                    <span>
                      <span className="font-medium text-ink-800">{place.name}</span>
                      <span className="block text-xs text-ink-500">{place.formatted_address}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative mb-3 rounded-2xl shadow-md" style={{ overflow: "visible" }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "384px", borderRadius: "16px", overflow: "hidden" }}
                center={center}
                zoom={16}
                onClick={onMapClick}
                onLoad={onMapLoad}
                options={MAP_OPTIONS}
              >
                {markerPos && isLoaded && (
                  <OverlayView position={markerPos} mapPaneName={OverlayView.FLOAT_PANE}>
                    <div
                      style={{ transform: "translate(-50%, -100%)", cursor: "grab", pointerEvents: "auto" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const map = mapRef.current;
                        if (!map) return;
                        map.setOptions({ draggable: false });
                        const mmListener = map.addListener("mousemove", (me) => setMarkerPos({ lat: me.latLng.lat(), lng: me.latLng.lng() }));
                        const muListener = map.addListener("mouseup", (me) => {
                          map.setOptions({ draggable: true });
                          window.google.maps.event.removeListener(mmListener);
                          window.google.maps.event.removeListener(muListener);
                          const lat = me.latLng.lat();
                          const lng = me.latLng.lng();
                          setMarkerPos({ lat, lng });
                          setCenter({ lat, lng });
                          reverseGeocode(lat, lng);
                        });
                      }}
                    >
                      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5960F"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                      </svg>
                    </div>
                  </OverlayView>
                )}
              </GoogleMap>
            ) : (
              <div className="flex h-80 items-center justify-center bg-cream-200 text-sm text-ink-500">
                Loading map...
              </div>
            )}
            <button
              onClick={locateMe}
              disabled={locating}
              style={{ zIndex: 10 }}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-lg hover:bg-primary-50 hover:text-primary-600 transition disabled:opacity-60"
            >
              <LocateFixed size={14} className={locating ? "animate-spin text-primary-500" : ""} />
              {locating ? "Detecting..." : "Use My Location"}
            </button>
          </div>

          {detectedAddress && (
            <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
              <div className="flex items-start gap-2">
                {geocoding ? (
                  <div className="mt-0.5 h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                ) : (
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary-500" />
                )}
                <div>
                  <p className="text-xs font-semibold text-primary-700 mb-0.5">
                    {geocoding ? "Fetching address..." : "Pinned Location"}
                  </p>
                  <p className="text-sm text-ink-700 leading-snug">
                    {[detectedAddress.houseNo, detectedAddress.city, detectedAddress.state, detectedAddress.pincode]
                      .filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              {!geocoding && (
                <button
                  onClick={handleUseThisLocation}
                  className="shrink-0 flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 transition"
                >
                  <CheckCircle2 size={13} /> Use This
                </button>
              )}
            </div>
          )}

          {(loadingNearby || nearbyPlaces.length > 0) && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Nearby Landmarks</p>
              {loadingNearby ? (
                <p className="text-xs text-ink-500">Dhundh rahe hain...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nearbyPlaces.map((place) => (
                    <button
                      key={place.place_id}
                      type="button"
                      onClick={() => handlePickNearbyPlace(place)}
                      className="rounded-full border border-ink-500/15 bg-white px-3 py-1.5 text-xs text-ink-700 hover:border-primary-300 hover:bg-primary-50 transition"
                      title="Is landmark ko apni location banane ke liye click karein"
                    >
                      {place.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {addresses.length > 0 && (
            <div className="mb-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Saved Addresses</p>
              {addresses.map((addr) => (
                <div key={addr.id} className="flex items-start justify-between rounded-xl border border-ink-500/10 p-4 hover:border-primary-300 transition">
                  <div className="flex gap-3">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-primary-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-0.5 capitalize">{addr.address_type}</p>
                      <p className="text-sm font-medium text-ink-800">
                        {addr.house_no}{addr.landmark ? `, Near ${addr.landmark}` : ""}
                      </p>
                      <p className="text-xs text-ink-500">{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditAddress(addr)} className="p-2 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 rounded-lg text-ink-400 hover:text-danger hover:bg-red-50 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showForm && (
            <button
              onClick={handleAddNew}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-300 py-4 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition"
            >
              <Plus size={18} /> Add New Address
            </button>
          )}

          {showForm && (
            <form id="addr-form" onSubmit={handleSubmit} className="card space-y-4">
              <h2 className="font-semibold">{form.id ? "Edit Address" : "Add New Address"}</h2>

              <div>
                <label className="label">House No / Flat / Street <span className="text-danger">*</span></label>
                <input value={form.houseNo} onChange={set("houseNo")} className="input" placeholder="e.g. Flat 2B, Shiv Nagar, MG Road" required />
                <p className="mt-1 text-xs text-ink-500">📍 Map se area detect hota hai — house/flat number manually verify karein</p>
              </div>

              <div>
                <label className="label">Landmark <span className="text-xs text-ink-500">(optional)</span></label>
                <input value={form.landmark} onChange={set("landmark")} className="input" placeholder="e.g. Near Hanuman Mandir" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City <span className="text-danger">*</span></label>
                  <input value={form.city} onChange={set("city")} className="input" placeholder="City" required />
                </div>
                <div>
                  <label className="label">Pincode <span className="text-danger">*</span></label>
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    className="input" placeholder="226022" inputMode="numeric" required
                  />
                </div>
              </div>

              <div>
                <label className="label">State <span className="text-danger">*</span></label>
                <input value={form.state} onChange={set("state")} className="input" placeholder="State" required />
              </div>

              <div>
                <label className="label">Address Type</label>
                <div className="flex gap-2">
                  {ADDRESS_TYPES.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, addressType: value }))}
                      className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                        form.addressType === value
                          ? "border-primary-500 bg-primary-50 text-primary-600"
                          : "border-ink-500/15 text-ink-500 hover:border-primary-300"
                      }`}
                    >
                      <Icon size={14} /> {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" fullWidth loading={saving}>{form.id ? "Update" : "Save Address"}</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}