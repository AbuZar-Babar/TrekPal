import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Hotel, Vehicle } from '../../../shared/types';
import { validateMinLength, validatePositiveNumber } from '../../../shared/utils/validators';
import { hotelsService } from '../../hotels/services/hotelsService';
import { createPackage, updatePackage } from '../store/packagesSlice';
import { packagesService } from '../services/packagesService';
import { transportService } from '../../transport/services/transportService';
import { formatCurrency } from '../../../shared/utils/formatters';

type FormErrors = Record<string, string>;
type HotelRoom = NonNullable<Hotel['rooms']>[number];

// ── Utilities ────────────────────────────────────────────────────────────────
const splitList = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);
const isValidUrl = (v: string) => { try { new URL(v); return true; } catch { return false; } };
const readError = (e: any) =>
  e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to save trip offer';

const computeWindow = (start: string, dur: string) => {
  const days = Number(dur);
  if (!start || !Number.isFinite(days) || days < 1) return null;
  const s = new Date(start); if (isNaN(s.getTime())) return null;
  s.setHours(0, 0, 0, 0);
  const e = new Date(s); e.setDate(e.getDate() + days);
  return { startDate: s.toISOString(), endDate: e.toISOString() };
};

const getRoomTotal  = (r: HotelRoom) => Math.max(0, r.quantity ?? 0);
const getRoomAvail  = (r: HotelRoom) => Math.max(0, r.availableQuantity ?? r.quantity ?? 0);
const getRoomBooked = (r: HotelRoom) => Math.max(0, getRoomTotal(r) - getRoomAvail(r));

// ── Small UI helpers ──────────────────────────────────────────────────────────
const FormSection = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
    <div className="border-b border-[var(--border)] bg-[var(--panel-subtle)] px-5 py-3">
      <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
      {hint && <div className="text-xs text-[var(--text-soft)] mt-0.5">{hint}</div>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) => (
  <div>
    {label && <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">{label}</label>}
    {children}
    {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-soft)]">{hint}</p>}
    {error && <p className="mt-1.5 text-xs text-[var(--danger-text)]">{error}</p>}
  </div>
);

const ToggleSwitch = ({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) => (
  <div
    onClick={() => !disabled && onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--panel-strong)]'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
  >
    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const PackageForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = useMemo(() => Boolean(id), [id]);

  // Form state
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState('');
  const [duration, setDuration]       = useState('');
  const [startDate, setStartDate]     = useState('');
  const [maxSeats, setMaxSeats]       = useState('');
  const [destinations, setDestinations] = useState('');
  const [images, setImages]           = useState('');
  const [isActive, setIsActive]       = useState(true);

  const [selectedHotelIds, setSelectedHotelIds]     = useState<string[]>([]);
  const [_selectedHotelRooms, setSelectedHotelRooms] = useState<Record<string, number>>({});
  const [selectedHotelRoomTypes, setSelectedHotelRoomTypes] = useState<Record<string, Record<string, number>>>({});
  const [selectedHotelServices, setSelectedHotelServices]   = useState<Record<string, string[]>>({});

  const [vehicleId, setVehicleId]     = useState('');
  const [dedicatedVehicle, setDedicatedVehicle] = useState(true);
  const [hotels, setHotels]           = useState<Hotel[]>([]);
  const [vehicles, setVehicles]       = useState<Vehicle[]>([]);

  const [isHotelPickerOpen, setIsHotelPickerOpen] = useState(false);
  const [isVehiclePickerOpen, setIsVehiclePickerOpen] = useState(false);
  const [detailHotel, setDetailHotel] = useState<Hotel | null>(null);
  const [hotelSearch, setHotelSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  const [errors, setErrors]           = useState<FormErrors>({});
  const [formError, setFormError]     = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [loading, setLoading]         = useState(isEditing);
  const [submitting, setSubmitting]   = useState(false);

  // Derived
  const eligibleHotels  = useMemo(() => hotels.filter((h) => !isActive || h.status === 'APPROVED'), [hotels, isActive]);
  const selectedHotels  = useMemo(() => eligibleHotels.filter((h) => selectedHotelIds.includes(h.id)), [eligibleHotels, selectedHotelIds]);
  const filteredHotels  = useMemo(() => {
    const q = hotelSearch.trim().toLowerCase();
    return q ? eligibleHotels.filter((h) => `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(q)) : eligibleHotels;
  }, [hotelSearch, eligibleHotels]);
  const reservationWindow = useMemo(() => computeWindow(startDate, duration), [startDate, duration]);
  const hasWindow       = Boolean(reservationWindow);
  const destTags        = useMemo(() => splitList(destinations), [destinations]);
  const endDateDisplay  = useMemo(() => {
    if (!reservationWindow) return null;
    return new Date(reservationWindow.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [reservationWindow]);

  const getAvailableUnits = (h: Hotel) => (h.rooms || []).reduce((s, r) => s + getRoomAvail(r), 0);
  const getBookedTotal    = (hid: string) => Object.values(selectedHotelRoomTypes[hid] || {}).reduce((s, v) => s + v, 0);
  const getRoomSummary    = (h: Hotel) => (h.rooms || [])
    .map((r) => ({ roomType: r.type, quantity: selectedHotelRoomTypes[h.id]?.[r.id] || 0 }))
    .filter((e) => e.quantity > 0);

  // Effects — inventory load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [hotelsResult, vehiclesResult] = await Promise.all([
          hotelsService.getHotels({ limit: 100, discovery: true, ...(reservationWindow ? { startDate: reservationWindow.startDate, endDate: reservationWindow.endDate } : {}) }),
          transportService.getMarketplaceVehicles({
            limit: 100,
            status: 'APPROVED',
            ...(reservationWindow ? {
              startDate: reservationWindow.startDate,
              endDate: reservationWindow.endDate,
              dedicatedVehicle,
            } : {}),
          }),
        ]);
        if (!mounted) return;
        setHotels(hotelsResult.data); setVehicles(vehiclesResult.data);
        if (!hotelsResult.data.length) setInventoryError('No hotels found in the marketplace.');
        else if (!hotelsResult.data.some((h) => h.status === 'APPROVED')) setInventoryError('No approved marketplace hotels available.');
        else setInventoryError(null);
      } catch (e: any) { if (mounted) setInventoryError(e.message || 'Failed to load marketplace'); }
    })();
    return () => { mounted = false; };
  }, [reservationWindow?.startDate, reservationWindow?.endDate, dedicatedVehicle]);

  // Clear hotel selections if dates cleared
  useEffect(() => {
    if (reservationWindow) return;
    setSelectedHotelIds([]); setSelectedHotelRooms({}); setSelectedHotelRoomTypes({}); setSelectedHotelServices({}); setIsHotelPickerOpen(false); setDetailHotel(null);
  }, [reservationWindow]);

  // Clamp room selections when availability changes
  useEffect(() => {
    if (!reservationWindow) return;
    const map = new Map(hotels.map((h) => [h.id, h]));
    let changed = false;
    const nrt: Record<string, Record<string, number>> = {};
    const nr: Record<string, number> = {};
    selectedHotelIds.forEach((hid) => {
      const h = map.get(hid); if (!h) { changed = true; return; }
      const cur = selectedHotelRoomTypes[hid] || {};
      const next: Record<string, number> = {};
      Object.entries(cur).forEach(([rid, cnt]) => {
        const room = (h.rooms || []).find((r) => r.id === rid); if (!room) { changed = true; return; }
        const c = Math.min(cnt, getRoomAvail(room)); if (c !== cnt) changed = true;
        if (c > 0) next[rid] = c;
      });
      nrt[hid] = next; nr[hid] = Object.values(next).reduce((s, v) => s + v, 0);
    });
    if (!changed) return;
    setSelectedHotelRoomTypes(nrt); setSelectedHotelRooms(nr);
  }, [hotels, reservationWindow, selectedHotelIds, selectedHotelRoomTypes]);

  // Load existing package for editing
  useEffect(() => {
    if (!isEditing || !id) return;
    let mounted = true;
    (async () => {
      try {
        const pkg = await packagesService.getPackageById(id);
        if (!mounted) return;
        setName(pkg.name); setDescription(pkg.description || '');
        setPrice(String(pkg.price)); setDuration(String(pkg.duration));
        setStartDate(pkg.startDate ? new Date(pkg.startDate).toISOString().slice(0, 10) : '');
        setMaxSeats(String(pkg.maxSeats ?? 1));
        setSelectedHotelIds(pkg.hotelIds?.length ? pkg.hotelIds : pkg.hotelId ? [pkg.hotelId] : []);
        setSelectedHotelRooms(Object.fromEntries(Object.entries((pkg.hotelRoomPlan || []).reduce((a: Record<string, number>, e: any) => { a[e.hotelId] = (a[e.hotelId] || 0) + e.rooms; return a; }, {}))));
        setSelectedHotelRoomTypes((pkg.hotelRoomPlan || []).reduce((a: Record<string, Record<string, number>>, e: any) => { a[e.hotelId] = { ...(a[e.hotelId] || {}), [e.roomId]: e.rooms }; return a; }, {}));
        setSelectedHotelServices({});
        setVehicleId(pkg.vehicleId || '');
        setDedicatedVehicle(pkg.dedicatedVehicle ?? true);
        setDestinations(pkg.destinations.join(', '));
        setImages(pkg.images.join(', '));
        setIsActive(pkg.isActive);
      } catch (e: any) { if (mounted) setFormError(e.message || 'Failed to load offer'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id, isEditing]);

  // Validation
  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    const destList = splitList(destinations);
    const imgList  = splitList(images);
    const roomPlan = selectedHotelIds.flatMap((hid) =>
      Object.entries(selectedHotelRoomTypes[hid] || {}).filter(([, r]) => Number(r) > 0)
        .map(([rid, r]) => ({ hotelId: hid, roomId: rid, rooms: Number(r) }))
    );
    const e1 = validateMinLength(name, 'Offer name', 2);      if (e1) errs.name = e1;
    const e2 = validatePositiveNumber(price, 'Price', 1);      if (e2) errs.price = e2;
    const e3 = validatePositiveNumber(duration, 'Duration', 1); if (e3) errs.duration = e3;
    const e4 = validatePositiveNumber(maxSeats, 'Max seats', 1); if (e4) errs.maxSeats = e4;
    if (isActive && !startDate) errs.startDate = 'Required for an active offer';
    if (isActive && !selectedHotelIds.length) errs.hotelIds = 'Select at least one hotel to publish';
    if (isActive && !roomPlan.length) errs.hotelRoomPlan = 'Allocate rooms before publishing';
    if (isActive && selectedHotelIds.some((hid) => getBookedTotal(hid) <= 0)) errs.hotelRoomPlan = 'Every hotel needs at least one room';
    if (!destList.length) errs.destinations = 'Add at least one destination';
    if (imgList.some((u) => !isValidUrl(u))) errs.images = 'Each image must be a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) return;
    setSubmitting(true);
    const roomPlan = selectedHotelIds.flatMap((hid) =>
      Object.entries(selectedHotelRoomTypes[hid] || {}).filter(([, r]) => Number(r) > 0)
        .map(([rid, r]) => ({ hotelId: hid, roomId: rid, rooms: Number(r) }))
    );
    const plannedHotelIds = Array.from(new Set(roomPlan.map((e) => e.hotelId)));
    const payload = {
      name: name.trim(), description: description.trim() || undefined,
      price: Number(price), duration: Number(duration), startDate, maxSeats: Number(maxSeats),
      hotelId: plannedHotelIds[0] || selectedHotelIds[0] || null,
      hotelIds: plannedHotelIds.length ? plannedHotelIds : selectedHotelIds,
      hotelRoomPlan: roomPlan, vehicleId: vehicleId || null,
      dedicatedVehicle,
      destinations: splitList(destinations), images: splitList(images), isActive,
    };
    try {
      if (isEditing && id) await dispatch(updatePackage({ id, data: payload }) as any).unwrap();
      else await dispatch(createPackage(payload) as any).unwrap();
      navigate('/packages');
    } catch (e: any) { setFormError(readError(e)); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-4">
          <button
            type="button"
            onClick={() => navigate('/packages')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
              {isEditing ? 'Edit offer' : 'New offer'}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-soft)]">
              {isEditing ? 'Update your trip package details' : 'Create a new trip package for travelers'}
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-5 rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
            {formError}
          </div>
        )}
        {inventoryError && (
          <div className="mb-5 rounded-xl border border-[var(--warning-bg)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-text)]">
            {inventoryError}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* ── Left: main form ─────────────────────────────── */}
          <div className="space-y-5">

            <FormSection title="Offer details">
              <div className="space-y-4">
                <Field label="Name" error={errors.name}>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="app-field" placeholder="e.g. Hunza Spring Valley Tour" />
                </Field>
                <Field label="Description">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    rows={4} className="app-field min-h-[100px]"
                    placeholder="What's included? What makes this trip special?" />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Schedule & pricing">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Start date" error={errors.startDate}>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="app-field" />
                </Field>
                <Field label="Duration (days)" error={errors.duration}>
                  <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)}
                    className="app-field" placeholder="5" />
                </Field>
                <Field label="Price / person (PKR)" error={errors.price}>
                  <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="app-field" placeholder="85000" />
                </Field>
                <Field label="Max seats" error={errors.maxSeats}>
                  <input type="number" min="1" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)}
                    className="app-field" placeholder="12" />
                </Field>
              </div>
              {endDateDisplay && (
                <div className="mt-3 rounded-lg bg-[var(--primary-soft)] px-3 py-2 text-xs text-[var(--primary)]">
                  Trip ends on <span className="font-semibold">{endDateDisplay}</span>
                </div>
              )}
            </FormSection>

            <FormSection title="Destinations" hint="Comma-separated list of places covered">
              <Field label="" error={errors.destinations}>
                <input value={destinations} onChange={(e) => setDestinations(e.target.value)}
                  className="app-field" placeholder="Hunza, Attabad Lake, Passu Cones" />
              </Field>
              {destTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {destTags.map((t, i) => (
                    <span key={i} className="rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </FormSection>

            <FormSection title="Photos" hint="Optional — comma-separated image URLs">
              <Field label="" error={errors.images}>
                <textarea value={images} onChange={(e) => setImages(e.target.value)}
                  rows={3} className="app-field min-h-[80px]"
                  placeholder="https://images.unsplash.com/…" />
              </Field>
              {splitList(images).filter(isValidUrl).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {splitList(images).filter(isValidUrl).slice(0, 4).map((url, i) => (
                    <img key={i} src={url} alt="" className="h-16 w-24 rounded-lg object-cover border border-[var(--border)]" />
                  ))}
                </div>
              )}
            </FormSection>
          </div>

          {/* ── Right: sidebar ──────────────────────────────── */}
          <div className="space-y-4">

            {/* Accommodation */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">Accommodation</div>
                  {!hasWindow && <div className="text-[10px] text-[var(--text-soft)]">Set dates first</div>}
                </div>
                {hasWindow && (
                  <button type="button" onClick={() => setIsHotelPickerOpen(true)}
                    className="h-7 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                    {selectedHotelIds.length ? `${selectedHotelIds.length} selected` : 'Pick hotels'}
                  </button>
                )}
              </div>
              <div className="p-4">
                {!hasWindow ? (
                  <p className="text-xs text-center text-[var(--text-soft)] py-2">Enter start date and duration</p>
                ) : selectedHotels.length === 0 ? (
                  <p className="text-xs text-center text-[var(--text-soft)] py-2">No hotels selected</p>
                ) : (
                  <div className="space-y-2">
                    {selectedHotels.map((h) => {
                      const summary = getRoomSummary(h);
                      return (
                        <div key={h.id} className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[var(--text)] truncate">{h.name}</div>
                              <div className="text-[10px] text-[var(--text-soft)]">{h.city}, {h.country}</div>
                            </div>
                            <button type="button" onClick={() => setDetailHotel(h)}
                              className="shrink-0 text-[10px] font-semibold text-[var(--primary)] hover:underline">
                              Rooms
                            </button>
                          </div>
                          {summary.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {summary.map((s) => (
                                <span key={s.roomType} className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                                  {s.quantity}× {s.roomType}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-[10px] text-[var(--warning-text)]">No rooms — click Rooms</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.hotelIds && <p className="mt-2 text-xs text-[var(--danger-text)]">{errors.hotelIds}</p>}
                {errors.hotelRoomPlan && <p className="mt-1 text-xs text-[var(--danger-text)]">{errors.hotelRoomPlan}</p>}
              </div>
            </div>

            {/* Transport */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">Transport</div>
                  <div className="text-[10px] text-[var(--text-soft)]">Optional</div>
                </div>
                <button type="button" onClick={() => setIsVehiclePickerOpen(true)}
                  className="h-7 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                  {vehicleId ? 'Change' : 'Select'}
                </button>
              </div>
              <div className="p-4 space-y-3">
                {/* Dedicated / Transfer toggle */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text)]">
                        {dedicatedVehicle ? '🚗 Dedicated' : '🔁 Transfer'}
                      </div>
                      <div className="text-[10px] text-[var(--text-soft)] mt-0.5">
                        {dedicatedVehicle
                          ? 'Vehicle stays with travelers the whole trip'
                          : 'Drop-off on day 1, pick-up on last day only'}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={dedicatedVehicle}
                      onChange={(v) => {
                        setDedicatedVehicle(v);
                        // Clear selection if current vehicle won't be available in new mode
                        const v_ = vehicles.find((x) => x.id === vehicleId);
                        if (v_ && v_.isAvailableOnDates === false) setVehicleId('');
                      }}
                    />
                  </div>
                </div>

                {/* Selected vehicle preview */}
                {!vehicleId ? (
                  <p className="text-xs text-center text-[var(--text-soft)] py-2">No vehicle selected</p>
                ) : vehicles.find((v) => v.id === vehicleId) ? (
                  (() => {
                    const v = vehicles.find((v) => v.id === vehicleId)!;
                    const isUnavailable = v.isAvailableOnDates === false;
                    return (
                      <div className={`rounded-lg border overflow-hidden ${isUnavailable ? 'border-[var(--danger-bg)] opacity-70' : 'border-[var(--border)]'} bg-[var(--panel-subtle)]`}>
                        {v.images?.[0] && <img src={v.images[0]} alt="" className="h-24 w-full object-cover" />}
                        <div className="px-3 py-2.5">
                          <div className="text-xs font-semibold text-[var(--text)]">{v.make} {v.model}</div>
                          <div className="text-[10px] text-[var(--text-soft)]">{v.type} · {v.capacity} seats</div>
                          {isUnavailable && (
                            <div className="mt-1.5 rounded-md bg-[var(--danger-bg)] px-2 py-1 text-[10px] text-[var(--danger-text)]">
                              ⚠ Not available for these dates
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-center text-[var(--text-soft)] py-2">Vehicle not found</p>
                )}
              </div>
            </div>

            {/* Publish + save */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">Published</div>
                  <div className="text-xs text-[var(--text-soft)]">Visible to travelers</div>
                </div>
                <ToggleSwitch checked={isActive} onChange={(v) => {
                  if (v && (selectedHotelIds.length === 0 || !startDate)) {
                    setFormError('Select at least one hotel and a start date before publishing.');
                    return;
                  }
                  setFormError(null); setIsActive(v);
                }} />
              </div>
              <div className="flex gap-2 p-4">
                <button type="button" onClick={() => navigate('/packages')}
                  className="flex-1 h-9 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 h-9 rounded-lg bg-[var(--primary)] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Hotel picker modal */}
      {isHotelPickerOpen && (
        <HotelPickerModal
          isActive={isActive}
          filteredHotels={filteredHotels}
          selectedHotelIds={selectedHotelIds}
          selectedHotelRoomTypes={selectedHotelRoomTypes}
          hotelSearch={hotelSearch}
          hasWindow={hasWindow}
          getAvailableUnits={getAvailableUnits}
          getRoomSummary={getRoomSummary}
          onSearchChange={setHotelSearch}
          onToggleHotel={(hotel, checked) => {
            if (checked) {
              setSelectedHotelIds((c) => [...c, hotel.id]);
              setSelectedHotelRooms((c) => ({ ...c, [hotel.id]: c[hotel.id] || 1 }));
              setSelectedHotelServices((c) => ({ ...c, [hotel.id]: c[hotel.id] || [] }));
            } else {
              setSelectedHotelIds((c) => c.filter((i) => i !== hotel.id));
              setSelectedHotelRooms(({ [hotel.id]: _a, ...rest }) => rest);
              setSelectedHotelRoomTypes(({ [hotel.id]: _b, ...rest }) => rest);
              setSelectedHotelServices(({ [hotel.id]: _c, ...rest }) => rest);
            }
          }}
          onClear={() => { setSelectedHotelIds([]); setSelectedHotelRooms({}); setSelectedHotelRoomTypes({}); setSelectedHotelServices({}); }}
          onDone={() => setIsHotelPickerOpen(false)}
          onDetailHotel={setDetailHotel}
        />
      )}

      {/* Vehicle picker modal */}
      {isVehiclePickerOpen && (
        <VehiclePickerModal
          vehicles={vehicles}
          selectedVehicleId={vehicleId}
          vehicleSearch={vehicleSearch}
          hasDates={Boolean(reservationWindow)}
          onSearchChange={setVehicleSearch}
          onSelectVehicle={setVehicleId}
          onDone={() => setIsVehiclePickerOpen(false)}
        />
      )}

      {/* Room detail modal */}
      {detailHotel && (
        <RoomDetailModal
          hotel={detailHotel}
          selectedHotelIds={selectedHotelIds}
          selectedHotelRoomTypes={selectedHotelRoomTypes}
          selectedHotelServices={selectedHotelServices}
          getBookedTotal={getBookedTotal}
          onRoomChange={(hid, rid, next) => {
            setSelectedHotelRoomTypes((c) => ({ ...c, [hid]: { ...(c[hid] || {}), [rid]: next } }));
            setSelectedHotelRooms((c) => ({ ...c, [hid]: Math.max(1, Object.values({ ...(selectedHotelRoomTypes[hid] || {}), [rid]: next }).reduce((s, v) => s + v, 0) || 1) }));
          }}
          onServiceToggle={(hid, sid) => {
            setSelectedHotelServices((c) => {
              const ex = c[hid] || [];
              return { ...c, [hid]: ex.includes(sid) ? ex.filter((v) => v !== sid) : [...ex, sid] };
            });
          }}
          onAddHotel={(hotel) => {
            setSelectedHotelIds((c) => c.includes(hotel.id) ? c : [...c, hotel.id]);
            setSelectedHotelRooms((c) => ({ ...c, [hotel.id]: Math.max(1, getBookedTotal(hotel.id) || 1) }));
          }}
          onClose={() => setDetailHotel(null)}
        />
      )}
    </>
  );
};

// ── Hotel Picker Modal ────────────────────────────────────────────────────────
interface HotelPickerProps {
  isActive: boolean; filteredHotels: Hotel[]; selectedHotelIds: string[];
  selectedHotelRoomTypes: Record<string, Record<string, number>>; hotelSearch: string;
  hasWindow: boolean;
  getAvailableUnits: (h: Hotel) => number;
  getRoomSummary: (h: Hotel) => { roomType: string; quantity: number }[];
  onSearchChange: (v: string) => void;
  onToggleHotel: (h: Hotel, checked: boolean) => void;
  onClear: () => void; onDone: () => void;
  onDetailHotel: (h: Hotel) => void;
}

const HotelPickerModal = ({
  isActive, filteredHotels, selectedHotelIds, hotelSearch, hasWindow,
  getAvailableUnits, getRoomSummary,
  onSearchChange, onToggleHotel, onClear, onDone, onDetailHotel,
}: HotelPickerProps) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '88vh' }}>
        {/* Header */}
        <div className="shrink-0 border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">Select hotels</h3>
              <p className="text-xs text-[var(--text-soft)]">
                {isActive ? 'Only approved marketplace hotels shown' : 'Choose hotels for this draft'}
              </p>
            </div>
            <button onClick={onDone} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={hotelSearch} onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or city…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredHotels.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">No hotels found</div>
          ) : filteredHotels.map((hotel) => {
            const checked = selectedHotelIds.includes(hotel.id);
            const summary = getRoomSummary(hotel);
            const avail   = getAvailableUnits(hotel);
            return (
              <div key={hotel.id} className={`rounded-xl border transition-colors ${checked ? 'border-[var(--primary)] bg-[var(--primary-soft)]' : 'border-[var(--border)] bg-[var(--panel-subtle)]'}`}>
                <div className="flex items-start gap-3 px-4 py-3">
                  <div
                    onClick={() => onToggleHotel(hotel, !checked)}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${checked ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)] bg-[var(--panel)]'}`}
                  >
                    {checked && (
                      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--text)]">{hotel.name}</span>
                      {hotel.status === 'APPROVED' && (
                        <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[9px] font-semibold text-[var(--success-text)]">APPROVED</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-soft)]">{hotel.city}, {hotel.country}</div>
                    {hasWindow && <div className="mt-0.5 text-[10px] text-[var(--text-soft)]">{avail} rooms available for dates</div>}
                  </div>
                  {checked && (
                    <button type="button" onClick={() => onDetailHotel(hotel)}
                      className="shrink-0 h-7 rounded-lg border border-[var(--primary)] px-2.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors">
                      Rooms
                    </button>
                  )}
                </div>
                {checked && (
                  <div className="border-t border-[var(--primary-soft)] px-4 pb-3 pt-2">
                    {summary.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {summary.map((s) => (
                          <span key={s.roomType} className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                            {s.quantity}× {s.roomType}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-[var(--warning-text)]">⚠ No rooms allocated — click "Rooms"</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
          <span className="text-sm text-[var(--text-muted)]">{selectedHotelIds.length} selected</span>
          <div className="flex gap-2">
            <button onClick={onClear} type="button" className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              Clear all
            </button>
            <button onClick={onDone} type="button" className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Room Detail Modal ─────────────────────────────────────────────────────────
interface RoomDetailProps {
  hotel: Hotel; selectedHotelIds: string[];
  selectedHotelRoomTypes: Record<string, Record<string, number>>;
  selectedHotelServices: Record<string, string[]>;
  getBookedTotal: (id: string) => number;
  onRoomChange: (hid: string, rid: string, next: number) => void;
  onServiceToggle: (hid: string, sid: string) => void;
  onAddHotel: (h: Hotel) => void;
  onClose: () => void;
}

const RoomDetailModal = ({
  hotel, selectedHotelIds, selectedHotelRoomTypes, selectedHotelServices,
  getBookedTotal, onRoomChange, onServiceToggle, onAddHotel, onClose,
}: RoomDetailProps) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const isSelected = selectedHotelIds.includes(hotel.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="shrink-0 border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">{hotel.name}</h3>
              <p className="text-xs text-[var(--text-soft)]">{hotel.city}, {hotel.country}</p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {hotel.description && <p className="text-sm text-[var(--text-muted)]">{hotel.description}</p>}

          {(hotel.services || []).length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {(hotel.services || []).map((svc) => {
                  const sel = selectedHotelServices[hotel.id]?.includes(svc.id) || false;
                  return (
                    <button key={svc.id} type="button" onClick={() => onServiceToggle(hotel.id, svc.id)}
                      className={`h-7 rounded-full border px-3 text-xs font-medium transition-colors ${sel ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}>
                      {svc.name}{svc.price > 0 ? ` · ${formatCurrency(svc.price)}` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Room allocation</div>
            {(hotel.rooms || []).length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No room inventory listed.</p>
            ) : (
              <div className="space-y-2">
                {(hotel.rooms || []).map((room) => {
                  const avail   = getRoomAvail(room);
                  const current = selectedHotelRoomTypes[hotel.id]?.[room.id] || 0;
                  return (
                    <div key={room.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[var(--text)]">{room.type}</div>
                          <div className="text-xs text-[var(--text-soft)]">Capacity {room.capacity} · {formatCurrency(room.price)}/night</div>
                          {(room.amenities || []).length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {(room.amenities || []).slice(0, 4).map((a: string) => (
                                <span key={a} className="rounded-md bg-[var(--panel-strong)] px-1.5 py-0.5 text-[10px] text-[var(--text-soft)]">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[10px] text-[var(--text-soft)]">{getRoomBooked(room)}/{getRoomTotal(room)} booked</div>
                          <div className="text-xs font-semibold text-[var(--text)]">{avail} free</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-[var(--text-soft)]">Reserve</span>
                        <div className="flex items-center gap-1">
                          <button type="button" disabled={!isSelected || current <= 0}
                            onClick={() => onRoomChange(hotel.id, room.id, Math.max(0, current - 1))}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-base font-bold text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 transition-colors">
                            −
                          </button>
                          <div className="flex h-7 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] text-sm font-semibold tabular-nums text-[var(--text)]">
                            {current}
                          </div>
                          <button type="button" disabled={!isSelected || current >= avail}
                            onClick={() => onRoomChange(hotel.id, room.id, Math.min(avail, current + 1))}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] text-base font-bold text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 transition-colors">
                            +
                          </button>
                        </div>
                        <span className="text-xs text-[var(--text-soft)]">of {avail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
          <span className="text-sm text-[var(--text-muted)]">{getBookedTotal(hotel.id)} rooms allocated</span>
          {!isSelected ? (
            <button type="button" onClick={() => { onAddHotel(hotel); onClose(); }}
              className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
              Add hotel
            </button>
          ) : (
            <button type="button" onClick={onClose}
              className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Vehicle Picker Modal ───────────────────────────────────────────────────────
interface VehiclePickerProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  vehicleSearch: string;
  hasDates?: boolean;
  onSearchChange: (v: string) => void;
  onSelectVehicle: (id: string) => void;
  onDone: () => void;
}

const VehiclePickerModal = ({
  vehicles, selectedVehicleId, vehicleSearch, hasDates, onSearchChange, onSelectVehicle, onDone,
}: VehiclePickerProps) => {
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const filtered = vehicleSearch.trim()
    ? vehicles.filter((v) => `${v.make} ${v.model} ${v.type}`.toLowerCase().includes(vehicleSearch.toLowerCase()))
    : vehicles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-2xl" style={{ maxHeight: '88vh' }}>
        <div className="shrink-0 border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">Select vehicle</h3>
              <p className="text-xs text-[var(--text-soft)]">
                {hasDates ? 'Availability shown for your trip dates' : 'Set trip dates to see real-time availability'}
              </p>
            </div>
            <button onClick={onDone} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[var(--text-soft)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={vehicleSearch} onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by make, model, or type…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">No vehicles found</div>
          ) : (
            <div className="space-y-3">
              {/* No-vehicle option */}
              <button type="button" onClick={() => { onSelectVehicle(''); onDone(); }}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                  !selectedVehicleId
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-sm'
                    : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--panel-subtle)]'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel-strong)] text-lg">—</div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">No vehicle</div>
                    <div className="text-xs text-[var(--text-soft)]">Travelers arrange their own transport</div>
                  </div>
                  {!selectedVehicleId && (
                    <div className="ml-auto shrink-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* Vehicle cards */}
              {filtered.map((v) => {
                const isUnavailable = hasDates && v.isAvailableOnDates === false;
                const isSelected = selectedVehicleId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => { if (!isUnavailable) { onSelectVehicle(v.id); onDone(); } }}
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
          <p className="text-xs text-[var(--text-soft)]">{filtered.filter((v) => !hasDates || v.isAvailableOnDates !== false).length} available</p>
          <button onClick={onDone} type="button" className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageForm;
