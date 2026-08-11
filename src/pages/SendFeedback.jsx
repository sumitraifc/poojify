import { useState } from "react";
import { Star, Send } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";

const categories = ["App Experience", "Product Quality", "Delivery", "Purohit Booking", "Payments", "Other"];

export default function SendFeedback() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) return showToast.error("Please select a rating");
    if (!message.trim()) return showToast.error("Please write your feedback");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast.success("Thank you! Your feedback has been submitted.");
      setRating(0);
      setCategory("");
      setMessage("");
    }, 800);
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
                <label className="label">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                  <option value="">Select a category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
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
