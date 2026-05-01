import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import EntityDetailModal from '../../../shared/components/management/EntityDetailModal';
import { formatDate, formatCurrency, getInitials } from '../../../shared/utils/formatters';
import { approveVehicle, fetchVehicles, rejectVehicle } from '../store/vehiclesSlice';

const statusClassMap: Record<string, string> = {
  PENDING: 'sovereign-pill sovereign-pill-warning',
  APPROVED: 'sovereign-pill sovereign-pill-success',
  REJECTED: 'sovereign-pill sovereign-pill-danger',
};

const VehicleApprovalList = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error, pagination } = useSelector(
    (state: RootState) => state.vehicles
  );
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    dispatch(
      fetchVehicles({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );
  }, [dispatch, page, search, statusFilter]);

  useEffect(() => {
    if (selectedVehicleId && !vehicles.some((vehicle) => vehicle.id === selectedVehicleId)) {
      setSelectedVehicleId(null);
      setIsDetailOpen(false);
    }
  }, [selectedVehicleId, vehicles]);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const tabCounts = useMemo(() => {
    const base = { ALL: pagination.total, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    vehicles.forEach((vehicle) => {
      base[vehicle.status as 'PENDING' | 'APPROVED' | 'REJECTED'] += 1;
    });
    return base;
  }, [pagination.total, vehicles]);

  const refreshList = () =>
    dispatch(
      fetchVehicles({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );

  const handleApprove = async (id: string) => {
    if (window.confirm('Approve this vehicle record?')) {
      await dispatch(approveVehicle({ id }) as any);
      refreshList();
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      await dispatch(rejectVehicle({ id, reason: reason || undefined }) as any);
      refreshList();
    }
  };

  if (loading && vehicles.length === 0) {
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
          Failed to load vehicle approvals
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
        {[
          { value: '', label: 'All Vehicles', count: tabCounts.ALL },
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

      <section>
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
              placeholder="Search vehicles, agencies, or model names..."
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
                  <th>Vehicle</th>
                  <th>Agency</th>
                  <th>Capacity</th>
                  <th>Price / Day</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const active = vehicle.id === selectedVehicleId;
                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        setIsDetailOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${active ? 'bg-[var(--surface-low)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--primary-container)] font-semibold text-[var(--primary)]">
                            {getInitials(`${vehicle.make} ${vehicle.model}`, 'VH')}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)]">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-xs text-[var(--text-soft)]">
                              {vehicle.year} • {vehicle.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{vehicle.agencyName}</td>
                      <td>{vehicle.capacity} seats</td>
                      <td>{formatCurrency(vehicle.pricePerDay)}</td>
                      <td>
                        <span className={statusClassMap[vehicle.status] || 'sovereign-pill sovereign-pill-neutral'}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button type="button" className="sovereign-button-secondary h-10 px-4">
                          {vehicle.status === 'PENDING' ? 'Review' : 'Inspect'}
                        </button>
                      </td>
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
      </section>

      <EntityDetailModal
        open={isDetailOpen && Boolean(selectedVehicle)}
        title={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Vehicle details'}
        subtitle={selectedVehicle?.agencyName}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedVehicle ? (
          <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="sovereign-label">Vehicle review</div>
                  <h3 className="mt-2 font-headline text-2xl font-bold tracking-tight text-[var(--text)]">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{selectedVehicle.agencyName}</p>
                </div>
                <span className={statusClassMap[selectedVehicle.status] || 'sovereign-pill sovereign-pill-neutral'}>
                  {selectedVehicle.status}
                </span>
              </div>

              {selectedVehicle.images[0] ? (
                <img
                  src={selectedVehicle.images[0]}
                  alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                  className="mt-5 h-48 w-full rounded-[22px] object-cover"
                />
              ) : (
                <div className="mt-5 flex h-48 items-center justify-center rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface-low)] text-[var(--text-soft)]">
                  No vehicle image available
                </div>
              )}

              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-4">
                <div className="sovereign-label">Operational details</div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Type</span>
                    <span className="font-semibold text-[var(--text)]">{selectedVehicle.type}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Year</span>
                    <span className="font-semibold text-[var(--text)]">{selectedVehicle.year}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Capacity</span>
                    <span className="font-semibold text-[var(--text)]">
                      {selectedVehicle.capacity} seats
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Price / Day</span>
                    <span className="font-semibold text-[var(--text)]">
                      {formatCurrency(selectedVehicle.pricePerDay)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Availability</span>
                    <span className="font-semibold text-[var(--text)]">
                      {selectedVehicle.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--text-soft)]">Submitted</span>
                    <span className="font-semibold text-[var(--text)]">
                      {formatDate(selectedVehicle.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
                {selectedVehicle.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedVehicle.id)}
                    className="sovereign-button-primary h-12 px-5"
                  >
                    Approve Vehicle
                  </button>
                )}
                {selectedVehicle.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleReject(selectedVehicle.id)}
                    className="sovereign-button-danger h-12 px-5"
                  >
                    Reject Vehicle
                  </button>
                )}
              </div>
          </div>
        ) : null}
      </EntityDetailModal>
    </div>
  );
};

export default VehicleApprovalList;
