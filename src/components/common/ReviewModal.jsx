import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Star, X, ImagePlus } from "lucide-react";
import Button from "./Button";
import { submitReview } from "../../api/reviewApi";
import { showToast } from "./Toast";

export default function ReviewModal({ order_id, item, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]);
  const fileRef = useRef();

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("order_id", String(order_id));
      fd.append("rating", String(rating));
      fd.append("review_text", reviewText);
      images.forEach((f) => fd.append("images", f));
      return submitReview(fd);
    },
    onSuccess: (res) => {
      showToast.success(res?.message || "Review submitted!");
      onSuccess?.();
    },
    onError: (err) => showToast.error(err?.message || "Failed to submit review"),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return showToast.error("Please select a rating");
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">Write a Review</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-cream-100"><X size={18} /></button>
        </div>

        <div className="mb-3 flex items-center gap-3">
          {item.main_image && <img src={item.main_image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />}
          <p className="text-sm font-medium line-clamp-2">{item.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-1 text-xs text-ink-500">Rating *</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={26} className={n <= rating ? "fill-primary-500 text-primary-500" : "text-ink-500/20"} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="input"
            rows={3}
            placeholder="Share your experience (optional)"
          />

          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-ink-500/30 px-3 py-2 text-sm text-ink-500 hover:border-primary-400 hover:text-primary-600"
            >
              <ImagePlus size={16} /> Add Photos ({images.length}/5)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files).slice(0, 5 - images.length);
                setImages((prev) => [...prev, ...files].slice(0, 5));
              }}
            />
            {images.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {images.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} className="h-14 w-14 rounded-lg object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth loading={mutation.isPending}>Submit Review</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
