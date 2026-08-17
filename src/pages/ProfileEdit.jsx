import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { useAuthStore } from "../store/authStore";
import { showToast } from "../components/common/Toast";
import { getProfile } from "../api/userApi";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  useEffect(() => {
    if (data?.data?.user) {
      const u = data.data.user;
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.mobile || "");
      setGender(u.gender || "");
      setDob(u.dob || "");
      updateUser({ name: u.name, email: u.email, phone: u.mobile, gender: u.gender, dob: u.dob, profile_image: u.profile_image });
    }
  }, [data, updateUser]);

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      updateUser({ name, email, phone, gender, dob });
      showToast.success("Profile updated successfully");
      navigate(-1);
    }, 700);
  }

  return (
    <PageTransition>
      <div className="section-y flex justify-center">
        <div className="w-full max-w-lg">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Edit Profile" }]} />
          <div className="card">
            <h1 className="mb-5 text-xl font-bold">Edit Profile</h1>

            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600 overflow-hidden">
                {data?.data?.user?.profile_image
                  ? <img src={data.data.user.profile_image} alt="profile" className="h-full w-full object-cover" />
                  : <User size={28} />}
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white">
                  <Camera size={13} />
                </span>
              </div>
              <p className="text-xs text-ink-500">Tap to change photo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Enter full name" required />
              </div>

              <div>
                <label className="label">Mobile Number</label>
                <div className="flex overflow-hidden rounded-lg border border-ink-500/15 focus-within:border-primary-500">
                  <span className="flex items-center bg-cream-200 px-3 text-sm">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    type="tel"
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                    placeholder="Mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email ID</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input" placeholder="you@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" className="input" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" fullWidth loading={saving}>Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
