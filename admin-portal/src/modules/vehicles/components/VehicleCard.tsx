import { Vehicle } from '../../../shared/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const VehicleCard = ({ vehicle, onApprove, onReject }: VehicleCardProps) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h3>
          <p className="text-sm text-gray-600">Agency: {vehicle.agencyName}</p>
        </div>
        {getStatusBadge(vehicle.status)}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Type:</span>
          <span className="ml-2">{vehicle.type}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Seats:</span>
          <span className="ml-2">{vehicle.capacity}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Price/Day:</span>
          <span className="ml-2">PKR {vehicle.pricePerDay.toLocaleString()}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Available:</span>
          <span className="ml-2">{vehicle.isAvailable ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {vehicle.images && vehicle.images.length > 0 && (
        <div className="mb-4">
          <img
            src={vehicle.images[0]}
            alt={vehicle.make}
            className="w-full h-48 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex gap-2">
        {vehicle.status === 'PENDING' && (
          <>
            <button
              onClick={() => onApprove(vehicle.id)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(vehicle.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reject
            </button>
          </>
        )}
        {vehicle.status === 'APPROVED' && (
          <button
            onClick={() => onReject(vehicle.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reject
          </button>
        )}
        {vehicle.status === 'REJECTED' && (
          <button
            onClick={() => onApprove(vehicle.id)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
