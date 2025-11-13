import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

/**
 * ReviewsSection
 * - vehicleId: id of the vehicle to fetch/post reviews for
 *
 * Features:
 * - Fetch reviews with abort on unmount
 * - Show average rating (1 decimal)
 * - Submit review with validation and submission state
 * - Optimistic UI on submit (adds local item then refreshes from server)
 * - Friendly messages / error handling
 * - Accessible form controls
 */

const Star = ({ filled = false }) => (
  <span className={filled ? "text-yellow-50" : "text-neutral-40"} aria-hidden>
    ★
  </span>
);

const ReviewsSection = ({ vehicleId }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const mountedRef = useRef(true);

  // fetch reviews (with abort support)
  const fetchReviews = useCallback(async (signal) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reviews/${vehicleId}`,
        { signal }
      );
      const data = res.data || {};
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setAvgRating(
        typeof data.avgRating === "number" ? Number(data.avgRating) : 0
      );
    } catch (err) {
      if (axios.isCancel(err)) {
        // request canceled — ignore
      } else {
        console.error("Error fetching reviews:", err);
        setErrorMsg("Failed to load reviews. Try again later.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    fetchReviews(controller.signal);

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg("Please select a rating between 1 and 5.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Please add a comment.");
      return;
    }

    const payload = {
      vehicleId,
      name: name?.trim() || "Anonymous",
      rating,
      comment: comment.trim(),
    };

    // Optimistic local update: show pending review while server responds
    const tempReview = {
      _id: `temp-${Date.now()}`,
      name: payload.name,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setSubmitting(true);
    setReviews((prev) => [tempReview, ...prev]);
    setAvgRating((prevAvg) => {
      // quick approximate recalc (not exact) for immediate UI feedback
      const total = prevAvg * (reviews.length || 1) + payload.rating;
      const count = (reviews.length || 0) + 1;
      return Number((total / count).toFixed(1));
    });

    try {
      await axios.post("http://localhost:5000/api/reviews", payload);
      // refresh authoritative list from server
      const controller = new AbortController();
      await fetchReviews(controller.signal);
      setName("");
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Error submitting review:", err);
      setErrorMsg("Failed to submit review. Please try again.");
      // rollback optimistic item
      setReviews((prev) => prev.filter((r) => !String(r._id).startsWith("temp-")));
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // Nice date formatting
  const formatDate = (iso) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <section className="mt-10 border-t border-neutral-90 dark:border-neutral-30 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-20 dark:text-neutral-90">
          ⭐ Reviews & Ratings
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-yellow-50">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-neutral-40">/ 5</span>
          </div>
          <div className="text-sm text-neutral-40">{reviews.length} reviews</div>
        </div>
      </div>

      {/* Status / Error */}
      {errorMsg && (
        <div className="mb-4 text-sm text-red-400 bg-red-10 px-3 py-2 rounded">
          {errorMsg}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-6 text-neutral-40">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-neutral-40">No reviews yet. Be the first to leave one!</div>
      ) : (
        <ul className="space-y-4 mb-6">
          {reviews.map((r) => (
            <li
              key={r._id}
              className="border border-neutral-90 dark:border-neutral-30 rounded-lg p-4 bg-neutral-98 dark:bg-neutral-10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-neutral-20 dark:text-neutral-90">
                      {r.name}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} filled={i < r.rating} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-40 dark:text-neutral-70 mt-2 whitespace-pre-line">
                    {r.comment}
                  </p>
                </div>

                <div className="text-xs text-neutral-40 dark:text-neutral-70 text-right">
                  <div>{formatDate(r.createdAt)}</div>
                  {r.pending && <div className="text-xs italic text-neutral-40 mt-1">Sending…</div>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Review Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 bg-neutral-95 dark:bg-neutral-20 rounded-lg p-4 border border-neutral-90 dark:border-neutral-30"
        aria-label="Add review form"
      >
        <h3 className="text-lg font-semibold mb-3 text-neutral-20 dark:text-neutral-90">
          Leave a Review
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-1 md:col-span-1 border rounded-lg px-3 py-2 dark:bg-neutral-10 dark:border-neutral-30"
            aria-label="Your name"
            disabled={submitting}
          />

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="col-span-1 md:col-span-1 border rounded-lg px-3 py-2 dark:bg-neutral-10 dark:border-neutral-30"
            aria-label="Rating"
            disabled={submitting}
            required
          >
            <option value={0}>Select rating</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} ★
              </option>
            ))}
          </select>

          <div className="col-span-1 md:col-span-1 flex items-center justify-end">
            <div className="text-sm text-neutral-40">Avg: <span className="font-semibold text-yellow-50">{avgRating.toFixed(1)}</span></div>
          </div>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="col-span-1 md:col-span-3 border rounded-lg px-3 py-2 h-28 resize-none dark:bg-neutral-10 dark:border-neutral-30"
            aria-label="Review comment"
            disabled={submitting}
            required
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition
              ${submitting ? "bg-blue-40/70 cursor-not-allowed" : "bg-blue-60 hover:bg-blue-70"} text-white
            `}
            aria-disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>

          <button
            type="button"
            onClick={() => {
              setName("");
              setRating(0);
              setComment("");
              setErrorMsg("");
            }}
            className="px-3 py-2 rounded-lg border border-neutral-90 dark:border-neutral-30 text-sm"
            disabled={submitting}
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
};

export default ReviewsSection;
