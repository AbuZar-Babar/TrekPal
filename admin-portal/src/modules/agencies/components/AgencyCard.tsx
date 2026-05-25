import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Agency } from '../../../shared/types';
import {
  PortalListItemTransition,
  PortalModalTransition,
} from '../../../shared/components/motion/portalMotion';

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
    className="group overflow-hidden rounded-[16px] border border-gray-200 transition-all hover:border-indigo-300 hover:bg-indigo-50/40"
  >
    {urlLooksLikeImage(url) ? (
      <img src={url} alt={label} className="h-24 w-full object-cover" />
    ) : (
      <div className="flex h-24 items-center justify-center bg-gray-50 text-gray-500">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V8l-6-6H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 3v5h5" />
        </svg>
      </div>
    )}
    <div className="px-3 py-2">
      <div className="text-xs font-semibold text-gray-800">{label}</div>
      <div className="mt-1 text-[11px] text-indigo-600 group-hover:underline">Open document</div>
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
      <PortalListItemTransition className="overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                <span className="text-lg font-bold text-white">
                  {agency.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
                <p className="text-sm text-gray-500">{agency.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                {agency.status}
              </span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-[12px] p-1.5 text-gray-300 transition-all hover:bg-red-50 hover:text-red-500"
                title="Delete agency"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-6 text-sm md:grid-cols-2">
            <div className="rounded-[16px] border border-gray-100 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Business Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between gap-4"><span className="text-gray-500">Jurisdiction</span><span className="font-medium text-gray-800">{agency.jurisdiction || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Legal Entity</span><span className="font-medium text-gray-800">{formatLegalEntityType(agency.legalEntityType)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Tourism License</span><span className="font-medium text-gray-800">{agency.license || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">NTN</span><span className="font-medium text-gray-800">{agency.ntn || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Office City</span><span className="font-medium text-gray-800">{agency.officeCity || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Capital</span><span className="font-medium text-gray-800">{agency.capitalAvailablePkr ? currencyFormatter.format(agency.capitalAvailablePkr) : 'Not provided'}</span></div>
              </div>
            </div>

            <div className="rounded-[16px] border border-gray-100 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Representative</h4>
              <div className="space-y-2">
                <div className="flex justify-between gap-4"><span className="text-gray-500">Name</span><span className="font-medium text-gray-800">{agency.ownerName || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">CNIC</span><span className="font-mono font-medium text-gray-800">{agency.cnic || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-800">{agency.phone || 'Not provided'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-500">Submitted</span><span className="font-medium text-gray-800">{new Date(agency.applicationSubmittedAt || agency.createdAt).toLocaleDateString()}</span></div>
                {agency.secpRegistrationNumber ? (
                  <div className="flex justify-between gap-4"><span className="text-gray-500">SECP Registration</span><span className="font-medium text-gray-800">{agency.secpRegistrationNumber}</span></div>
                ) : null}
                {agency.partnershipRegistrationNumber ? (
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Partnership Registration</span><span className="font-medium text-gray-800">{agency.partnershipRegistrationNumber}</span></div>
                ) : null}
              </div>
            </div>
          </div>

          {(agency.address || agency.fieldOfOperations.length > 0) ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">Operational Details</h4>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <div className="mb-1 text-gray-500">Office Address</div>
                  <div className="font-medium text-gray-800">{agency.address || 'Not provided'}</div>
                </div>
                <div>
                  <div className="mb-1 text-gray-500">Field of Operations</div>
                  <div className="flex flex-wrap gap-2">
                    {agency.fieldOfOperations.length > 0 ? (
                      agency.fieldOfOperations.map((item) => (
                        <span key={item} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="font-medium text-gray-800">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {documentEntries.length > 0 ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">Application Documents</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {documentEntries.map((document) => (
                  <DocumentCard key={document.label} label={document.label} url={document.url} />
                ))}
              </div>
            </div>
          ) : null}

          {isPending ? (
            <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => onApprove(agency.id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => onReject(agency.id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          ) : null}
        </div>
      </PortalListItemTransition>

      <AnimatePresence>
        {showDeleteConfirm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !deleting && setShowDeleteConfirm(false)}
            />
            <PortalModalTransition className="relative mx-4 w-full max-w-sm rounded-[18px] bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="mb-1 text-center text-lg font-bold text-gray-900">
                Delete Agency
              </h3>
              <p className="mb-2 text-center text-sm text-gray-500">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-gray-700">{agency.name}</span>?
              </p>
              <p className="mb-4 rounded-[14px] bg-red-50 px-3 py-2 text-center text-xs text-red-500">
                Warning: this also removes the agency&apos;s hotels, vehicles, and bookings. This action cannot be undone.
              </p>

              {deleteError ? (
                <div className="mb-4 flex items-center gap-2 rounded-[14px] border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {deleteError}
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 rounded-[14px] bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-md disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </PortalModalTransition>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default AgencyCard;
