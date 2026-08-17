import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from "@react-google-maps/api";
import { LocateFixed, MapPin, Search, Plus, Home, Briefcase, Tag, Edit, Trash2 } from "lucide-react";
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

function emptyForm() {
  return { id: null, houseNo: "", landmark: "", city: "", pincode: "", state: "", addressType: "home" };
}

export default function ManageAddress() {
  const { setCoords, setAddress } = useLocationStore();
  const searchBoxRef = useRef(null);

  const [center, setCenter] = useState({ lat: 26.8467, lng: 80.9462 });
  const [markerPos, setMarkerPos] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [addresses, setAddresses] = useState([]);
  const [currentLocationData, setCurrentLocationData] = useState(emptyForm());

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAP_KEY, libraries: LIBRARIES });

  // Fetch existing addresses
  const { data: addressListData } = useQuery({
    queryKey: ["address-list"],
    queryFn: getAddressList,
  });

  useEffect(() => {
    if (addressListData?.data) {
      // Handle both array and object with data.addresses
      const addrList = Array.isArray(addressListData.data) 
        ? addressListData.data 
        : addressListData.data.addresses || [];
      setAddresses(addrList);
    }
  }, [addressListData]);

  // on mount — auto detect current location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("Geolocation Success:", { lat, lng });
        setCoords(lat, lng);
        setCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        reverseGeocode(lat, lng);
      },
      (err) => {
        console.error("Geolocation Error:", err);
        // Fallback to default location
        const defaultLat = 26.8467;
        const defaultLng = 80.9462;
        setCoords(defaultLat, defaultLng);
        setCenter({ lat: defaultLat, lng: defaultLng });
        setMarkerPos({ lat: defaultLat, lng: defaultLng });
        reverseGeocode(defaultLat, defaultLng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_KEY}`
      );
      const data = await res.json();
      
      console.log("Reverse Geocode Response:", data);
      
      if (data.results?.[0]) {
        const c = data.results[0].address_components;
        const get = (type) => c.find((x) => x.types.includes(type))?.long_name || "";
        
        const city = get("locality") || get("administrative_area_level_2");
        const state = get("administrative_area_level_1");
        const pincode = get("postal_code");
        const streetNo = get("street_number");
        const route = get("route");
        const sublocality = get("sublocality_level_1") || get("sublocality");
        const houseNo = [streetNo, route, sublocality].filter(Boolean).join(", ");
        
        console.log("Extracted Data:", { city, state, pincode, houseNo });
        
        // Store current location data for later use
        const locationData = { 
          id: null,
          houseNo: houseNo || "", 
          landmark: "", 
          city: city || "", 
          pincode: pincode || "", 
          state: state || "", 
          addressType: "home"
        };
        
        console.log("Setting Location Data:", locationData);
        
        setCurrentLocationData(locationData);
        setForm(locationData);
        setAddress(city ? `${city}, ${state}` : data.results[0].formatted_address);
      } else {
        console.warn("No results from reverse geocoding");
      }
    } catch (err) {
      console.error("Reverse Geocoding Error:", err);
    }
  }

  function onMapClick(e) {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    setCenter({ lat, lng });
    reverseGeocode(lat, lng);
  }

  function locateMe() {
    if (!navigator.geolocation) return showToast.error("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords(lat, lng);
        setCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        reverseGeocode(lat, lng);
        showToast.success("Current location detected");
      },
      () => showToast.error("Couldn't access location. Allow permission."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function onPlacesChanged() {
    const places = searchBoxRef.current?.getPlaces();
    if (!places?.length) return;
    const place = places[0];
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCenter({ lat, lng });
    setMarkerPos({ lat, lng });
    reverseGeocode(lat, lng);
  }

  function handleAddNew() {
    // Use current location data as default for new address
    setForm(currentLocationData);
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
    setMarkerPos({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
    setCenter({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
    setShowForm(true);
    setTimeout(() => document.getElementById("addr-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleDeleteAddress(addressId) {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const res = await deleteAddress(addressId);
      showToast.success(res.message || "Address deleted successfully");
      // Remove from local list
      setAddresses(addresses.filter((a) => a.id !== addressId));
    } catch (err) {
      showToast.error(err.message || "Failed to delete address");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!markerPos) return showToast.error("Please select location on map");
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
        // Update existing address
        res = await updateAddress({ ...payload, address_id: form.id });
      } else {
        // Add new address
        res = await addAddress(payload);
      }

      showToast.success(res.message || (form.id ? "Address updated successfully" : "Address saved successfully"));
      setShowForm(false);
      setForm(emptyForm());
      // Refresh addresses list
      // Note: In production, you'd trigger a refetch of the profile query
    } catch (err) {
      showToast.error(err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  const set = (key) => (e) => {
    const newValue = e.target.value;
    console.log(`Updating ${key}:`, newValue);
    setForm((f) => ({ ...f, [key]: newValue }));
  };

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-3xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Manage Address" }]} />
          <h1 className="mb-1 text-2xl font-bold">Manage Address</h1>
          <p className="mb-6 text-sm text-ink-500">Search or tap on map to set your delivery location</p>

          {/* Map card */}
          <div className="card mb-6">
            <div className="mb-3 flex gap-2">
              {isLoaded && (
                <StandaloneSearchBox
                  onLoad={(ref) => (searchBoxRef.current = ref)}
                  onPlacesChanged={onPlacesChanged}
                >
                  <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-lg border border-ink-500/15 px-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
                    <Search size={15} className="shrink-0 text-ink-500" />
                    <input
                      type="text"
                      placeholder="Search area, street, city..."
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                </StandaloneSearchBox>
              )}
              <Button size="sm" onClick={locateMe} type="button">
                <LocateFixed size={15} /> Locate Me
              </Button>
            </div>

            {isLoaded ? (
              <GoogleMap
                mapContainerClassName="w-full h-64 rounded-xl overflow-hidden"
                center={center}
                zoom={15}
                onClick={onMapClick}
                options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
              >
                {markerPos && <Marker position={markerPos} />}
              </GoogleMap>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-cream-200 text-sm text-ink-500">
                Loading map...
              </div>
            )}

            {markerPos && (
              <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
                <MapPin size={12} className="text-primary-500" /> Tap map to adjust pin
              </p>
            )}
          </div>

          {/* Add new address button + current location preview + existing addresses list */}
          <div className="mb-6 space-y-4">
            {/* Existing addresses list */}
            {addresses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-ink-700">Your Saved Addresses</h3>
                {addresses.map((addr) => (
                  <div key={addr.id} className="flex items-start justify-between rounded-xl border border-ink-500/15 p-4 hover:border-primary-300 transition">
                    <div className="flex gap-3">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-primary-500" />
                      <div>
                        <p className="font-semibold text-sm capitalize">{addr.address_type}</p>
                        <p className="text-sm text-ink-600">
                          {addr.house_no}
                          {addr.landmark && `, Near ${addr.landmark}`}
                        </p>
                        <p className="text-xs text-ink-500">
                          {addr.city}, {addr.state} {addr.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="p-2 text-ink-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        aria-label="Edit address"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-ink-500 hover:text-danger hover:bg-red-50 rounded-lg transition"
                        aria-label="Delete address"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAddNew}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-300 py-4 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition"
            >
              <Plus size={18} /> Add New Address
            </button>

            {(form.city || form.houseNo) && !showForm && (
              <div className="flex items-start gap-2 rounded-xl bg-cream-100 border border-ink-500/10 px-4 py-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary-500" />
                <p className="text-sm text-ink-700 leading-snug">
                  {[form.houseNo, form.city, form.state, form.pincode].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Address form — shown after clicking Add New Address or Edit */}
          {showForm && (
            <form id="addr-form" onSubmit={handleSubmit} className="card space-y-4">
              <h2 className="font-semibold">{form.id ? "Edit Address" : "Add New Address"}</h2>

              <div>
                <label className="label">House No / Flat / Street <span className="text-danger">*</span></label>
                <input value={form.houseNo} onChange={set("houseNo")} className="input" placeholder="e.g. H-123, Flat 2, MG Road" required />
              </div>

              <div>
                <label className="label">Landmark <span className="text-xs text-ink-500">(optional)</span></label>
                <input value={form.landmark} onChange={set("landmark")} className="input" placeholder="e.g. Near Temple" />
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
                    className="input" placeholder="226022" required
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
                <Button type="submit" fullWidth loading={saving}>{form.id ? "Update Address" : "Save Address"}</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
