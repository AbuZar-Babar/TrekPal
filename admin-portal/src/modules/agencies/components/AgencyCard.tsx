import { useState } from 'react';
import { Agency } from '../../../shared/types';

interface AgencyCardProps {
  agency: Agency;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

const formatLegalEntityType = (value: Agency['legalEntityType']) => {
  if (!value) {
    return 'Not provided';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const urlLooksLikeImage = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].some((extension) => cleanUrl.endsWith(extension));
};

const DocumentCard = ({ label, url }: { label: string; url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all overflow-hidden"
  >
    {urlLooksLikeImage(url) ? (
      <img src={url} alt={label} className="w-full h-24 object-cover" />
    ) : (
      <div className="h-24 flex items-center justify-center bg-gray-50 text-gray-500">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V8l-6-6H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 3v5h5" />
        </svg>
      </div>
    )}
    <div className="px-3 py-2">
      <div className="text-xs font-semibold text-gray-800">{label}</div>
      <div className="text-[11px] text-indigo-600 mt-1 group-hover:underline">Open document</div>
    </div>
  </a>
);

const AgencyCard = ({ agency, onApprove, onReject, onDelete }: AgencyCardProps) => {
  const isPending = agency.status === 'PENDING';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const documentEntries = [
    { label: 'CNIC Image', url: agency.cnicImageUrl },
    { label: 'Owner Photo', url: agency.ownerPhotoUrl },
    { label: 'Tourism License Certificate', url: agency.licenseCertificateUrl },
    { label: 'NTN Certificate', url: agency.ntnCertificateUrl },
    { label: 'Business Registration Proof', url: agency.businessRegistrationProofUrl },
    { label: 'Office Proof', url: agency.officeProofUrl },
    { label: 'Bank Certificate', url: agency.bankCertificateUrl },
    { label: 'Additional Supporting Document', url: agency.additionalSupportingDocumentUrl },
  ].filter((entry): entry is { label: string; url: string } => !!entry.url);

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

          <div className="grid md:grid-cols-2 gap-6 text-sm mb-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Business Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between gap-4"><span className="text-gray-500">Jurisdiction</span><span className="font-medium text-gray-800">{agency.jurisdiction || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Legal Entity</span><span className="font-medium text-gray-800">{formatLegalEntityType(agency.legalEntityType)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Tourism License</span><span className="font-medium text-gray-800">{agency.license || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">NTN</span><span className="font-medium text-gray-800">{agency.ntn || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Office City</span><span className="font-medium text-gray-800">{agency.officeCity || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Capital</span><span className="font-medium text-gray-800">{agency.capitalAvailablePkr ? currencyFormatter.format(agency.capitalAvailablePkr) : 'Not provided'}</span></div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Representative</h4>
              <div className="space-y-2">
                <div className="flex justify-between gap-4"><span className="text-gray-500">Name</span><span className="font-medium text-gray-800">{agency.ownerName || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">CNIC</span><span className="font-medium text-gray-800 font-mono">{agency.cnic || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-800">{agency.phone || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Submitted</span><span className="font-medium text-gray-800">{new Date(agency.applicationSubmittedAt || agency.createdAt).toLocaleDateString()}</span></div>
                {agency.secpRegistrationNumber && (
                  <div className="flex justify-between gap-4"><span className="text-gray-500">SECP Registration</span><span className="font-medium text-gray-800">{agency.secpRegistrationNumber}</span></div>
                )}
                {agency.partnershipRegistrationNumber && (
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Partnership Registration</span><span className="font-medium text-gray-800">{agency.partnershipRegistrationNumber}</span></div>
                )}
              </div>
            </div>
          </div>

          {(agency.address || agency.fieldOfOperations.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Operational Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Office Address</div>
                  <div className="text-gray-800 font-medium">{agency.address || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Field of Operations</div>
                  <div className="flex flex-wrap gap-2">
                    {agency.fieldOfOperations.length > 0 ? agency.fieldOfOperations.map((item) => (
                      <span key={item} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {item}
                      </span>
                    )) : <span className="text-gray-800 font-medium">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {documentEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Application Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {documentEntries.map((document) => (
                  <DocumentCard key={document.label} label={document.label} url={document.url} />
                ))}
              </div>
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
