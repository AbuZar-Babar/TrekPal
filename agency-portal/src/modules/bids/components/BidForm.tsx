import { FormEvent, useState } from 'react';
import { TripRequest } from '../../../shared/types';

interface BidFormProps {
  tripRequest: TripRequest;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (payload: { price: number; description?: string }) => Promise<void>;
}

const BidForm = ({ tripRequest, loading, onCancel, onSubmit }: BidFormProps) => {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Enter a valid bid amount.');
      return;
    }

    setError(null);
    await onSubmit({
      price: numericPrice,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit Bid</h2>
            <p className="mt-1 text-sm text-gray-500">
              {tripRequest.destination} from{' '}
              {new Date(tripRequest.startDate).toLocaleDateString()} to{' '}
              {new Date(tripRequest.endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Travelers</div>
              <div className="mt-1 font-semibold text-gray-900">{tripRequest.travelers}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Budget</div>
              <div className="mt-1 font-semibold text-gray-900">
                {tripRequest.budget ? `PKR ${tripRequest.budget.toLocaleString()}` : 'Open'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Current Bids</div>
              <div className="mt-1 font-semibold text-gray-900">{tripRequest.bidsCount}</div>
            </div>
          </div>

          {tripRequest.description && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              {tripRequest.description}
            </div>
          )}

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-semibold text-gray-700">
              Bid Amount (PKR)
            </label>
            <input
              id="price"
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Enter your total offer"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
              Offer Details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Summarize transport, accommodation, inclusions, or itinerary notes."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidForm;
