import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import {
  formatCurrency,
  formatDate,
  getInitials,
  toTitleCase,
} from '../../../shared/utils/formatters';
import { approveAgency, deleteAgency, fetchAgencies, rejectAgency } from '../store/agencySlice';

const statusClassMap: Record<string, string> = {
  PENDING: 'sovereign-pill sovereign-pill-warning',
  APPROVED: 'sovereign-pill sovereign-pill-success',
  REJECTED: 'sovereign-pill sovereign-pill-danger',
};

const urlLooksLikeImage = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].some((extension) => cleanUrl.endsWith(extension));
};

const AgencyList = () => {
  const dispatch = useDispatch();
  const { agencies, loading, error, pagination } = useSelector(
    (state: RootState) => state.agencies
  );
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(
      fetchAgencies({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );
  }, [dispatch, page, statusFilter, search]);

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
    const base = { ALL: pagination.total, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    agencies.forEach((agency) => {
      base[agency.status as 'PENDING' | 'APPROVED' | 'REJECTED'] += 1;
    });
    return base;
  }, [agencies, pagination.total]);

  const handleApprove = async (id: string) => {
    if (window.confirm('Approve this agency?')) {
      await dispatch(approveAgency({ id }) as any);
      dispatch(
        fetchAgencies({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        }) as any
      );
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      await dispatch(rejectAgency({ id, reason: reason || undefined }) as any);
      dispatch(
        fetchAgencies({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        }) as any
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this agency and all associated records?')) {
      await (dispatch(deleteAgency(id) as any) as any).unwrap();
      dispatch(
        fetchAgencies({
          page,
          limit: 20,
          status: statusFilter || undefined,
          search: search || undefined,
        }) as any
      );
    }
  };

  const documentEntries = selectedAgency
    ? [
        { label: 'CNIC Image', url: selectedAgency.cnicImageUrl },
        { label: 'Owner Photo', url: selectedAgency.ownerPhotoUrl },
        { label: 'Tourism License', url: selectedAgency.licenseCertificateUrl },
        { label: 'NTN Certificate', url: selectedAgency.ntnCertificateUrl },
        { label: 'Business Registration', url: selectedAgency.businessRegistrationProofUrl },
        { label: 'Office Proof', url: selectedAgency.officeProofUrl },
        { label: 'Bank Certificate', url: selectedAgency.bankCertificateUrl },
        { label: 'Additional Document', url: selectedAgency.additionalSupportingDocumentUrl },
      ].filter((entry): entry is { label: string; url: string } => !!entry.url)
    : [];

  if (loading && agencies.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sovereign-panel p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--danger-bg)] text-[var(--danger-text)]">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="mt-4 font-headline text-2xl font-bold text-[var(--text)]">
          Failed to load agency approvals
        </h3>
        <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="sovereign-label">Agency approvals</div>
          <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Review partner businesses with evidence-first clarity
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Inspect submitted legal documentation, assess operational readiness, and approve or
            reject agencies without losing context.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="sovereign-button-secondary h-11 px-4">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M3 4h18M6 8h12M9 12h6M10 16l2 2 4-4"
              />
            </svg>
            Region: All
          </button>
          <button type="button" className="sovereign-button-primary h-11 px-5">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16v-8m0 8 4-4m-4 4-4-4M4 20h16" />
            </svg>
            Export Report
          </button>
        </div>
      </section>

      <section className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
        {[
          { value: '', label: 'All Applications', count: tabCounts.ALL },
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
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
              placeholder="Search agencies, cities, or owner names..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="sovereign-input pl-11"
            />
          </div>

          <div className="sovereign-table-shell overflow-x-auto">
            <table className="sovereign-table min-w-full">
              <thead>
                <tr>
                  <th>Agency Name</th>
                  <th>Region & Type</th>
                  <th>Submission Date</th>
                  <th>Review Status</th>
                  <th className="text-right">Action</th>
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
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--primary-container)] font-semibold text-[var(--primary)]">
                            {getInitials(agency.name, 'AG')}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)]">{agency.name}</div>
                            <div className="text-xs text-[var(--text-soft)]">{agency.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-[var(--text)]">
                          {agency.jurisdiction || agency.officeCity || 'Not provided'}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-soft)]">
                          {toTitleCase(agency.legalEntityType)}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-[var(--text)]">
                          {formatDate(agency.applicationSubmittedAt || agency.createdAt)}
                        </div>
                        <div className="mt-1 text-xs text-[var(--text-soft)]">
                          {agency.ownerName || 'Owner not provided'}
                        </div>
                      </td>
                      <td>
                        <span className={statusClassMap[agency.status] || 'sovereign-pill sovereign-pill-neutral'}>
                          {agency.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button type="button" className="sovereign-button-secondary h-10 px-4">
                          {agency.status === 'PENDING' ? 'Review' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {agencies.length === 0 && (
            <div className="sovereign-panel p-12 text-center">
              <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
                No agency applications found
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Adjust your search or status filters to inspect another review slice.
              </p>
            </div>
          )}

          {pagination.total > pagination.limit && (
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
          )}
        </div>

        <aside className="space-y-5">
          {selectedAgency ? (
            <div className="sovereign-panel sticky top-28 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="sovereign-label">Agency detail review</div>
                  <h3 className="mt-2 font-headline text-2xl font-bold tracking-tight text-[var(--text)]">
                    {selectedAgency.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedAgency.email}</p>
                </div>
                <span className={statusClassMap[selectedAgency.status] || 'sovereign-pill sovereign-pill-neutral'}>
                  {selectedAgency.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                  <div className="sovereign-label">Business summary</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">Jurisdiction</span>
                      <span className="font-semibold text-[var(--text)]">
                        {selectedAgency.jurisdiction || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">Office city</span>
                      <span className="font-semibold text-[var(--text)]">
                        {selectedAgency.officeCity || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">Legal entity</span>
                      <span className="font-semibold text-[var(--text)]">
                        {toTitleCase(selectedAgency.legalEntityType)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">Capital</span>
                      <span className="font-semibold text-[var(--text)]">
                        {formatCurrency(selectedAgency.capitalAvailablePkr)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                  <div className="sovereign-label">Representative</div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">Owner</span>
                      <span className="font-semibold text-[var(--text)]">
                        {selectedAgency.ownerName || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">Phone</span>
                      <span className="font-semibold text-[var(--text)]">
                        {selectedAgency.phone || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--text-soft)]">CNIC</span>
                      <span className="font-semibold text-[var(--text)]">
                        {selectedAgency.cnic || 'Not provided'}
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
              </div>

              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Operational details</div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  {selectedAgency.address || 'No office address submitted yet.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedAgency.fieldOfOperations.length > 0 ? (
                    selectedAgency.fieldOfOperations.map((item) => (
                      <span key={item} className="sovereign-pill sovereign-pill-neutral">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--text-soft)]">
                      Field of operations not provided.
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="sovereign-label">Document review</div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {documentEntries.length > 0 ? (
                    documentEntries.map((document) => (
                      <a
                        key={document.label}
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-low)] transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        {urlLooksLikeImage(document.url) ? (
                          <img src={document.url} alt={document.label} className="h-24 w-full object-cover" />
                        ) : (
                          <div className="flex h-24 items-center justify-center text-[var(--text-soft)]">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M7 21h10a2 2 0 002-2V8l-6-6H7a2 2 0 00-2 2v15a2 2 0 002 2z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M13 3v5h5"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="px-3 py-3">
                          <div className="text-xs font-semibold text-[var(--text)]">{document.label}</div>
                          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                            Open file
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-[18px] border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--text-soft)]">
                      No supporting documents available for this application.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
                {selectedAgency.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedAgency.id)}
                    className="sovereign-button-primary h-12 px-5"
                  >
                    Approve Application
                  </button>
                )}
                {selectedAgency.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleReject(selectedAgency.id)}
                    className="sovereign-button-danger h-12 px-5"
                  >
                    Reject Application
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(selectedAgency.id)}
                  className="sovereign-button-secondary h-12 px-5"
                >
                  Delete Record
                </button>
              </div>
            </div>
          ) : (
            <div className="sovereign-panel p-10 text-center">
              <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
                No agency selected
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Select an application from the list to inspect its review details.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default AgencyList;
