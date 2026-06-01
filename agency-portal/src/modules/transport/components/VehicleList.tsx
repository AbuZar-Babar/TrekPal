import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { deleteVehicle, fetchVehicles } from '../store/transportSlice';
import { Vehicle } from '../../../shared/types';

// ── Status helpers ────────────────────────────────────────────────────────────
const AvailabilityBadge = ({ isAvailable }: { isAvailable: boolean }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
    isAvailable
      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
      : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
  }`}>
    {isAvailable ? 'Available' : 'Unavailable'}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
const VehicleList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vehicles, loading, error, pagination } = useSelector((state: RootState) => state.transport);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [availabilityFilter, setAvailabilityFilter] = useState<'' | 'AVAILABLE' | 'UNAVAILABLE'>('');

  useEffect(() => {
    dispatch(
      fetchVehicles({
        page,
        limit: 20,
        search: search || undefined,
      }) as any,
    );
  }, [dispatch, page, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await dispatch(deleteVehicle(id) as any);
      dispatch(fetchVehicles({ page, limit: 20, search: search || undefined }) as any);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    const available = vehicles.filter((v) => v.isAvailable);
    const unavailable = vehicles.filter((v) => !v.isAvailable);
    const totalValue = vehicles.reduce((sum, v) => sum + (v.pricePerDay || 0), 0);

    return {
      total: vehicles.length,
      available: available.length,
      unavailable: unavailable.length,
      avgDailyRate: vehicles.length > 0 ? totalValue / vehicles.length : 0,
    };
  }, [vehicles]);

  // Filter vehicles
  const filtered = useMemo(() => {
    let result = vehicles;
    if (availabilityFilter === 'AVAILABLE') result = result.filter((v) => v.isAvailable);
    if (availabilityFilter === 'UNAVAILABLE') result = result.filter((v) => !v.isAvailable);
    return result;
  }, [vehicles, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit || 1));

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Fleet</h1>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">
            {pagination.total} total — manage your vehicle inventory
          </p>
        </div>
        <button
          onClick={() => navigate('/transport/new')}
          className="h-9 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Add vehicle
        </button>
      </div>

      {/* ── Mini stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total fleet', value: stats.total },
          { label: 'Available', value: stats.available, highlight: true },
          { label: 'Unavailable', value: stats.unavailable },
          { label: 'Avg daily rate', value: formatCurrency(stats.avgDailyRate) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${s.highlight ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab filters ──────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: 'All', value: '' },
          { label: 'Available', value: 'AVAILABLE' },
          { label: 'Unavailable', value: 'UNAVAILABLE' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => { setPage(1); setAvailabilityFilter(tab.value as any); }}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              availabilityFilter === tab.value
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 text-sm max-w-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search make, model, registration…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* ── Mobile cards ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No vehicles found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-[var(--border)] lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Vehicle</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Registration</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Capacity</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Daily rate</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Updated</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-[var(--border)] hover:bg-[var(--panel-subtle)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text)]">{vehicle.make} {vehicle.model}</div>
                      <div className="text-xs text-[var(--text-soft)] mt-0.5">{vehicle.year}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[var(--text)]">{vehicle.vehicleNumber || '—'}</div>
                      {vehicle.driverName && <div className="text-xs text-[var(--text-soft)] mt-0.5">{vehicle.driverName}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text)]">
                      {vehicle.capacity} seats
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[var(--text)]">
                      {formatCurrency(vehicle.pricePerDay)}
                    </td>
                    <td className="px-5 py-4">
                      <AvailabilityBadge isAvailable={vehicle.isAvailable} />
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-soft)]">
                      {formatDate(vehicle.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/transport/${vehicle.id}/edit`)}
                          className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 lg:hidden">
            {filtered.map((vehicle) => (
              <div key={vehicle.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                {/* Image */}
                {vehicle.images?.[0] ? (
                  <img src={vehicle.images[0]} alt="" className="h-32 w-full object-cover rounded-t-[10px]" />
                ) : (
                  <div className="h-32 w-full bg-[var(--panel-subtle)] flex items-center justify-center text-xs text-[var(--text-soft)] rounded-t-[10px]">No image</div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[var(--text)]">{vehicle.make} {vehicle.model}</div>
                      <div className="text-xs text-[var(--text-soft)] mt-0.5">{vehicle.year}</div>
                    </div>
                    <AvailabilityBadge isAvailable={vehicle.isAvailable} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Registration</div>
                      <div className="text-xs font-semibold text-[var(--text)] mt-1">{vehicle.vehicleNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Capacity</div>
                      <div className="text-xs font-semibold text-[var(--text)] mt-1">{vehicle.capacity} seats</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Daily rate</div>
                    <div className="text-sm font-semibold text-[var(--text)] mt-1">{formatCurrency(vehicle.pricePerDay)}</div>
                  </div>

                  {vehicle.driverName && (
                    <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-soft)]">
                      Driver: {vehicle.driverName}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/transport/${vehicle.id}/edit`)}
                      className="flex-1 h-8 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 h-8 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs text-[var(--text-soft)]">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
