import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { Package } from '../../../shared/types';
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
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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
                  id={`view-details-btn-${pkg.id}`}
                  onClick={() => setSelectedPackage(pkg)}
                  className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--text)] hover:bg-[var(--panel-subtle)] transition-colors mr-auto"
                >
                  View Details
                </button>
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

      {/* Package detail modal */}
      {selectedPackage && (
        <PackageDetailModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />
      )}
    </div>
  );
};

// Package detail modal
const PackageDetailModal = ({ pkg, onClose }: { pkg: Package; onClose: () => void }) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Format date nicely
  const formattedDate = pkg.startDate
    ? new Date(pkg.startDate).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not scheduled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[var(--border)] px-6 py-4 bg-[var(--panel-subtle)]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                pkg.isActive
                  ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                  : 'bg-[var(--panel-strong)] text-[var(--text-muted)]'
              }`}>
                {pkg.isActive ? 'Active' : 'Draft'}
              </span>
              <span className="text-xs text-[var(--text-soft)]">• {pkg.duration} Days</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text)] mt-1">{pkg.name}</h3>
          </div>
          <button id="close-pkg-detail-modal-btn" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--panel-strong)] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Images */}
          {pkg.images && pkg.images.length > 0 ? (
            <div className="space-y-2">
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {pkg.images.slice(0, 2).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${pkg.name} ${idx + 1}`}
                    className="h-44 w-full rounded-xl object-cover border border-[var(--border)] shadow-sm"
                  />
                ))}
              </div>
              {pkg.images.length > 2 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {pkg.images.slice(2).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${pkg.name} ${idx + 3}`}
                      className="h-16 w-24 shrink-0 rounded-lg object-cover border border-[var(--border)] shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-40 w-full rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex flex-col items-center justify-center border border-[var(--border)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-[var(--primary)] mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-xs text-[var(--text-soft)] font-medium">No photos uploaded for this offer</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)]">Price / Person</div>
              <div className="text-lg font-bold text-[var(--primary)] mt-1">{formatCurrency(pkg.price)}</div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)]">Start Date</div>
              <div className="text-sm font-bold text-[var(--text)] mt-1">{formattedDate}</div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)]">Capacity & Seats</div>
              <div className="flex items-center justify-between mt-1 text-sm font-bold text-[var(--text)]">
                <span>{pkg.confirmedSeats} / {pkg.maxSeats}</span>
                <span className="text-xs font-medium text-[var(--text-soft)]">({pkg.remainingSeats} left)</span>
              </div>
              {/* Progress Bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--panel-strong)] overflow-hidden">
                <div 
                  className="h-full bg-[var(--primary)] rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (pkg.confirmedSeats / pkg.maxSeats) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)] mb-2">Destinations Covered</div>
            <div className="flex flex-wrap gap-2">
              {pkg.destinations.map((dest, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]"></span>
                  {dest}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)] mb-2">About this Trip</div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-[var(--panel-subtle)] p-4 rounded-xl border border-[var(--border)]">
                {pkg.description}
              </p>
            </div>
          )}

          {/* Accommodation / Hotels */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)] mb-2">Accommodation & Hotels</div>
            {pkg.hotels && pkg.hotels.length > 0 ? (
              <div className="space-y-3">
                {pkg.hotels.map((h) => {
                  const roomPlanForHotel = pkg.hotelRoomPlan?.filter((p) => p.hotelId === h.id) || [];
                  const roomCount = roomPlanForHotel.reduce((sum, item) => sum + item.rooms, 0);

                  return (
                    <div key={h.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
                      <div className="flex items-center gap-3">
                        {h.image ? (
                          <img src={h.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-[var(--border)] shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-[var(--panel-strong)] flex items-center justify-center text-[var(--text-soft)] shrink-0 text-xl">
                            🏨
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[var(--text)]">{h.name}</div>
                          <div className="text-xs text-[var(--text-soft)]">{h.city}, {h.country}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {h.rating && (
                          <span className="text-xs font-semibold text-[var(--warning-text)] bg-[var(--panel-strong)] px-2 py-1 rounded-lg">
                            ★ {h.rating}
                          </span>
                        )}
                        <span className="text-xs font-medium bg-[var(--primary-soft)] text-[var(--primary)] px-2.5 py-1 rounded-lg border border-[var(--primary)]/10">
                          {roomCount} {roomCount === 1 ? 'room' : 'rooms'} allocated
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : pkg.hotel ? (
              (() => {
                const h = pkg.hotel;
                const roomPlanForHotel = pkg.hotelRoomPlan?.filter((p) => p.hotelId === h.id) || [];
                const roomCount = roomPlanForHotel.reduce((sum, item) => sum + item.rooms, 0);

                return (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
                    <div className="flex items-center gap-3">
                      {h.image ? (
                        <img src={h.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-[var(--border)] shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-[var(--panel-strong)] flex items-center justify-center text-[var(--text-soft)] shrink-0 text-xl">
                          🏨
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-[var(--text)]">{h.name}</div>
                        <div className="text-xs text-[var(--text-soft)]">{h.city}, {h.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {h.rating && (
                        <span className="text-xs font-semibold text-[var(--warning-text)] bg-[var(--panel-strong)] px-2 py-1 rounded-lg">
                          ★ {h.rating}
                        </span>
                      )}
                      <span className="text-xs font-medium bg-[var(--primary-soft)] text-[var(--primary)] px-2.5 py-1 rounded-lg border border-[var(--primary)]/10">
                        {roomCount} {roomCount === 1 ? 'room' : 'rooms'} allocated
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-[var(--text-soft)] italic">No hotel accommodation listed for this trip offer</p>
            )}
          </div>

          {/* Transport / Vehicle */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-soft)] mb-2">Transport & Vehicles</div>
            {pkg.vehicle ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
                <div className="flex items-center gap-3">
                  {pkg.vehicle.image ? (
                    <img src={pkg.vehicle.image} alt="" className="h-12 w-20 rounded-lg object-cover border border-[var(--border)] shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-[var(--panel-strong)] flex items-center justify-center text-[var(--text-soft)] shrink-0 text-xl">
                      🚌
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">
                      {pkg.vehicle.make} {pkg.vehicle.model}
                    </div>
                    <div className="text-xs text-[var(--text-soft)]">{pkg.vehicle.type} · {pkg.vehicle.capacity} Seats</div>
                  </div>
                </div>
                <div className="self-end sm:self-auto">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                    pkg.dedicatedVehicle
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-bg)]'
                      : 'bg-[var(--panel-strong)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}>
                    {pkg.dedicatedVehicle ? 'Dedicated vehicle' : 'Transfer-only vehicle'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-soft)] italic">No vehicle transport listed for this trip offer</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end border-t border-[var(--border)] px-6 py-3 bg-[var(--panel-subtle)]">
          <button id="footer-close-pkg-detail-modal-btn" onClick={onClose} className="h-9 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Close details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageList;
