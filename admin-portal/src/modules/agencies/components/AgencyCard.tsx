import { Agency } from '../../../shared/types';

interface AgencyCardProps {
  agency: Agency;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AgencyCard = ({ agency, onApprove, onReject }: AgencyCardProps) => {
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
            <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                agency.status
              )}`}
            >
              {agency.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{agency.email}</p>
          {agency.phone && <p className="text-sm text-gray-600 mb-2">Phone: {agency.phone}</p>}
          {agency.address && (
            <p className="text-sm text-gray-600 mb-2">Address: {agency.address}</p>
          )}
          {agency.license && (
            <p className="text-sm text-gray-600 mb-2">License: {agency.license}</p>
          )}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Hotels: {agency.hotelsCount || 0}</span>
            <span>Vehicles: {agency.vehiclesCount || 0}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Created: {new Date(agency.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {agency.status === 'PENDING' && (
            <>
              <button
                onClick={() => onApprove(agency.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(agency.id)}
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

export default AgencyCard;
