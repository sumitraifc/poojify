import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Wallet, RotateCcw } from "lucide-react";
import Logo from "../../components/layout/Logo";
import Button from "../../components/common/Button";
import Drawer from "../../components/common/Drawer";
import { useAuthStore } from "../../store/authStore";
import { showToast } from "../../components/common/Toast";

export default function LoginDrawer({ open, onClose }) {
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  function reset() {
    setStep("mobile");
    setMobile("");
    setOtp(new Array(6).fill(""));
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSendOtp(e) {
    e.preventDefault();
    if (mobile.length !== 10) return showToast.error("Enter a valid 10-digit mobile number");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      showToast.success("OTP sent successfully");
    }, 700);
  }

  function handleOtpChange(value, idx) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function handleVerify() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({ name: "Priya Sharma", phone: `+91 ${mobile}` }, "demo-jwt-token");
      showToast.success("Logged in successfully");
      handleClose();
    }, 700);
  }

  return (
    <Drawer open={open} onClose={handleClose}>
      <div className="p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size="lg" />
          <AnimatePresence mode="wait">
            {step === "mobile" ? (
              <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
                <h1 className="text-lg font-bold">Welcome to Poojify!</h1>
                <p className="mt-1 text-sm text-ink-500">Login to continue shopping and explore amazing pooja essentials.</p>
              </motion.div>
            ) : (
              <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
                <h1 className="text-lg font-bold">Verify Your Mobile Number</h1>
                <p className="mt-1 text-sm text-ink-500">
                  Enter the 6-digit OTP sent to <span className="font-semibold text-ink-900">+91 {mobile}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {step === "mobile" ? (
            <motion.form key="mf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSendOtp}>
              <label className="label">Mobile Number</label>
              <div className="flex overflow-hidden rounded-lg border border-ink-500/15 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
                <span className="flex items-center bg-cream-100 px-3 text-sm font-medium text-ink-700">+91</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter mobile number"
                  className="w-full px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <Button type="submit" fullWidth loading={loading} className="mt-5">Send OTP</Button>
            </motion.form>
          ) : (
            <motion.div key="of" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep("mobile")} className="mb-3 flex items-center gap-1 text-sm text-ink-500 hover:text-primary-600">
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-11 rounded-lg border border-ink-500/15 text-center text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1 text-xs text-primary-600">
                <RotateCcw size={12} /> Resend OTP in 00:45
              </button>
              <Button fullWidth loading={loading} className="mt-5" onClick={handleVerify}>Verify & Continue</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-5 text-center text-xs text-ink-500">
          By continuing, you agree to our <a className="link">Terms & Conditions</a> & <a className="link">Privacy Policy</a>
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-ink-500/10 pt-5 text-center text-[11px] text-ink-500">
          <span className="flex flex-col items-center gap-1"><ShieldCheck size={16} className="text-primary-500" /> 100% Authentic</span>
          <span className="flex flex-col items-center gap-1"><Wallet size={16} className="text-primary-500" /> Secure Payments</span>
          <span className="flex flex-col items-center gap-1"><RotateCcw size={16} className="text-primary-500" /> Easy Returns</span>
        </div>
      </div>
    </Drawer>
  );
}
