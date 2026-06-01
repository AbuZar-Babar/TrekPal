import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { formatCurrency, formatDate, formatStatusLabel } from '../../../shared/utils/formatters';
import { deleteVehicle, fetchVehicles } from '../store/transportSlice';

const VehicleList = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { vehicles, loading, error, pagination } = useSelector((state: RootState) => state.transport);

  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [filter, setFilter]   = useState<'' | 'AVAILABLE' | 'UNAVAILABLE'>('');

  useEffect(() => {
    dispatch(fetchVehicles({ page, limit: 20, search: search || undefined }) as any);
  }, [dispatch, page, search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this vehicle?')) return;
    await dispatch(deleteVehicle(id) as any);
    dispatch(fetchVehicles({ page, limit: 20, search: search || undefined }) as any);
  };

  const filtered = useMemo(() => {
    if (filter === 'AVAILABLE')   return vehicles.filter((v) => v.isAvailable);
    if (filter === 'UNAVAILABLE') return vehicles.filter((v) => !v.isAvailable);
    return vehicles;
  }, [vehicles, filter]);

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit || 1));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Fleet</h1>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">
            {pagination.total} vehicle{pagination.total !== 1 ? 's' : ''} — manage your inventory
          </p>
        </div>
        <button
          onClick={() => navigate('/transport/new')}
          className="app-btn-primary app-btn-md"
        >
          Add vehicle
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',       value: vehicles.length },
          { label: 'Available',   value: vehicles.filter((v) => v.isAvailable).length,  highlight: true },
          { label: 'Unavailable', value: vehicles.filter((v) => !v.isAvailable).length },
          { label: 'Avg rate',    value: vehicles.length
              ? formatCurrency(vehicles.reduce((s, v) => s + (v.pricePerDay || 0), 0) / vehicles.length)
              : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{s.label}</div>
            <div className={`mt-1 text-lg font-semibold tabular-nums ${(s as any).highlight ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tab filters */}
      <div className="flex flex-wrap gap-1.5">
        {([['', 'All'], ['AVAILABLE', 'Available'], ['UNAVAILABLE', 'Unavailable']] as const).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => { setPage(1); setFilter(val); }}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              filter === val
                ? 'bg-[var(--primary)] text-white'
                : 'border border-[var(--border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 max-w-sm">
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

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">
            {search ? 'No vehicles match your search' : 'No vehicles yet — add one to get started'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-[var(--border)] lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Vehicle', 'Registration', 'Capacity', 'Daily rate', 'Status', 'Updated', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-[var(--border)] hover:bg-[var(--panel-subtle)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text)]">{v.make} {v.model}</div>
                      <div className="text-xs text-[var(--text-soft)] mt-0.5">{v.year} · {formatStatusLabel(v.type)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[var(--text)]">{v.vehicleNumber || '—'}</div>
                      {v.driver?.name && <div className="text-xs text-[var(--text-soft)] mt-0.5">{v.driver.name}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text)]">{v.capacity} seats</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[var(--text)]">{formatCurrency(v.pricePerDay)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        v.isAvailable
                          ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                          : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                      }`}>
                        {v.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-soft)]">{formatDate(v.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/transport/${v.id}/edit`)}
                          className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
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
            {filtered.map((v) => (
              <div key={v.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                {v.images?.[0] ? (
                  <img src={v.images[0]} alt="" className="h-32 w-full object-cover rounded-t-[10px]" />
                ) : (
                  <div className="h-32 w-full bg-[var(--panel-subtle)] flex items-center justify-center text-xs text-[var(--text-soft)] rounded-t-[10px]">
                    No image
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[var(--text)]">{v.make} {v.model}</div>
                      <div className="text-xs text-[var(--text-soft)] mt-0.5">{v.year} · {formatStatusLabel(v.type)}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      v.isAvailable
                        ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                        : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                    }`}>
                      {v.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Registration</div>
                      <div className="text-xs font-semibold text-[var(--text)] mt-0.5">{v.vehicleNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Capacity</div>
                      <div className="text-xs font-semibold text-[var(--text)] mt-0.5">{v.capacity} seats</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Daily rate</div>
                      <div className="text-xs font-semibold text-[var(--text)] mt-0.5">{formatCurrency(v.pricePerDay)}</div>
                    </div>
                    {v.driver?.name && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Driver</div>
                        <div className="text-xs font-semibold text-[var(--text)] mt-0.5">{v.driver.name}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      onClick={() => navigate(`/transport/${v.id}/edit`)}
                      className="flex-1 h-8 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            ← Prev
          </button>
          <span className="text-xs text-[var(--text-soft)]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
            className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
