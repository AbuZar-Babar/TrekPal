import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { formatCurrency } from '../../../shared/utils/formatters';
import { deletePackage, fetchPackages } from '../store/packagesSlice';

// ── Status helpers ────────────────────────────────────────────────────────────
const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
    isActive
      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
      : 'bg-[var(--panel-strong)] text-[var(--text-muted)]'
  }`}>
    {isActive ? 'Active' : 'Draft'}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
const PackageList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { packages, loading, error, pagination } = useSelector((state: RootState) => state.packages);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchPackages({ page, limit: 20, search: search || undefined }) as any);
  }, [dispatch, page, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this trip offer?')) {
      await dispatch(deletePackage(id) as any);
      dispatch(fetchPackages({ page, limit: 20, search: search || undefined }) as any);
    }
  };

  // Compute stats from all packages
  const stats = useMemo(() => {
    const activeOffers = packages.filter((p) => p.isActive);
    const draftOffers = packages.filter((p) => !p.isActive);
    const totalRevenue = packages
      .filter((p) => p.isActive)
      .reduce((sum, p) => sum + (p.price * (p.maxSeats - p.remainingSeats)), 0);

    return {
      total: packages.length,
      active: activeOffers.length,
      draft: draftOffers.length,
      revenue: totalRevenue,
    };
  }, [packages]);

  // Filter packages
  const filtered = useMemo(() => {
    if (!statusFilter) return packages;
    if (statusFilter === 'ACTIVE') return packages.filter((p) => p.isActive);
    if (statusFilter === 'DRAFT') return packages.filter((p) => !p.isActive);
    return packages;
  }, [packages, statusFilter]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-5">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Offers</h1>
          <p className="mt-0.5 text-sm text-[var(--text-soft)]">
            {pagination.total} total — manage your published and draft trip packages
          </p>
        </div>
        <button
          onClick={() => navigate('/packages/new')}
          className="h-9 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          New offer
        </button>
      </div>

      {/* ── Mini stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total offers', value: stats.total },
          { label: 'Published', value: stats.active, highlight: true },
          { label: 'Drafts', value: stats.draft },
          { label: 'Revenue', value: formatCurrency(stats.revenue) },
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
          { label: 'Published', value: 'ACTIVE' },
          { label: 'Drafts', value: 'DRAFT' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => { setPage(1); setStatusFilter(tab.value); }}
            className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${
              statusFilter === tab.value
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
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search offers…"
          className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-[var(--text-soft)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          <p className="text-sm text-[var(--text-soft)]">No offers found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => (
            <div key={pkg.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--text)] truncate">{pkg.name}</h3>
                  <p className="text-xs text-[var(--text-soft)] mt-0.5">{pkg.duration} days</p>
                </div>
                <StatusBadge isActive={pkg.isActive} />
              </div>

              {/* Destinations */}
              <div className="px-5 border-t border-[var(--border)]">
                <div className="flex flex-wrap gap-1.5 py-3">
                  {pkg.destinations.slice(0, 3).map((dest, i) => (
                    <span key={i} className="text-[10px] font-medium bg-[var(--panel-subtle)] text-[var(--text-soft)] px-2 py-1 rounded-md">
                      {dest}
                    </span>
                  ))}
                  {pkg.destinations.length > 3 && (
                    <span className="text-[10px] font-medium bg-[var(--panel-subtle)] text-[var(--text-soft)] px-2 py-1 rounded-md">
                      +{pkg.destinations.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Key metrics */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)] px-5 py-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Price</div>
                  <div className="text-sm font-semibold text-[var(--text)] tabular-nums">{formatCurrency(pkg.price)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Capacity</div>
                  <div className="text-sm font-semibold text-[var(--text)]">
                    {pkg.confirmedSeats}/{pkg.maxSeats}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">Available</div>
                  <div className={`text-sm font-semibold ${pkg.isSoldOut ? 'text-[var(--danger-text)]' : 'text-[var(--text)]'}`}>
                    {pkg.remainingSeats}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
                <button
                  onClick={() => navigate(`/packages/${pkg.id}/edit`)}
                  className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────── */}
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

export default PackageList;
