import { useState } from "react";
import { Camera, Image as ImageIcon, MapPin, Plus, Minus, ShieldCheck, Lock, Wallet, Headset } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";

const specializationOptions = ["Vedic Pooja", "Grih Pooja", "Havan / Yagya", "Wedding Pooja", "Satyanarayan Pooja", "Other"];

const trustBadges = [
  { icon: ShieldCheck, title: "Verified & Trusted", subtitle: "100% verified purohits" },
  { icon: Lock, title: "Secure & Safe", subtitle: "Your information is protected" },
  { icon: Wallet, title: "Timely Payments", subtitle: "Hassle-free earnings & withdrawals" },
  { icon: Headset, title: "24x7 Support", subtitle: "We're always here to help you" },
];

export default function PurohitRegister() {
  const [specializations, setSpecializations] = useState(["Vedic Pooja", "Grih Pooja", "Havan / Yagya", "Wedding Pooja", "Satyanarayan Pooja", "Other"]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggleSpec(spec) {
    setSpecializations((s) => (s.includes(spec) ? s.filter((x) => x !== spec) : [...s, spec]));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!agreed) return showToast.error("Please accept the declaration to continue");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast.success("Application submitted! We'll review and get back to you.");
    }, 1000);
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
                <div className="mb-4 flex flex-col items-center gap-2">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-ink-500/20 bg-cream-100">
                    <ImageIcon size={22} className="text-ink-500/40" />
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white">
                      <Camera size={13} />
                    </span>
                  </div>
                  <p className="text-xs text-ink-500">Upload Photo · JPG, PNG (Max 2MB)</p>
                </div>
                <Field label="Full Name" placeholder="Enter full name" required />
                <div className="mb-4">
                  <label className="label">Mobile Number</label>
                  <div className="flex overflow-hidden rounded-lg border border-ink-500/15 focus-within:border-primary-500">
                    <span className="flex items-center bg-cream-100 px-3 text-sm">+91</span>
                    <input required type="tel" placeholder="Enter mobile number" className="w-full px-3 py-2.5 text-sm outline-none" />
                  </div>
                </div>
                <Field label="Email ID" type="email" placeholder="Enter email address" required />
                <div>
                  <label className="label">About Us</label>
                  <textarea rows={3} className="input" placeholder="Tell us about yourself, your experience and services..." />
                </div>
              </FormCard>

              {/* Identity Verification */}
              <FormCard step={2} title="Identity Verification">
                <SelectField label="Document Type" options={["Aadhaar Card", "PAN Card", "Voter ID", "Driving Licence"]} required />
                <Field label="Document Number" placeholder="Enter document number" required />
                <div className="grid grid-cols-2 gap-3">
                  <UploadBox label="Front Side" />
                  <UploadBox label="Back Side" />
                </div>
              </FormCard>

              {/* Address & Location */}
              <FormCard step={3} title="Address & Location">
                <label className="label flex items-center gap-1.5"><MapPin size={14} /> Pick Location on Map</label>
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-cream-200 text-sm text-ink-500">
                  Map preview placeholder
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" placeholder="Enter city" required />
                  <Field label="Pincode" placeholder="Enter pincode" required />
                </div>
                <SelectField label="Service Radius (KM)" options={["5 KM", "10 KM", "20 KM", "50 KM"]} required />
              </FormCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Religious & Professional Details */}
              <FormCard step={4} title="Religious & Professional Details">
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Sampraday / Tradition" options={["Sanatan Dharma", "Shaiva", "Vaishnava", "Other"]} required />
                  <SelectField label="Experience (Years)" options={["1-3 Years", "4-7 Years", "8-12 Years", "12+ Years"]} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Specializations</label>
                    <p className="text-xs text-ink-500">Select all that apply below</p>
                  </div>
                  <SelectField label="Language Known" options={["Hindi", "English", "Tamil", "Telugu", "Sanskrit"]} required />
                </div>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((spec) => {
                    const active = specializations.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpec(spec)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-ink-500/15 text-ink-500"
                        }`}
                      >
                        {active ? <Minus size={12} /> : <Plus size={12} />} {spec}
                      </button>
                    );
                  })}
                </div>
              </FormCard>

              {/* Documents & Work Proof */}
              <FormCard step={5} title="Documents & Work Proof">
                <div className="grid grid-cols-2 gap-3">
                  <UploadBox label="Work Proof" hint="JPG, PNG, PDF (Max 2MB)" />
                  <UploadBox label="Upload Certificate" hint="JPG, PNG, PDF (Max 2MB)" />
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
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary-500" required />
                I hereby declare that the above information is true to the best of my knowledge. I agree to the <a className="link">Terms & Conditions</a> and <a className="link">Privacy Policy</a> of Poojify.
              </label>
              <Button type="submit" fullWidth size="lg" loading={submitting}>Submit Application →</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-primary-50 p-6 sm:grid-cols-4">
              {trustBadges.map((b) => (
                <div key={b.title} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary-500">
                    <b.icon size={16} />
                  </span>
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

function Field({ label, type = "text", placeholder, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      <input type={type} placeholder={placeholder} required={required} className="input" />
    </div>
  );
}

function SelectField({ label, options, required }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      <select required={required} defaultValue="" className="input">
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function UploadBox({ label, hint = "JPG, PNG (Max 2MB)" }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-500/20 bg-cream-100 p-4 text-center hover:border-primary-400">
      <input type="file" className="hidden" accept="image/*,.pdf" />
      <ImageIcon size={20} className="text-ink-500/40" />
      <span className="text-xs font-medium">Upload {label}</span>
      <span className="text-[10px] text-ink-500">{hint}</span>
    </label>
  );
}
