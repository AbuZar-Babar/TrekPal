import { Hotel } from '../../../shared/types';

interface HotelCardProps {
  hotel: Hotel;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const HotelCard = ({ hotel, onApprove, onReject }: HotelCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                hotel.status
              )}`}
            >
              {hotel.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Agency: {hotel.agencyName}</p>
          <p className="text-sm text-gray-600 mb-2">
            {hotel.address}, {hotel.city}, {hotel.country}
          </p>
          {hotel.rating && (
            <p className="text-sm text-gray-600 mb-2">Rating: {hotel.rating} ⭐</p>
          )}
          {hotel.description && (
            <p className="text-sm text-gray-600 mb-2">{hotel.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            {hotel.amenities.slice(0, 5).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {amenity}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Rooms: {hotel.roomsCount || 0} | Created:{' '}
            {new Date(hotel.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {hotel.status === 'PENDING' && (
            <>
              <button
                onClick={() => onApprove(hotel.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(hotel.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
