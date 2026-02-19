import { Hotel } from '../../../shared/types';

interface HotelCardProps {
  hotel: Hotel;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const HotelCard = ({ hotel, onApprove, onReject }: HotelCardProps) => {
  const isPending = hotel.status === 'PENDING';

  const statusBadge = {
    PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border border-red-200',
  }[hotel.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            {hotel.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="text-base font-bold text-gray-900 truncate">{hotel.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge}`}>
                {hotel.status}
              </span>
            </div>

            {/* Agency */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              <span>{hotel.agencyName}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              {hotel.rating && (
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-600 font-medium">{hotel.rating}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>{hotel.roomsCount || 0} rooms</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(hotel.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            {hotel.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{hotel.description}</p>
            )}

            {/* Amenities */}
            {hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hotel.amenities.slice(0, 5).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[11px] bg-gray-50 text-gray-600 rounded-lg border border-gray-100 font-medium"
                  >
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 5 && (
                  <span className="px-2 py-0.5 text-[11px] bg-gray-50 text-gray-400 rounded-lg border border-gray-100">
                    +{hotel.amenities.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex gap-2 ml-4 flex-shrink-0">
            <button
              onClick={() => onApprove(hotel.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-sm transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              onClick={() => onReject(hotel.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 shadow-sm transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelCard;
