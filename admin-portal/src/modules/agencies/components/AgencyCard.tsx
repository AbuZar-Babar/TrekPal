import { useState } from 'react';
import { Agency } from '../../../shared/types';

interface AgencyCardProps {
  agency: Agency;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const AgencyCard = ({ agency, onApprove, onReject, onDelete }: AgencyCardProps) => {
  const isPending = agency.status === 'PENDING';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const statusBadge = {
    PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border border-red-200',
  }[agency.status] || 'bg-gray-100 text-gray-800';

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(agency.id);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete agency. Make sure the backend server is running.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-lg">
                  {agency.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{agency.name}</h3>
                <p className="text-sm text-gray-500">{agency.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge}`}>
                {agency.status}
              </span>
              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                title="Delete agency"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Agency Info */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {agency.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {agency.phone}
              </div>
            )}
            {agency.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {agency.address}
              </div>
            )}
            {agency.license && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                License: {agency.license}
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(agency.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* KYC Documents Section */}
          {(agency.ownerName || agency.cnic || agency.cnicImageUrl || agency.ownerPhotoUrl) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                KYC Verification
              </h4>
              <div className="space-y-2 text-sm mb-3">
                {agency.ownerName && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Owner Name</span>
                    <span className="font-medium text-gray-800">{agency.ownerName}</span>
                  </div>
                )}
                {agency.cnic && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">CNIC</span>
                    <span className="font-mono text-gray-800 tracking-wider">{agency.cnic}</span>
                  </div>
                )}
              </div>

              {/* Document Images */}
              {(agency.cnicImageUrl || agency.ownerPhotoUrl) && (
                <div className="flex gap-3">
                  {agency.cnicImageUrl && (
                    <a
                      href={agency.cnicImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block"
                    >
                      <img
                        src={agency.cnicImageUrl}
                        alt="CNIC Document"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-colors shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                        <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                      <span className="block text-xs text-gray-500 text-center mt-1">CNIC</span>
                    </a>
                  )}
                  {agency.ownerPhotoUrl && (
                    <a
                      href={agency.ownerPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block"
                    >
                      <img
                        src={agency.ownerPhotoUrl}
                        alt="Owner Photo"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-colors shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                        <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                      <span className="block text-xs text-gray-500 text-center mt-1">Photo</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions - only for pending agencies */}
          {isPending && (
            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => onApprove(agency.id)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => onReject(agency.id)}
                className="flex-1 px-4 py-2.5 bg-white text-red-600 text-sm font-semibold rounded-lg border-2 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-modalIn">
            {/* Warning icon */}
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              Delete Agency
            </h3>
            <p className="text-sm text-gray-500 text-center mb-2">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-gray-700">{agency.name}</span>?
            </p>
            <p className="text-xs text-red-500 text-center mb-4 bg-red-50 rounded-lg py-2 px-3">
              ⚠ This will also delete all hotels, vehicles, and bookings associated with this agency. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Modal animation */}
          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-modalIn { animation: modalIn 0.2s ease-out; }
          `}</style>
        </div>
      )}
    </>
  );
};

export default AgencyCard;
