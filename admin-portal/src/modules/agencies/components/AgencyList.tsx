import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import EntityEditModal from '../../../shared/components/management/EntityEditModal';
import DocumentGrid from '../../../shared/components/management/DocumentGrid';
import ManagementPageShell from '../../../shared/components/management/ManagementPageShell';
import { RootState, AppDispatch } from '../../../store';
import { extractErrorMessage } from '../../../shared/utils/errors';
import { formatCurrency, formatDate, toTitleCase } from '../../../shared/utils/formatters';
import {
  approveAgency,
  fetchAgencies,
  rejectAgency,
  updateAgency,
} from '../store/agencySlice';

const statusClassMap: Record<string, string> = {
  PENDING: 'sovereign-pill sovereign-pill-warning',
  APPROVED: 'sovereign-pill sovereign-pill-success',
  REJECTED: 'sovereign-pill sovereign-pill-danger',
};

const editableFields = [
  { name: 'name', label: 'Agency name' },
  { name: 'email', label: 'Email', type: 'email' as const },
  { name: 'phone', label: 'Phone', type: 'tel' as const },
  { name: 'address', label: 'Address', type: 'textarea' as const },
  { name: 'officeCity', label: 'Office city' },
  { name: 'jurisdiction', label: 'Jurisdiction' },
  { name: 'ownerName', label: 'Owner name' },
];

const AgencyList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const { agencies, loading, error, pagination } = useSelector(
    (state: RootState) => state.agencies,
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const refreshAgencies = async () => {
    await dispatch(
      fetchAgencies({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
    );
  };

  useEffect(() => {
    void refreshAgencies();
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (agencies.length === 0) {
      setSelectedAgencyId(null);
      return;
    }

    if (!selectedAgencyId || !agencies.some((agency) => agency.id === selectedAgencyId)) {
      setSelectedAgencyId(agencies[0].id);
    }
  }, [agencies, selectedAgencyId]);

  const selectedAgency = agencies.find((agency) => agency.id === selectedAgencyId) ?? null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const tabCounts = useMemo(() => {
    const counts = { ALL: pagination.total, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    agencies.forEach((agency) => {
      counts[agency.status as 'PENDING' | 'APPROVED' | 'REJECTED'] += 1;
    });
    return counts;
  }, [agencies, pagination.total]);

  const documentEntries = selectedAgency
    ? [
        { label: 'CNIC', url: selectedAgency.cnicImageUrl },
        { label: 'Owner photo', url: selectedAgency.ownerPhotoUrl },
        { label: 'License', url: selectedAgency.licenseCertificateUrl },
        { label: 'NTN', url: selectedAgency.ntnCertificateUrl },
        { label: 'Registration', url: selectedAgency.businessRegistrationProofUrl },
        { label: 'Office proof', url: selectedAgency.officeProofUrl },
        { label: 'Bank certificate', url: selectedAgency.bankCertificateUrl },
        { label: 'Other', url: selectedAgency.additionalSupportingDocumentUrl },
      ].filter((entry): entry is { label: string; url: string } => Boolean(entry.url))
    : [];

  const openEditModal = () => {
    if (!selectedAgency) {
      return;
    }

    setFormError(null);
    setEditValues({
      name: selectedAgency.name,
      email: selectedAgency.email,
      phone: selectedAgency.phone || '',
      address: selectedAgency.address || '',
      officeCity: selectedAgency.officeCity || '',
      jurisdiction: selectedAgency.jurisdiction || '',
      ownerName: selectedAgency.ownerName || '',
    });
    setIsEditOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedAgency) {
      return;
    }

    setFormError(null);
    try {
      await dispatch(approveAgency({ id: selectedAgency.id })).unwrap();
      await refreshAgencies();
    } catch (actionError) {
      setFormError(extractErrorMessage(actionError, 'Failed to approve agency'));
    }
  };

  const handleReject = async () => {
    if (!selectedAgency) {
      return;
    }

    setFormError(null);
    try {
      await dispatch(rejectAgency({ id: selectedAgency.id })).unwrap();
      await refreshAgencies();
    } catch (actionError) {
      setFormError(extractErrorMessage(actionError, 'Failed to reject agency'));
    }
  };

  const handleSave = async () => {
    if (!selectedAgency) {
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await dispatch(
        updateAgency({
          id: selectedAgency.id,
          payload: {
            name: editValues.name?.trim(),
            email: editValues.email?.trim(),
            phone: editValues.phone?.trim() || null,
            address: editValues.address?.trim() || null,
            officeCity: editValues.officeCity?.trim() || null,
            jurisdiction: editValues.jurisdiction?.trim() || null,
            ownerName: editValues.ownerName?.trim() || null,
          },
        }),
      ).unwrap();
      await refreshAgencies();
      setIsEditOpen(false);
    } catch (actionError) {
      setFormError(extractErrorMessage(actionError, 'Failed to update agency'));
    } finally {
      setIsSaving(false);
    }
  };

  const filters = (
    <div className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
      {[
        { value: '', label: 'All', count: tabCounts.ALL },
        { value: 'PENDING', label: 'Pending', count: tabCounts.PENDING },
        { value: 'APPROVED', label: 'Approved', count: tabCounts.APPROVED },
        { value: 'REJECTED', label: 'Rejected', count: tabCounts.REJECTED },
      ].map((tab) => {
        const active = statusFilter === tab.value;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              const nextParams = new URLSearchParams(searchParams);
              if (tab.value) {
                nextParams.set('status', tab.value);
              } else {
                nextParams.delete('status');
              }
              setSearchParams(nextParams);
            }}
            className={`sovereign-tab ${active ? 'sovereign-tab-active' : 'sovereign-tab-idle'}`}
          >
            {tab.label}
            <span className="rounded-full bg-[var(--surface-high)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );

  const list = (
    <div className="space-y-5">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search agencies..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="sovereign-input pl-11"
        />
      </div>

      {loading && agencies.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
        </div>
      ) : error ? (
        <div className="sovereign-panel p-8 text-center">
          <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
            Failed to load agencies
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      ) : (
        <>
          <div className="sovereign-table-shell overflow-x-auto">
            <table className="sovereign-table min-w-full">
              <thead>
                <tr>
                  <th>Agency</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => {
                  const active = agency.id === selectedAgencyId;
                  return (
                    <tr
                      key={agency.id}
                      onClick={() => setSelectedAgencyId(agency.id)}
                      className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                    >
                      <td>
                        <div className="font-semibold text-[var(--text)]">{agency.name}</div>
                        <div className="text-xs text-[var(--text-soft)]">{agency.email}</div>
                      </td>
                      <td>{agency.ownerName || 'Not provided'}</td>
                      <td>{agency.officeCity || 'Not provided'}</td>
                      <td>
                        <span className={statusClassMap[agency.status] || 'sovereign-pill sovereign-pill-neutral'}>
                          {agency.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {agencies.length === 0 ? (
            <div className="sovereign-panel p-10 text-center">
              <h3 className="font-headline text-2xl font-bold text-[var(--text)]">No agencies found</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Try a different search or filter.</p>
            </div>
          ) : null}

          {pagination.total > pagination.limit ? (
            <div className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <p className="text-sm text-[var(--text-muted)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="sovereign-button-secondary h-11 px-4 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                  className="sovereign-button-secondary h-11 px-4 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  const detail = selectedAgency ? (
    <div className="sovereign-panel sticky top-28 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="sovereign-label">Agency</div>
          <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">
            {selectedAgency.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedAgency.email}</p>
        </div>
        <span className={statusClassMap[selectedAgency.status] || 'sovereign-pill sovereign-pill-neutral'}>
          {selectedAgency.status}
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Owner</span>
            <span className="font-semibold text-[var(--text)]">{selectedAgency.ownerName || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Phone</span>
            <span className="font-semibold text-[var(--text)]">{selectedAgency.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">City</span>
            <span className="font-semibold text-[var(--text)]">{selectedAgency.officeCity || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Jurisdiction</span>
            <span className="font-semibold text-[var(--text)]">{selectedAgency.jurisdiction || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Entity</span>
            <span className="font-semibold text-[var(--text)]">{toTitleCase(selectedAgency.legalEntityType)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Capital</span>
            <span className="font-semibold text-[var(--text)]">
              {formatCurrency(selectedAgency.capitalAvailablePkr)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Submitted</span>
            <span className="font-semibold text-[var(--text)]">
              {formatDate(selectedAgency.applicationSubmittedAt || selectedAgency.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
            Hotels
          </div>
          <div className="mt-2 font-headline text-3xl font-extrabold text-[var(--text)]">
            {(selectedAgency.hotelsCount || 0).toLocaleString()}
          </div>
        </div>
        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
            Vehicles
          </div>
          <div className="mt-2 font-headline text-3xl font-extrabold text-[var(--text)]">
            {(selectedAgency.vehiclesCount || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
        <div className="sovereign-label">Address</div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {selectedAgency.address || 'Not provided'}
        </p>
      </div>

      <div className="mt-5">
        <div className="sovereign-label">Documents</div>
        <div className="mt-3">
          <DocumentGrid entries={documentEntries} emptyMessage="No KYC files uploaded." />
        </div>
      </div>

      {formError ? (
        <div className="mt-5 rounded-[18px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {formError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        {selectedAgency.status !== 'APPROVED' ? (
          <button type="button" onClick={handleApprove} className="sovereign-button-primary h-11 px-5">
            Approve
          </button>
        ) : null}
        {selectedAgency.status !== 'REJECTED' ? (
          <button type="button" onClick={handleReject} className="sovereign-button-danger h-11 px-5">
            Reject
          </button>
        ) : null}
        <button type="button" onClick={openEditModal} className="sovereign-button-secondary h-11 px-5">
          Edit
        </button>
      </div>
    </div>
  ) : (
    <div className="sovereign-panel p-10 text-center">
      <h3 className="font-headline text-2xl font-bold text-[var(--text)]">No agency selected</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Select an agency to review it.</p>
    </div>
  );

  return (
    <>
      <ManagementPageShell
        title="Agencies"
        subtitle="Approve, reject, or edit agency profiles."
        filters={filters}
        list={list}
        detail={detail}
      />

      <EntityEditModal
        open={isEditOpen}
        title="Edit agency"
        fields={editableFields}
        values={editValues}
        saving={isSaving}
        error={formError}
        onClose={() => setIsEditOpen(false)}
        onChange={(name, value) =>
          setEditValues((current) => ({
            ...current,
            [name]: value,
          }))
        }
        onSubmit={handleSave}
      />
    </>
  );
};

export default AgencyList;
