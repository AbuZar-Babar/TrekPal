import { useEffect, useState } from 'react';
import apiClient from '../../../shared/services/apiClient';

interface Review {
  id: string;
  userId: string;
  bookingId: string;
  hotelId: string | null;
  rating: number;
  comment: string | null;
  userName: string | null;
  destination: string | null;
  createdAt: string;
  updatedAt: string;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sz = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : 'none'}
          stroke={i <= rating ? '#f59e0b' : 'currentColor'} strokeWidth={1.5}
          className={`${sz} ${i > rating ? 'text-[var(--border-strong)]' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
};

const ratingLabel = (r: number) =>
  ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Amazing'][r] ?? '';

const ReviewsList = () => {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/reviews/agency', { params: { page, limit } })
      .then((r) => {
        const d = r.data.data;
        setReviews(d.reviews);
        setTotal(d.total);
      })
      .catch((e: any) => setError(e?.response?.data?.message || 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Reviews</h1>
        <p className="mt-0.5 text-sm text-[var(--text-soft)]">
          Traveler ratings and feedback on your trips
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Total reviews</div>
          <div className="mt-1 text-lg font-semibold text-[var(--text)]">{total}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Average rating</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--text)]">{avgRating ?? '—'}</span>
            {avgRating && <StarRating rating={Math.round(Number(avgRating))} size="sm" />}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">5-star trips</div>
          <div className="mt-1 text-lg font-semibold text-[var(--primary)]">
            {reviews.filter((r) => r.rating === 5).length}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No reviews yet — completed trips will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
                    {(review.userName ?? 'T').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">
                      {review.userName ?? 'Traveler'}
                    </div>
                    {review.destination && (
                      <div className="text-xs text-[var(--text-soft)]">{review.destination}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-[10px] font-semibold text-amber-600">
                    {ratingLabel(review.rating)}
                  </span>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  "{review.comment}"
                </p>
              )}

              {/* Date */}
              <p className="mt-2 text-[10px] text-[var(--text-soft)]">
                {new Date(review.createdAt).toLocaleDateString('en-PK', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-xs text-[var(--text-soft)]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
