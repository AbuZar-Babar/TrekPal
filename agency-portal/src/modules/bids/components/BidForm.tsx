import { FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Bid, BidRevision, Hotel, OfferDetails, TripRequest, Vehicle } from '../../../shared/types';
import { formatCurrency, formatDateRange } from '../../../shared/utils/formatters';
import { transportService } from '../../transport/services/transportService';
import { fetchHotels } from '../../hotels/store/hotelsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface BidFormProps {
  tripRequest: TripRequest;
  loading: boolean;
  existingBid?: Bid;
  onCancel: () => void;
  onSubmit: (payload: {
    price: number;
    description?: string;
    offerDetails: OfferDetails;
    hotelId?: string;
    roomId?: string;
    vehicleId?: string;
    dedicatedVehicle?: boolean;
  }) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const pretty = (v: string) =>
  v.toLowerCase().split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// ── Thread message ────────────────────────────────────────────────────────────
const ThreadMessage = ({ revision, isLatest }: { revision: BidRevision; isLatest: boolean }) => {
  const isAgency = revision.actorRole === 'AGENCY';
  const inclusions = [
    revision.offerDetails.stayIncluded && 'Stay',
    revision.offerDetails.transportIncluded && 'Transport',
    revision.offerDetails.mealsIncluded && 'Meals',
  ].filter(Boolean) as string[];

  return (
    <div className={`flex flex-col gap-1 ${isAgency ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)] ${isAgency ? 'flex-row-reverse' : ''}`}>
        <span>{isAgency ? 'Your offer' : 'Traveler counter'}</span>
        <span>{shortDate(revision.createdAt)}</span>
        {isLatest && (
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isAgency ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'}`}>
            Latest
          </span>
        )}
      </div>

      <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
        isAgency
          ? 'rounded-tr-sm bg-[var(--primary-soft)] text-[var(--text)]'
          : 'rounded-tl-sm border border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text)]'
      }`}>
        <div className="text-xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(revision.price)}
        </div>

        {/* Hotel/vehicle chips on agency revisions */}
        {isAgency && (revision.hotel || revision.vehicle) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {revision.hotel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                🏨 {revision.hotel.name}{revision.room ? ` · ${revision.room.type}` : ''}
              </span>
            )}
            {revision.vehicle && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                🚗 {revision.vehicle.make} {revision.vehicle.model}
              </span>
            )}
          </div>
        )}

        {inclusions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inclusions.map((inc) => (
              <span
                key={inc}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isAgency
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--panel-strong)] text-[var(--text-muted)]'
                }`}
              >
                {inc}
              </span>
            ))}
          </div>
        )}

        {revision.description && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {revision.description}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Toggle switch ─────────────────────────────────────────────────────────────
const Toggle = ({
  checked, disabled, label, description, value, placeholder, onChange, onToggle, extra,
}: {
  checked: boolean; disabled: boolean; label: string; description: string;
  value: string; placeholder: string;
  onChange: (v: string) => void; onToggle: (v: boolean) => void;
  extra?: React.ReactNode;
}) => (
  <div className={`rounded-xl border transition-colors ${checked ? 'border-[var(--primary-soft)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-[var(--panel-subtle)]'}`}>
    <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3">
      <div>
        <div className="text-sm font-medium text-[var(--text)]">{label}</div>
        <div className="text-xs text-[var(--text-soft)]">{description}</div>
      </div>
      <div
        onClick={() => !disabled && onToggle(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--panel-strong)]'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </label>
    <AnimatePresence initial={false}>
      {checked && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden px-4 pb-3 space-y-2"
        >
          {extra}
          <textarea
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="app-field min-h-[72px] text-sm"
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ bid }: { bid?: Bid }) => {
  if (!bid) return null;
  if (bid.status === 'ACCEPTED')
    return <span className="rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-text)]">Accepted</span>;
  if (bid.status === 'REJECTED')
    return <span className="rounded-full bg-[var(--danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--danger-text)]">Rejected</span>;
  if (bid.awaitingActionBy === 'AGENCY')
    return <span className="rounded-full bg-[var(--warning-bg)] px-3 py-1 text-xs font-semibold text-[var(--warning-text)]">● Your move</span>;
  return <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">Traveler reviewing</span>;
};

// ── Inline hotel picker ───────────────────────────────────────────────────────
const HotelPicker = ({
  selectedHotelId, selectedRoomId, disabled,
  onSelect,
}: {
  selectedHotelId: string | null;
  selectedRoomId: string | null;
  disabled: boolean;
  onSelect: (hotelId: string | null, roomId: string | null, hotelName: string, roomType: string) => void;
}) => {
  const dispatch = useDispatch();
  const { hotels } = useSelector((state: RootState) => state.hotels);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pickedHotel, setPickedHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    if (open) dispatch(fetchHotels({ limit: 100, discovery: true }) as any);
  }, [open, dispatch]);

  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);
  const selectedRoom = selectedHotel?.rooms?.find((r) => r.id === selectedRoomId);

  const filtered = hotels.filter((h) =>
    `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(search.toLowerCase())
  );

  if (disabled) {
    if (!selectedHotelId) return null;
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs">
        <span className="font-semibold text-[var(--text)]">🏨 {selectedHotel?.name ?? selectedHotelId}</span>
        {selectedRoom && <span className="text-[var(--text-soft)]"> · {selectedRoom.type}</span>}
      </div>
    );
  }

  return (
    <div>
      {selectedHotelId ? (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--primary-soft)] bg-[var(--primary-soft)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--text)] flex-1">
            🏨 {selectedHotel?.name ?? selectedHotelId}
            {selectedRoom && <span className="font-normal text-[var(--text-soft)]"> · {selectedRoom.type}</span>}
          </span>
          <button type="button" onClick={() => onSelect(null, null, '', '')} className="text-[var(--text-soft)] hover:text-[var(--danger-text)]">✕</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 text-xs text-[var(--text-soft)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7h14v14M9 11h2m2 0h2M9 15h2m2 0h2" />
          </svg>
          Select hotel from marketplace
        </button>
      )}

      {/* Hotel modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '80vh' }}>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                {pickedHotel ? `Select room — ${pickedHotel.name}` : 'Select hotel'}
              </h3>
              <button type="button" onClick={() => { setOpen(false); setPickedHotel(null); setSearch(''); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]">✕</button>
            </div>

            {!pickedHotel ? (
              <>
                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input autoFocus type="text" placeholder="Search hotels…" value={search} onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none" />
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 130px)' }}>
                  {filtered.map((h) => (
                    <button key={h.id} type="button" onClick={() => setPickedHotel(h)}
                      className="flex w-full items-center gap-3 border-b border-[var(--border)] px-5 py-3 text-left hover:bg-[var(--panel-subtle)] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{h.name}</div>
                        <div className="text-xs text-[var(--text-soft)]">{h.city}, {h.country}</div>
                      </div>
                      {h.rating && <span className="text-xs text-[var(--warning-text)]">★ {h.rating}</span>}
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="flex h-24 items-center justify-center text-sm text-[var(--text-soft)]">No hotels found</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-[var(--border)] px-5 py-3">
                  <button type="button" onClick={() => setPickedHotel(null)} className="text-xs text-[var(--primary)] hover:underline">← Back to hotels</button>
                  <div className="mt-1 text-sm font-semibold text-[var(--text)]">{pickedHotel.name}</div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 150px)' }}>
                  {(pickedHotel.rooms || []).length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-sm text-[var(--text-soft)]">No rooms configured</div>
                  ) : (
                    (pickedHotel.rooms || []).map((r) => (
                      <button key={r.id} type="button"
                        onClick={() => { onSelect(pickedHotel.id, r.id, pickedHotel.name, r.type); setOpen(false); setPickedHotel(null); setSearch(''); }}
                        className="flex w-full items-center justify-between border-b border-[var(--border)] px-5 py-3 hover:bg-[var(--panel-subtle)] transition-colors">
                        <div className="text-sm font-semibold text-[var(--text)]">{r.type}</div>
                        <div className="text-xs text-[var(--text-soft)]">PKR {Number(r.price || 0).toLocaleString()} / night</div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Inline vehicle picker ─────────────────────────────────────────────────────
const VehiclePicker = ({
  selectedVehicleId, disabled, onSelect, startDate, endDate, dedicatedVehicle,
}: {
  selectedVehicleId: string | null;
  disabled: boolean;
  onSelect: (vehicleId: string | null, label: string) => void;
  startDate?: string;
  endDate?: string;
  dedicatedVehicle?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');

  useLayoutEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    transportService.getMarketplaceVehicles({
      limit: 100,
      status: 'APPROVED',
      startDate,
      endDate,
      dedicatedVehicle,
    })
      .then((r) => setVehicles(r.data.filter((v) => v.status === 'APPROVED')))
      .catch(() => {});
  }, [open, startDate, endDate, dedicatedVehicle]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedLabel = selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : selectedVehicleId ?? '';

  const filtered = vehicles.filter((v) =>
    `${v.make} ${v.model} ${v.type}`.toLowerCase().includes(search.toLowerCase())
  );

  const hasDates = Boolean(startDate && endDate);

  if (disabled) {
    if (!selectedVehicleId) return null;
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs">
        <span className="font-semibold text-[var(--text)]">🚗 {selectedLabel}</span>
      </div>
    );
  }

  return (
    <div>
      {selectedVehicleId ? (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--primary-soft)] bg-[var(--primary-soft)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--text)] flex-1">🚗 {selectedLabel}</span>
          <button type="button" onClick={() => onSelect(null, '')} className="text-[var(--text-soft)] hover:text-[var(--danger-text)]">✕</button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="flex h-8 w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 text-xs text-[var(--text-soft)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14M7 18a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          Select vehicle from marketplace
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
          <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '88vh' }}>
            <div className="shrink-0 border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text)]">Select vehicle</h3>
                  <p className="text-xs text-[var(--text-soft)]">
                    {hasDates ? 'Availability shown for trip dates' : 'Set trip dates to see real-time availability'}
                  </p>
                </div>
                <button type="button" onClick={() => { setOpen(false); setSearch(''); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by make, model, or type…"
                  className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">No vehicles found</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((v) => {
                    const isUnavailable = !v.isAvailable || (hasDates && v.isAvailableOnDates === false);
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => { if (!isUnavailable) { onSelect(v.id, `${v.make} ${v.model}`); setOpen(false); setSearch(''); } }}
                        className={`relative w-full rounded-xl border overflow-hidden text-left transition-all ${
                          isUnavailable
                            ? 'border-[var(--border)] opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-md ring-2 ring-[var(--primary)] ring-offset-1'
                              : 'border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md'
                        }`}
                      >
                        {/* Vehicle image */}
                        {v.images?.[0] ? (
                          <div className="relative h-28 w-full overflow-hidden">
                            <img src={v.images[0]} alt={`${v.make} ${v.model}`} className="h-full w-full object-cover" />
                            {isUnavailable && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <span className="rounded-full bg-[var(--danger-bg)] px-3 py-1 text-xs font-semibold text-[var(--danger-text)]">
                                  Unavailable
                                </span>
                              </div>
                            )}
                            {isSelected && !isUnavailable && (
                              <div className="absolute right-2 top-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-16 w-full items-center justify-center bg-[var(--panel-strong)] text-2xl">
                            🚗
                            {isUnavailable && (
                              <span className="ml-2 rounded-full bg-[var(--danger-bg)] px-3 py-0.5 text-xs font-semibold text-[var(--danger-text)]">
                                Unavailable
                              </span>
                            )}
                          </div>
                        )}

                        {/* Vehicle details */}
                        <div className="px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-[var(--text)]">{v.make} {v.model}</span>
                                {isSelected && !isUnavailable && (
                                  <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Selected</span>
                                )}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--text-soft)]">
                                <span>{v.type}</span>
                                <span>·</span>
                                <span>{v.capacity} seats</span>
                                {v.year && <><span>·</span><span>{v.year}</span></>}
                              </div>
                            </div>
                            {v.pricePerDay > 0 && (
                              <div className="shrink-0 text-right">
                                <div className="text-xs font-semibold text-[var(--text)]">
                                  PKR {v.pricePerDay.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-[var(--text-soft)]">/day</div>
                              </div>
                            )}
                          </div>

                          {/* Availability badge */}
                          {hasDates && (
                            <div className={`mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold ${
                              isUnavailable
                                ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                                : 'bg-[var(--success-bg,#dcfce7)] text-[var(--success-text,#16a34a)]'
                            }`}>
                              {isUnavailable ? (
                                <><span>✕</span><span>Booked for these dates</span></>
                              ) : (
                                <><span>✓</span><span>Available</span></>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-between border-t border-[var(--border)] gap-2 px-5 py-3">
              <p className="text-xs text-[var(--text-soft)]">{filtered.filter((v) => v.isAvailable && (!hasDates || v.isAvailableOnDates !== false)).length} available</p>
              <button type="button" onClick={() => { setOpen(false); setSearch(''); }} className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const BidForm = ({ tripRequest, loading, existingBid, onCancel, onSubmit }: BidFormProps) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [price, setPrice]                   = useState('');
  const [description, setDescription]       = useState('');
  const [stayIncluded, setStayIncluded]     = useState(false);
  const [stayDetails, setStayDetails]       = useState('');
  const [transportIncluded, setTransportIncluded] = useState(false);
  const [transportDetails, setTransportDetails]   = useState('');
  const [mealsIncluded, setMealsIncluded]   = useState(false);
  const [mealDetails, setMealDetails]       = useState('');
  const [extras, setExtras]                 = useState('');
  const [error, setError]                   = useState<string | null>(null);

  // Hotel/vehicle selection
  const [selectedHotelId, setSelectedHotelId]   = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId]     = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [dedicatedVehicle, setDedicatedVehicle] = useState(true);

  useEffect(() => {
    if (!existingBid) {
      setPrice(''); setDescription(''); setStayIncluded(false); setStayDetails('');
      setTransportIncluded(false); setTransportDetails('');
      setMealsIncluded(false); setMealDetails(''); setExtras('');
      setSelectedHotelId(null); setSelectedRoomId(null); setSelectedVehicleId(null);
      setDedicatedVehicle(true);
      return;
    }
    setPrice(existingBid.price.toString());
    setDescription(existingBid.description || '');
    setStayIncluded(existingBid.offerDetails.stayIncluded);
    setStayDetails(existingBid.offerDetails.stayDetails);
    setTransportIncluded(existingBid.offerDetails.transportIncluded);
    setTransportDetails(existingBid.offerDetails.transportDetails);
    setMealsIncluded(existingBid.offerDetails.mealsIncluded);
    setMealDetails(existingBid.offerDetails.mealDetails);
    setExtras(existingBid.offerDetails.extras);
    setSelectedHotelId(existingBid.hotelId ?? null);
    setSelectedRoomId(existingBid.roomId ?? null);
    setSelectedVehicleId(existingBid.vehicleId ?? null);
    setDedicatedVehicle(existingBid.dedicatedVehicle ?? true);
  }, [existingBid]);

  const isReadOnly = Boolean(
    existingBid && (existingBid.status !== 'PENDING' || existingBid.awaitingActionBy !== 'AGENCY'),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isReadOnly) { onCancel(); return; }
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) { setError('Enter a valid offer amount.'); return; }
    setError(null);
    await onSubmit({
      price: num,
      description: description.trim() || undefined,
      offerDetails: {
        stayIncluded, stayDetails: stayDetails.trim(),
        transportIncluded, transportDetails: transportDetails.trim(),
        mealsIncluded, mealDetails: mealDetails.trim(),
        extras: extras.trim(),
      },
      hotelId: selectedHotelId ?? undefined,
      roomId: selectedRoomId ?? undefined,
      vehicleId: selectedVehicleId ?? undefined,
      dedicatedVehicle,
    });
  };

  const revisions = existingBid?.revisions ?? [];
  const hasThread = revisions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onCancel}
      />

      <motion.div
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-[var(--panel)] shadow-2xl sm:rounded-2xl"
        style={{ maxHeight: '92vh' }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                {existingBid ? 'Offer thread' : 'New offer'}
              </h2>
              <StatusBadge bid={existingBid} />
            </div>
            <p className="mt-0.5 text-sm text-[var(--text-soft)]">
              {tripRequest.destination} · {formatDateRange(tripRequest.startDate, tripRequest.endDate)} · {tripRequest.travelers} travelers
            </p>
          </div>
          <button type="button" onClick={onCancel}
            className="h-8 w-8 shrink-0 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Trip brief strip */}
        <div className="shrink-0 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--border)] bg-[var(--panel-subtle)] px-6 py-3">
          {[
            { label: 'Budget', value: formatCurrency(tripRequest.budget) },
            { label: 'Stay', value: pretty(tripRequest.tripSpecs.stayType) },
            { label: 'Rooms', value: `${tripRequest.tripSpecs.roomCount}× ${pretty(tripRequest.tripSpecs.roomPreference)}` },
            { label: 'Meals', value: pretty(tripRequest.tripSpecs.mealPlan) },
            { label: 'Transport', value: tripRequest.tripSpecs.transportRequired ? pretty(tripRequest.tripSpecs.transportType) : 'Not required' },
            { label: 'Competing bids', value: tripRequest.bidsCount },
            existingBid ? { label: 'Revisions', value: existingBid.revisionCount } : null,
          ].filter(Boolean).map((item) => (
            <div key={item!.label}>
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-soft)]">{item!.label}</div>
              <div className="text-xs font-semibold text-[var(--text)]">{item!.value}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Left: form */}
            <div className={`flex-1 min-w-0 overflow-y-auto px-6 py-5 space-y-4 ${hasThread ? 'border-r border-[var(--border)]' : ''}`}>

              {/* Status context */}
              {!isReadOnly && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${
                  existingBid?.awaitingActionBy === 'AGENCY'
                    ? 'border-[var(--warning-bg)] bg-[var(--warning-bg)] text-[var(--warning-text)]'
                    : 'border-[var(--border)] bg-[var(--panel-subtle)] text-[var(--text-muted)]'
                }`}>
                  {!existingBid
                    ? 'Build a clear offer: set your price, toggle what\'s included, and add any extras.'
                    : 'The traveler has countered. Revise the price or scope and send your response.'}
                </div>
              )}

              {isReadOnly && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3 text-sm text-[var(--text-muted)]">
                  {existingBid?.status === 'ACCEPTED'
                    ? '✓ This offer was accepted and converted to a booking.'
                    : existingBid?.status === 'REJECTED'
                    ? 'This thread is closed — another agency was selected.'
                    : 'Waiting for the traveler to review your latest offer.'}
                </div>
              )}

              {/* Price + note */}
              {!isReadOnly && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                      Total offer (PKR)
                    </label>
                    <input
                      type="number" min="1" step="1" value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="app-field text-lg font-semibold"
                      placeholder="e.g. 85000"
                    />
                    {tripRequest.budget && (
                      <p className="mt-1 text-xs text-[var(--text-soft)]">
                        Traveler budget: {formatCurrency(tripRequest.budget)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
                      Message to traveler
                    </label>
                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                      className="app-field min-h-[80px] text-sm"
                      placeholder="Explain your pricing, what makes your offer stand out, or any adjustments from the last revision." />
                  </div>
                </div>
              )}

              {/* Inclusions */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  What's included
                </div>

                <Toggle
                  checked={stayIncluded} disabled={isReadOnly}
                  label="Accommodation" description="Hotel, resort, or guesthouse"
                  value={stayDetails} placeholder="Additional notes about the stay…"
                  onToggle={setStayIncluded} onChange={setStayDetails}
                  extra={
                    <HotelPicker
                      selectedHotelId={selectedHotelId}
                      selectedRoomId={selectedRoomId}
                      disabled={isReadOnly}
                      onSelect={(hId, rId) => { setSelectedHotelId(hId); setSelectedRoomId(rId); }}
                    />
                  }
                />

                <Toggle
                  checked={transportIncluded} disabled={isReadOnly}
                  label="Transport" description="Vehicles, transfers, driver"
                  value={transportDetails} placeholder="Additional notes about transport…"
                  onToggle={setTransportIncluded} onChange={setTransportDetails}
                  extra={
                    <div className="space-y-2">
                      {/* Dedicated / Transfer mode toggle */}
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2">
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-semibold text-[var(--text)]">
                              {dedicatedVehicle ? '🚗 Dedicated vehicle' : '🔁 Transfer only'}
                            </div>
                            <div className="text-[10px] text-[var(--text-soft)] mt-0.5">
                              {dedicatedVehicle
                                ? 'Vehicle stays with travelers for the full trip'
                                : 'Drop-off on day 1, pick-up on last day'}
                            </div>
                          </div>
                          <div
                            onClick={() => !isReadOnly && setDedicatedVehicle((v) => !v)}
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${dedicatedVehicle ? 'bg-[var(--primary)]' : 'bg-[var(--panel-strong)]'} ${isReadOnly ? 'opacity-50' : 'cursor-pointer'}`}
                          >
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${dedicatedVehicle ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </div>
                        </label>
                      </div>
                      <VehiclePicker
                        selectedVehicleId={selectedVehicleId}
                        disabled={isReadOnly}
                        onSelect={(vId) => setSelectedVehicleId(vId)}
                        startDate={tripRequest.startDate}
                        endDate={tripRequest.endDate}
                        dedicatedVehicle={dedicatedVehicle}
                      />
                    </div>
                  }
                />

                <Toggle
                  checked={mealsIncluded} disabled={isReadOnly}
                  label="Meals" description="Breakfast, half-board, full-board"
                  value={mealDetails} placeholder="Meal plan details, dietary options…"
                  onToggle={setMealsIncluded} onChange={setMealDetails}
                />
              </div>

              {/* Extras */}
              {!isReadOnly && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                    Extras
                  </label>
                  <textarea rows={2} value={extras} onChange={(e) => setExtras(e.target.value)}
                    className="app-field min-h-[64px] text-sm"
                    placeholder="Guides, sightseeing, welcome kits, flexible timing…" />
                </div>
              )}
            </div>

            {/* Right: thread */}
            {hasThread && (
              <div className="hidden w-80 shrink-0 overflow-y-auto px-5 py-5 lg:flex lg:flex-col">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  Negotiation thread
                </div>
                <div className="flex flex-col gap-4">
                  {revisions.map((rev, i) => (
                    <ThreadMessage key={rev.id} revision={rev} isLatest={i === revisions.length - 1} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4">
            {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
            {!error && <div />}

            <div className="flex gap-2">
              <button type="button" onClick={onCancel}
                className="h-9 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {isReadOnly ? 'Close' : 'Cancel'}
              </button>
              {!isReadOnly && (
                <button type="submit" disabled={loading}
                  className="h-9 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Saving…' : existingBid ? 'Send revision' : 'Submit offer'}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BidForm;
