import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Wallet, Landmark, IndianRupee, CheckCircle2, Clock, XCircle, Trash2, Pencil, Plus, KeyRound, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { PageLoader } from "../components/common/Loader";
import { formatINR, formatDate } from "../utils/format";
import { showToast } from "../components/common/Toast";
import {
  getPanditBookHistory, getWalletSummary,
  getPanditAccount, addPanditAccount, updatePanditAccount, deletePanditAccount,
  verifyBooking,
} from "../api/panditApi";

const TABS = [
  { key: "bookings", label: "Booking History", icon: CalendarDays },
  { key: "wallet",   label: "My Wallet",        icon: Wallet },
  { key: "bank",     label: "Bank Account",      icon: Landmark },
];

const STATUS_MAP = {
  0: { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
  1: { label: "Confirmed", cls: "bg-blue-100 text-blue-700" },
  2: { label: "Completed", cls: "bg-green-100 text-green-700" },
  3: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

function emptyBank() {
  return { account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "" };
}

export default function PanditDashboard() {
  const [tab, setTab] = useState("bookings");

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Pandit Dashboard" }]} />
          <h1 className="mb-1 text-2xl font-bold">Pandit Dashboard</h1>
          <p className="mb-6 text-sm text-ink-500">Manage your bookings, wallet and bank account.</p>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-ink-500/10 bg-cream-100 p-1 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition whitespace-nowrap ${
                  tab === t.key ? "bg-white shadow text-primary-600" : "text-ink-500 hover:text-primary-600"
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {tab === "bookings" && <BookingHistoryTab />}
          {tab === "wallet"   && <WalletTab />}
          {tab === "bank"     && <BankTab />}
        </div>
      </div>
    </PageTransition>
  );
}

/* ─── Booking History ─── */
function BookingHistoryTab() {
  const qc = useQueryClient();
  const [verifyBookingId, setVerifyBookingId] = useState(null);
  const [pin, setPin] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pandit-book-history"],
    queryFn: getPanditBookHistory,
    select: (res) => res?.data,
  });

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: () => verifyBooking(verifyBookingId, pin),
    onSuccess: (res) => {
      showToast.success(res?.message || "Booking verified!");
      qc.invalidateQueries({ queryKey: ["pandit-book-history"] });
      setVerifyBookingId(null);
      setPin("");
    },
    onError: (err) => showToast.error(err?.message || "Invalid PIN. Please try again."),
  });

  if (isLoading) return <PageLoader />;

  const summary = data?.summary ?? {};
  const bookings = data?.bookings ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard icon={CalendarDays} label="Total" value={summary.total_bookings ?? 0} color="primary" />
        <SummaryCard icon={CheckCircle2} label="Completed" value={summary.completed_bookings ?? 0} color="success" />
        <SummaryCard icon={Clock} label="Pending" value={summary.pending_bookings ?? 0} color="amber" />
        <SummaryCard icon={XCircle} label="Cancelled" value={summary.cancelled_bookings ?? 0} color="danger" />
      </div>

      {bookings.length === 0 ? (
        <p className="py-12 text-center text-ink-500">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const s = STATUS_MAP[b.status] ?? { label: "Unknown", cls: "bg-gray-100 text-gray-600" };
            const canVerify = (b.status_text === "completed" || b.status === 2) && b.is_verified !== 1;
            return (
              <div key={b.booking_id} className="card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">Booking #{b.booking_id}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                    <span className="badge capitalize">{b.payment_type}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                    <CalendarDays size={13} /> {formatDate(b.booking_date)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {b.poojas?.map((p) => (
                      <span key={p.id} className="badge">{p.pooja_name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-primary-600">{formatINR(b.total_amount)}</p>
                  {canVerify && (
                    <button
                      onClick={() => { setPin(""); setVerifyBookingId(b.booking_id); }}
                      className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20 transition"
                    >
                      <KeyRound size={13} /> Verify
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {verifyBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="font-bold">Verify Booking</h2>
                <p className="text-xs text-ink-500">Enter the PIN shared by Pandit Ji</p>
              </div>
            </div>
            <input
              type="number"
              className="input mb-4 text-center text-xl tracking-widest"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 6))}
            />
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setVerifyBookingId(null); setPin(""); }}>Cancel</Button>
              <Button fullWidth loading={verifying} disabled={pin.length < 4} onClick={() => verify()}>Verify</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ─── Wallet ─── */
function WalletTab() {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: getWalletSummary,
    select: (res) => res?.data,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <WalletCard label="Total Earning"    value={wallet?.total_earning ?? 0} />
        <WalletCard label="Commission"       value={wallet?.total_commission ?? 0} />
        <WalletCard label="Admin Due"        value={wallet?.total_admin_due ?? 0} />
        <WalletCard label="Completed"        value={wallet?.completed_bookings ?? 0} isCount />
        <WalletCard label="Pending Bookings" value={wallet?.pending_bookings ?? 0} isCount />
      </div>

      {wallet?.payout_requests?.length > 0 && (
        <div className="card">
          <h3 className="mb-3 font-semibold">Payout Requests</h3>
          <div className="space-y-2">
            {wallet.payout_requests.map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-ink-500">{formatDate(r.created_at)}</span>
                <span className="font-semibold">{formatINR(r.amount)}</span>
                <span className="badge capitalize">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Bank Account ─── */
function BankTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyBank());

  const { data: account, isLoading } = useQuery({
    queryKey: ["pandit-account"],
    queryFn: getPanditAccount,
    select: (res) => res?.data ?? null,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (body) => account ? updatePanditAccount(body) : addPanditAccount(body),
    onSuccess: (res) => {
      showToast.success(res?.message || "Bank account saved!");
      qc.invalidateQueries({ queryKey: ["pandit-account"] });
      setShowForm(false);
    },
    onError: (err) => showToast.error(err?.message || "Failed to save account"),
  });

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: deletePanditAccount,
    onSuccess: (res) => {
      showToast.success(res?.message || "Account deleted");
      qc.invalidateQueries({ queryKey: ["pandit-account"] });
    },
    onError: (err) => showToast.error(err?.message || "Failed to delete account"),
  });

  function handleEdit() {
    setForm({
      account_holder_name: account?.account_holder_name ?? "",
      account_number: account?.account_number ?? "",
      ifsc_code: account?.ifsc_code ?? "",
      bank_name: account?.bank_name ?? "",
    });
    setShowForm(true);
  }

  function handleDelete() {
    if (!window.confirm("Delete bank account?")) return;
    remove();
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-lg space-y-4">
      {account ? (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold"><Landmark size={16} className="text-primary-500" /> Saved Bank Account</h3>
            <div className="flex gap-2">
              <button onClick={handleEdit} className="p-2 text-ink-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"><Pencil size={14} /></button>
              <button onClick={handleDelete} disabled={removing} className="p-2 text-ink-500 hover:text-danger hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Account Holder" value={account.account_holder_name} />
            <Row label="Account Number" value={`••••${String(account.account_number).slice(-4)}`} />
            <Row label="IFSC Code"      value={account.ifsc_code} />
            <Row label="Bank Name"      value={account.bank_name} />
          </div>
        </div>
      ) : !showForm ? (
        <button
          onClick={() => { setForm(emptyBank()); setShowForm(true); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-300 py-6 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition"
        >
          <Plus size={18} /> Add Bank Account
        </button>
      ) : null}

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold">{account ? "Update Bank Account" : "Add Bank Account"}</h3>
          <div>
            <label className="label">Account Holder Name <span className="text-danger">*</span></label>
            <input className="input" value={form.account_holder_name} onChange={set("account_holder_name")} placeholder="e.g. Ram Sharma" required />
          </div>
          <div>
            <label className="label">Account Number <span className="text-danger">*</span></label>
            <input className="input" value={form.account_number} onChange={set("account_number")} placeholder="e.g. 1234567890" required />
          </div>
          <div>
            <label className="label">IFSC Code <span className="text-danger">*</span></label>
            <input className="input" value={form.ifsc_code} onChange={(e) => setForm((f) => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))} placeholder="e.g. SBIN0001234" required />
          </div>
          <div>
            <label className="label">Bank Name <span className="text-danger">*</span></label>
            <input className="input" value={form.bank_name} onChange={set("bank_name")} placeholder="e.g. State Bank of India" required />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowForm(false)}>Cancel</Button>
            <Button fullWidth loading={saving} onClick={() => save(form)}>
              {account ? "Update" : "Save"} Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ─── */
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-green-50 text-green-600",
    amber:   "bg-amber-50 text-amber-600",
    danger:  "bg-red-50 text-red-600",
  };
  return (
    <div className="card flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors[color]}`}><Icon size={18} /></span>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </div>
  );
}

function WalletCard({ label, value, isCount }) {
  return (
    <div className="card">
      <p className="flex items-center gap-1 text-xl font-bold text-primary-600">
        {!isCount && <IndianRupee size={16} />}{value}
      </p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
