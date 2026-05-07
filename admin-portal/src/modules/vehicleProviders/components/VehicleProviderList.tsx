import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DocumentGrid from '../../../shared/components/management/DocumentGrid';
import EntityDetailModal from '../../../shared/components/management/EntityDetailModal';
import ManagementPageShell from '../../../shared/components/management/ManagementPageShell';
import { formatDate } from '../../../shared/utils/formatters';
import { AppDispatch, RootState } from '../../../store';
import {
  approveVehicleProvider,
  fetchVehicleProviders,
  rejectVehicleProvider,
} from '../store/vehicleProvidersSlice';

const statusClassMap: Record<string, string> = {
  PENDING: 'sovereign-pill sovereign-pill-warning',
  APPROVED: 'sovereign-pill sovereign-pill-success',
  REJECTED: 'sovereign-pill sovereign-pill-danger',
};

const VehicleProviderList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { providers, loading, error, pagination } = useSelector((state: RootState) => state.vehicleProviders);

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const refresh = async () => {
    await dispatch(fetchVehicleProviders({
      page,
      limit: 20,
      status: statusFilter || undefined,
      search: search || undefined,
    }));
  };

  useEffect(() => {
    void refresh();
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => {
    if (selectedId && !providers.some((provider) => provider.id === selectedId)) {
      setSelectedId(null);
      setIsDetailOpen(false);
    }
  }, [providers, selectedId]);

  const selected = providers.find((provider) => provider.id === selectedId) ?? null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const tabCounts = useMemo(() => {
    const counts = { ALL: pagination.total, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    providers.forEach((provider) => {
      counts[provider.status as 'PENDING' | 'APPROVED' | 'REJECTED'] += 1;
    });
    return counts;
  }, [providers, pagination.total]);

  const handleApprove = async (id: string) => {
    await dispatch(approveVehicleProvider({ id })).unwrap();
    await refresh();
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      await dispatch(rejectVehicleProvider({ id, reason: reason || undefined })).unwrap();
      await refresh();
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
              setStatusFilter(tab.value);
              setPage(1);
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
        <input
          type="text"
          placeholder="Search vehicle providers..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="sovereign-input"
        />
      </div>

      {loading && providers.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
        </div>
      ) : error ? (
        <div className="sovereign-panel p-8 text-center">
          <h3 className="font-headline text-2xl font-bold text-[var(--text)]">Failed to load providers</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      ) : (
        <>
          <div className="sovereign-table-shell overflow-x-auto">
            <table className="sovereign-table min-w-full">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr
                    key={provider.id}
                    onClick={() => {
                      setSelectedId(provider.id);
                      setIsDetailOpen(true);
                    }}
                    className="cursor-pointer transition-colors"
                  >
                    <td>
                      <div className="font-semibold text-[var(--text)]">{provider.name}</div>
                      <div className="text-xs text-[var(--text-soft)]">{provider.email}</div>
                    </td>
                    <td>{provider.ownerName || 'Not provided'}</td>
                    <td>{provider.officeCity || 'Not provided'}</td>
                    <td>
                      <span className={statusClassMap[provider.status] || 'sovereign-pill sovereign-pill-neutral'}>
                        {provider.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total > pagination.limit ? (
            <div className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <p className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</p>
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

  const documents = selected
    ? [
        { label: 'CNIC', url: selected.cnicImageUrl },
        { label: 'Owner photo', url: selected.ownerPhotoUrl },
        { label: 'License', url: selected.licenseCertificateUrl },
        { label: 'NTN', url: selected.ntnCertificateUrl },
        { label: 'Office proof', url: selected.officeProofUrl },
        { label: 'Bank certificate', url: selected.bankCertificateUrl },
        { label: 'Other', url: selected.additionalSupportingDocumentUrl },
      ].filter((entry): entry is { label: string; url: string } => Boolean(entry.url))
    : [];

  return (
    <>
      <ManagementPageShell filters={filters} list={list} />
      <EntityDetailModal
        open={isDetailOpen && Boolean(selected)}
        title={selected?.name || 'Vehicle provider details'}
        subtitle={selected?.email}
        onClose={() => setIsDetailOpen(false)}
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="sovereign-label">Vehicle provider</div>
                <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">{selected.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{selected.email}</p>
              </div>
              <span className={statusClassMap[selected.status] || 'sovereign-pill sovereign-pill-neutral'}>{selected.status}</span>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4"><span className="text-[var(--text-soft)]">Owner</span><span className="font-semibold text-[var(--text)]">{selected.ownerName || 'Not provided'}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-[var(--text-soft)]">Phone</span><span className="font-semibold text-[var(--text)]">{selected.phone || 'Not provided'}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-[var(--text-soft)]">City</span><span className="font-semibold text-[var(--text)]">{selected.officeCity || 'Not provided'}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-[var(--text-soft)]">Submitted</span><span className="font-semibold text-[var(--text)]">{formatDate(selected.applicationSubmittedAt || selected.createdAt)}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-[var(--text-soft)]">Vehicles</span><span className="font-semibold text-[var(--text)]">{selected.vehiclesCount || 0}</span></div>
              </div>
            </div>

            <div>
              <div className="sovereign-label">Documents</div>
              <div className="mt-3">
                <DocumentGrid entries={documents} emptyMessage="No KYC files uploaded." />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
              {selected.status !== 'APPROVED' ? (
                <button type="button" onClick={() => handleApprove(selected.id)} className="sovereign-button-primary h-11 px-5">
                  Approve
                </button>
              ) : null}
              {selected.status !== 'REJECTED' ? (
                <button type="button" onClick={() => handleReject(selected.id)} className="sovereign-button-danger h-11 px-5">
                  Reject
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </EntityDetailModal>
    </>
  );
};

export default VehicleProviderList;
