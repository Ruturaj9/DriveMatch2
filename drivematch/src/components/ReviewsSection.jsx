// src/components/ReviewsSection.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

/* ----------------------------------------------------------
   ⭐ THEME-COMPAT STAR COMPONENT (FOR DISPLAY)
----------------------------------------------------------- */
const StaticStar = ({ filled }) => (
  <span
    className={
      filled
        ? "text-yellow-400 drop-shadow-sm"
        : "text-[var(--color-text)]/35"
    }
  >
    ★
  </span>
);

/* ----------------------------------------------------------
   ✨ ANIMATED STAR SELECTOR (FOR INPUT)
----------------------------------------------------------- */
const StarSelector = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 text-2xl select-none">
      {[1, 2, 3, 4, 5].map((num) => {
        const active = hover >= num || rating >= num;
        return (
          <span
            key={num}
            className={`
              cursor-pointer transition transform
              ${active ? "text-yellow-400 scale-110" : "text-[var(--color-text)]/40 scale-100"}
            `}
            onMouseEnter={() => setHover(num)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(num)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

/* ----------------------------------------------------------
   🎤 VOICE-TO-TEXT HOOK
----------------------------------------------------------- */
const useSpeechInput = (setValue) => {
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setValue((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => alert("Voice input error. Try again.");

    recognition.start();
    recognitionRef.current = recognition;
  };

  return startListening;
};

/* ----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */
const ReviewsSection = ({ vehicleId }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [sortType, setSortType] = useState("newest");

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const startVoiceInput = useSpeechInput(setComment);

  const mountedRef = useRef(true);

  /* ----------------------------------------------------------
       Fetch Reviews
  ----------------------------------------------------------- */
  const fetchReviews = useCallback(
    async (signal) => {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reviews/${vehicleId}`,
          { signal }
        );

        const data = res.data || {};
        const list = Array.isArray(data.reviews) ? data.reviews : [];

        setReviews(list);
        setAvgRating(Number(data.avgRating || 0));
      } catch (err) {
        if (!axios.isCancel(err)) {
          setErrorMsg("Unable to load reviews.");
        }
      } finally {
        mountedRef.current && setLoading(false);
      }
    },
    [vehicleId]
  );

  useEffect(() => {
    mountedRef.current = true;

    const controller = new AbortController();
    fetchReviews(controller.signal);

    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, [fetchReviews]);

  /* ----------------------------------------------------------
      Sorting
  ----------------------------------------------------------- */
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortType === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortType === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortType === "highest") return b.rating - a.rating;
    if (sortType === "lowest") return a.rating - b.rating;
    return 0;
  });

  /* ----------------------------------------------------------
      Pinned Review (highest-rated)
  ----------------------------------------------------------- */
  const pinnedReview =
    reviews.length > 0 ? reviews.reduce((max, r) => (r.rating > max.rating ? r : max)) : null;

  /* ----------------------------------------------------------
      Submit Review
  ----------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (rating < 1) {
      setErrorMsg("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Please write a comment.");
      return;
    }

    const payload = {
      vehicleId,
      name: name.trim() || "Anonymous",
      rating,
      comment: comment.trim(),
    };

    const temp = {
      _id: `temp-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setReviews((prev) => [temp, ...prev]);
    setSubmitting(true);

    try {
      await axios.post("http://localhost:5000/api/reviews", payload);

      const controller = new AbortController();
      await fetchReviews(controller.signal);

      setName("");
      setRating(0);
      setComment("");
    } catch {
      setErrorMsg("Failed to submit review.");
      setReviews((prev) => prev.filter((r) => !String(r._id).startsWith("temp-")));
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------------------------------------
      UI
  ----------------------------------------------------------- */

  const Skeleton = () => (
    <div className="h-20 rounded-xl animate-pulse bg-[var(--color-text)]/15 dark:bg-[var(--color-text)]/25" />
  );

  const formatDate = (iso) =>
    new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(iso));

  return (
    <section className="mt-14 border-t border-[var(--color-text)]/20 pt-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">
          ⭐ Reviews & Ratings
        </h2>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-yellow-400">{avgRating.toFixed(1)}</span>
          <span className="text-[var(--color-text)]/60 text-sm">{reviews.length} reviews</span>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="
              px-3 py-2 rounded-lg border bg-[var(--color-bg)] 
              border-[var(--color-text)]/25 text-[var(--color-text)]
            "
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 my-6">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      )}

      {/* Pinned Review */}
      {!loading && pinnedReview && (
        <div
          className="
            mb-8 p-5 rounded-xl border shadow-lg
            bg-[var(--color-bg)]/50 backdrop-blur
            border-yellow-400/40
          "
        >
          <h3 className="text-lg font-bold text-yellow-500 mb-2">📌 Top Review</h3>

          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{pinnedReview.name}</p>
              <div className="flex text-xl">
                {[...Array(5)].map((_, i) => (
                  <StaticStar key={i} filled={i < pinnedReview.rating} />
                ))}
              </div>
              <p className="text-sm mt-2">{pinnedReview.comment}</p>
            </div>
            <span className="text-xs opacity-70">{formatDate(pinnedReview.createdAt)}</span>
          </div>
        </div>
      )}

      {/* Reviews */}
      {sortedReviews.length > 0 && !loading ? (
        <ul className="space-y-4">
          {sortedReviews.map((r) =>
            pinnedReview && r._id === pinnedReview._id ? null : (
              <li
                key={r._id}
                className="
                  p-4 rounded-xl bg-[var(--color-bg)]/40 border
                  border-[var(--color-text)]/20 shadow-sm hover:shadow-md
                "
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <div className="flex text-xl">
                      {[...Array(5)].map((_, i) => (
                        <StaticStar key={i} filled={i < r.rating} />
                      ))}
                    </div>
                    <p className="text-sm mt-2">{r.comment}</p>
                  </div>

                  <div className="text-xs opacity-60">
                    {formatDate(r.createdAt)}
                    {r.pending && <div className="italic">Sending…</div>}
                  </div>
                </div>
              </li>
            )
          )}
        </ul>
      ) : null}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="
          mt-12 p-6 rounded-xl border shadow-lg
          bg-[var(--color-bg)]/50 backdrop-blur
          border-[var(--color-text)]/20
        "
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-text)]">
          Leave a Review
        </h3>

        {errorMsg && (
          <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-4">

          <input
            type="text"
            value={name}
            placeholder="Your name (optional)"
            onChange={(e) => setName(e.target.value)}
            className="
              px-3 py-2 rounded-lg bg-[var(--color-bg)]
              border border-[var(--color-text)]/25 text-[var(--color-text)]
              placeholder-[color:var(--color-text)/50]
            "
          />

          {/* Animated Stars */}
          <div className="flex flex-col">
            <span className="text-sm mb-1 opacity-75">Your Rating</span>
            <StarSelector rating={rating} setRating={setRating} />
          </div>

          <div className="flex justify-end items-center">
            <button
              type="button"
              onClick={startVoiceInput}
              className="
                px-3 py-2 rounded-lg text-white font-medium
                bg-blue-600 hover:bg-blue-700 transition
                shadow
              "
            >
              🎤 Speak
            </button>
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            placeholder="Write your review..."
            onChange={(e) => setComment(e.target.value)}
            className="
              md:col-span-3 h-28 resize-none rounded-lg px-3 py-2
              bg-[var(--color-bg)] border border-[var(--color-text)]/25 
              text-[var(--color-text)]
              placeholder-[color:var(--color-text)/50]
            "
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="
            px-4 py-2 rounded-lg text-white font-medium
            bg-blue-600 hover:bg-blue-700 transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </section>
  );
};

export default ReviewsSection;
