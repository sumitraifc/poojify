import { useState } from "react";
import { Star, Send } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";
import { submitFeedback } from "../api/feedbackApi";

const CATEGORIES = [
  { label: "Order Experience", value: "order_experience" },
  { label: "Delivery", value: "delivery" },
  { label: "Product Quality", value: "product_quality" },
  { label: "Purohit Booking", value: "purohit_booking" },
  { label: "Payments", value: "payments" },
  { label: "Other", value: "other" },
];

export default function SendFeedback() {
  const [rating, setRating] = useState(0);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(val) {
    setSelected((s) => s.includes(val) ? s.filter((c) => c !== val) : [...s, val]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) return showToast.error("Please select a rating");
    if (!message.trim()) return showToast.error("Please write your feedback");
    setSubmitting(true);
    try {
      const res = await submitFeedback({ rating, categories: selected, message });
      showToast.success(res?.message || "Thank you! Your feedback has been submitted.");
      setRating(0);
      setSelected([]);
      setMessage("");
    } catch (err) {
      showToast.error(err?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="section-y flex justify-center">
        <div className="w-full max-w-lg">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Send Feedback" }]} />
          <div className="card">
            <h1 className="mb-1 text-xl font-bold">Send Feedback</h1>
            <p className="mb-5 text-sm text-ink-500">We'd love to hear your thoughts — it helps us improve Poojify for everyone.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">How was your experience?</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)}>
                      <Star size={28} className={n <= rating ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Categories <span className="text-xs text-ink-500">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleCategory(value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                        selected.includes(value)
                          ? "border-primary-500 bg-primary-50 text-primary-600"
                          : "border-ink-500/15 text-ink-500 hover:border-primary-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Your Feedback</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input" placeholder="Tell us what you loved or what we can do better..." />
              </div>

              <Button type="submit" fullWidth loading={submitting}>
                <Send size={15} /> Submit Feedback
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
