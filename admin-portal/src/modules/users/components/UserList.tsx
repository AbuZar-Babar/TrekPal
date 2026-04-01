import { useEffect, useState } from 'react';

import { useUsers } from '../hooks/useUsers';
import {
  formatDate,
  formatTravelerKycStatus,
  getInitials,
  getTravelerKycTone,
  maskCnic,
} from '../../../shared/utils/formatters';

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

const UserList = () => {
  const { users, loading, error, pagination, loadUsers } = useUsers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers({
      page,
      limit: 20,
      search: search || undefined,
    });
  }, [loadUsers, page, search]);

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (!selectedUserId || !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  if (loading && users.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sovereign-panel p-8 text-center">
        <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
          Failed to load traveler reviews
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="sovereign-label">Traveler review</div>
        <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
          Inspect traveler identity posture and KYC submission health
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
          Review traveler verification state, booking activity, and KYC timestamps from one
          unified moderation surface.
        </p>
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
              placeholder="Search travelers by name or email..."
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
                  <th>Traveler</th>
                  <th>Phone</th>
                  <th>KYC Status</th>
                  <th>Activity</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const tone = getTravelerKycTone(user.travelerKycStatus, user.cnicVerified);
                  const active = user.id === selectedUserId;

                  return (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--primary-container)] font-semibold text-[var(--primary)]">
                            {getInitials(user.name || user.email, 'TR')}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)]">
                              {user.name || 'Unnamed Traveler'}
                            </div>
                            <div className="text-xs text-[var(--text-soft)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone || 'Not provided'}</td>
                      <td>
                        <span className={toneToClass(tone)}>
                          {formatTravelerKycStatus(user.travelerKycStatus, user.cnicVerified)}
                        </span>
                      </td>
                      <td>
                        {user.bookingsCount || 0} bookings • {user.tripRequestsCount || 0} requests
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
          {selectedUser ? (
            <div className="sovereign-panel sticky top-28 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="sovereign-label">Traveler KYC review</div>
                  <h3 className="mt-2 font-headline text-2xl font-bold tracking-tight text-[var(--text)]">
                    {selectedUser.name || 'Unnamed Traveler'}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedUser.email}</p>
                </div>
                <span
                  className={toneToClass(
                    getTravelerKycTone(selectedUser.travelerKycStatus, selectedUser.cnicVerified)
                  )}
                >
                  {formatTravelerKycStatus(
                    selectedUser.travelerKycStatus,
                    selectedUser.cnicVerified
                  )}
                </span>
              </div>

              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Identity anchors</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Phone</span>
                    <span className="font-semibold text-[var(--text)]">
                      {selectedUser.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">CNIC</span>
                    <span className="font-semibold text-[var(--text)]">
                      {maskCnic(selectedUser.cnic)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Joined</span>
                    <span className="font-semibold text-[var(--text)]">
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">KYC timing</div>
                <div className="mt-4 space-y-3 text-sm">
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

              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Traveler activity</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                      Bookings
                    </div>
                    <div className="mt-2 font-headline text-3xl font-extrabold text-[var(--text)]">
                      {selectedUser.bookingsCount || 0}
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                      Trip Requests
                    </div>
                    <div className="mt-2 font-headline text-3xl font-extrabold text-[var(--text)]">
                      {selectedUser.tripRequestsCount || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border)] px-4 py-5 text-sm leading-7 text-[var(--text-muted)]">
                Traveler KYC evidence is currently exposed as status and timestamps in the admin API.
                Document-level review actions can be layered in later without changing this layout.
              </div>
            </div>
          ) : (
            <div className="sovereign-panel p-10 text-center">
              <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
                No traveler selected
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Select a traveler record to inspect the current KYC posture.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default UserList;
