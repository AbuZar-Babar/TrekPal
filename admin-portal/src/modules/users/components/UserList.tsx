import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import MetricCard from '../../../shared/components/analytics/MetricCard';
import EntityEditModal from '../../../shared/components/management/EntityEditModal';
import EntityDetailModal from '../../../shared/components/management/EntityDetailModal';
import DocumentGrid from '../../../shared/components/management/DocumentGrid';
import ManagementPageShell from '../../../shared/components/management/ManagementPageShell';
import { AppDispatch, RootState } from '../../../store';
import { extractErrorMessage } from '../../../shared/utils/errors';
import {
  formatDate,
  formatTravelerKycStatus,
  getTravelerKycTone,
  getInitials,
} from '../../../shared/utils/formatters';
import { approveUser, fetchUsers, rejectUser, updateUser } from '../store/usersSlice';

const toneToClass = (tone: string) => {
  switch (tone) {
    case 'success':
      return 'sovereign-pill sovereign-pill-success';
    case 'warning':
      return 'sovereign-pill sovereign-pill-warning';
    case 'danger':
      return 'sovereign-pill sovereign-pill-danger';
    default:
      return 'sovereign-pill sovereign-pill-neutral';
  }
};

const editableFields = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email', type: 'email' as const },
  { name: 'phone', label: 'Phone', type: 'tel' as const },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select' as const,
    options: [
      { value: '', label: 'Select gender' },
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
    ],
  },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date' as const },
  { name: 'residentialAddress', label: 'Residential address', type: 'textarea' as const },
];

const getDateInputValue = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const UserList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const { users, loading, error, pagination } = useSelector((state: RootState) => state.users);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const refreshUsers = async () => {
    await dispatch(
      fetchUsers({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
    );
  };

  useEffect(() => {
    void refreshUsers();
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (selectedUserId && !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(null);
      setIsDetailOpen(false);
    }
  }, [selectedUserId, users]);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const tabCounts = useMemo(() => {
    const counts = {
      ALL: pagination.total,
      PENDING: 0,
      VERIFIED: 0,
      REJECTED: 0,
    };
    users.forEach((user) => {
      if (user.travelerKycStatus === 'PENDING') {
        counts.PENDING += 1;
      } else if (user.travelerKycStatus === 'VERIFIED') {
        counts.VERIFIED += 1;
      } else if (user.travelerKycStatus === 'REJECTED') {
        counts.REJECTED += 1;
      }
    });
    return counts;
  }, [pagination.total, users]);

  const documentEntries = selectedUser
    ? [
        { label: 'CNIC front', url: selectedUser.cnicFrontImageUrl },
        { label: 'Selfie', url: selectedUser.selfieImageUrl },
      ].filter((entry): entry is { label: string; url: string } => Boolean(entry.url))
    : [];

  const openEditModal = () => {
    if (!selectedUser) {
      return;
    }

    setFormError(null);
    setEditValues({
      name: selectedUser.name || '',
      email: selectedUser.email,
      phone: selectedUser.phone || '',
      gender: selectedUser.gender || '',
      dateOfBirth: getDateInputValue(selectedUser.dateOfBirth),
      residentialAddress: selectedUser.residentialAddress || '',
    });
    setIsEditOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) {
      return;
    }

    setFormError(null);
    try {
      await dispatch(approveUser({ id: selectedUser.id })).unwrap();
      await refreshUsers();
    } catch (actionError) {
      setFormError(extractErrorMessage(actionError, 'Failed to approve traveler'));
    }
  };

  const handleReject = async () => {
    if (!selectedUser) {
      return;
    }

    setFormError(null);
    try {
      await dispatch(rejectUser({ id: selectedUser.id })).unwrap();
      await refreshUsers();
    } catch (actionError) {
      setFormError(extractErrorMessage(actionError, 'Failed to reject traveler'));
    }
  };

  const handleSave = async () => {
    if (!selectedUser) {
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await dispatch(
        updateUser({
          id: selectedUser.id,
          payload: {
            name: editValues.name?.trim(),
            email: editValues.email?.trim(),
            phone: editValues.phone?.trim() || null,
            gender:
              editValues.gender === 'Male' || editValues.gender === 'Female'
                ? editValues.gender
                : null,
            dateOfBirth: editValues.dateOfBirth?.trim() || null,
            residentialAddress: editValues.residentialAddress?.trim() || null,
          },
        }),
      ).unwrap();
      await refreshUsers();
      setIsEditOpen(false);
    } catch (actionError) {
      setFormError(extractErrorMessage(actionError, 'Failed to update traveler'));
    } finally {
      setIsSaving(false);
    }
  };

  const filters = (
    <div className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
      {[
        { value: '', label: 'All', count: tabCounts.ALL },
        { value: 'PENDING', label: 'Pending', count: tabCounts.PENDING },
        { value: 'VERIFIED', label: 'Verified', count: tabCounts.VERIFIED },
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
          placeholder="Search travelers..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="sovereign-input pl-11"
        />
      </div>

      {loading && users.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
        </div>
      ) : error ? (
        <div className="sovereign-panel p-8 text-center">
          <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
            Failed to load travelers
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      ) : (
        <>
          <div className="sovereign-table-shell overflow-x-auto">
            <table className="sovereign-table min-w-full">
              <thead>
                <tr>
                  <th>Traveler</th>
                  <th>Phone</th>
                  <th>KYC</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const active = user.id === selectedUserId;
                  const tone = getTravelerKycTone(user.travelerKycStatus, user.cnicVerified);

                  return (
                    <tr
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsDetailOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                    >
                      <td>
                        <div className="font-semibold text-[var(--text)]">
                          {user.name || 'Unnamed traveler'}
                        </div>
                        <div className="text-xs text-[var(--text-soft)]">{user.email}</div>
                      </td>
                      <td>{user.phone || 'Not provided'}</td>
                      <td>
                        <span className={toneToClass(tone)}>
                          {formatTravelerKycStatus(user.travelerKycStatus, user.cnicVerified)}
                        </span>
                      </td>
                      <td>
                        {(user.bookingsCount || 0).toLocaleString()} bookings •{' '}
                        {(user.tripRequestsCount || 0).toLocaleString()} briefs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 ? (
            <div className="sovereign-panel p-10 text-center">
              <h3 className="font-headline text-2xl font-bold text-[var(--text)]">No travelers found</h3>
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

  const canReviewTraveler =
    selectedUser?.travelerKycStatus && selectedUser.travelerKycStatus !== 'NOT_SUBMITTED';

  const detailContent = selectedUser ? (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {selectedUser.avatar ? (
            <img
              src={selectedUser.avatar}
              alt={selectedUser.name || 'Traveler'}
              className="h-14 w-14 rounded-full object-cover ring-1 ring-[var(--border)]"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-low)] text-sm font-bold text-[var(--text-muted)] ring-1 ring-[var(--border)]">
              {getInitials(selectedUser.name, 'TR')}
            </div>
          )}
          <div>
            <div className="sovereign-label">Traveler</div>
            <h3 className="mt-2 font-headline text-2xl font-bold text-[var(--text)]">
              {selectedUser.name || 'Unnamed traveler'}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedUser.email}</p>
          </div>
        </div>
        <span
          className={toneToClass(
            getTravelerKycTone(selectedUser.travelerKycStatus, selectedUser.cnicVerified),
          )}
        >
          {formatTravelerKycStatus(selectedUser.travelerKycStatus, selectedUser.cnicVerified)}
        </span>
      </div>

      <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Phone</span>
            <span className="font-semibold text-[var(--text)]">{selectedUser.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Gender</span>
            <span className="font-semibold text-[var(--text)]">{selectedUser.gender || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Date of birth</span>
            <span className="font-semibold text-[var(--text)]">{formatDate(selectedUser.dateOfBirth)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Joined</span>
            <span className="font-semibold text-[var(--text)]">{formatDate(selectedUser.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
        <div className="sovereign-label">Address</div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {selectedUser.residentialAddress || 'Not provided'}
        </p>
      </div>

      <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Submitted</span>
            <span className="font-semibold text-[var(--text)]">
              {formatDate(selectedUser.kycSubmittedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-soft)]">Verified</span>
            <span className="font-semibold text-[var(--text)]">
              {formatDate(selectedUser.kycVerifiedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Bookings"
          value={(selectedUser.bookingsCount || 0).toLocaleString()}
          hint="Completed and active"
        />
        <MetricCard
          label="Trip Requests"
          value={(selectedUser.tripRequestsCount || 0).toLocaleString()}
          hint="Published briefs"
        />
      </div>

      <div>
        <div className="sovereign-label">Documents</div>
        <div className="mt-3">
          <DocumentGrid entries={documentEntries} emptyMessage="No traveler KYC files uploaded." />
        </div>
      </div>

      {formError ? (
        <div className="rounded-[18px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        {canReviewTraveler && selectedUser.travelerKycStatus !== 'VERIFIED' ? (
          <button type="button" onClick={handleApprove} className="sovereign-button-primary h-11 px-5">
            Approve
          </button>
        ) : null}
        {canReviewTraveler && selectedUser.travelerKycStatus !== 'REJECTED' ? (
          <button type="button" onClick={handleReject} className="sovereign-button-danger h-11 px-5">
            Reject
          </button>
        ) : null}
        <button type="button" onClick={openEditModal} className="sovereign-button-secondary h-11 px-5">
          Edit
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <ManagementPageShell
        title="Travelers"
        subtitle="Approve, reject, or edit traveler profiles."
        filters={filters}
        list={list}
      />

      <EntityDetailModal
        open={isDetailOpen && Boolean(selectedUser)}
        title={selectedUser?.name || 'Traveler details'}
        subtitle={selectedUser?.email}
        onClose={() => setIsDetailOpen(false)}
      >
        {detailContent}
      </EntityDetailModal>

      <EntityEditModal
        open={isEditOpen}
        title="Edit traveler"
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

export default UserList;
