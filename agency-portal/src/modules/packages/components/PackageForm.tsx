import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Hotel, Vehicle } from '../../../shared/types';
import {
  validateMinLength,
  validatePositiveNumber,
} from '../../../shared/utils/validators';
import { hotelsService } from '../../hotels/services/hotelsService';
import { createPackage, updatePackage } from '../store/packagesSlice';
import { packagesService } from '../services/packagesService';
import { transportService } from '../../transport/services/transportService';

type FormErrors = Record<string, string>;

const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const PackageForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditing = useMemo(() => Boolean(id), [id]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [destinations, setDestinations] = useState('');
  const [images, setImages] = useState('');
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [selectedHotelRooms, setSelectedHotelRooms] = useState<Record<string, number>>({});
  const [selectedHotelRoomTypes, setSelectedHotelRoomTypes] = useState<
    Record<string, Record<string, number>>
  >({});
  const [selectedHotelServices, setSelectedHotelServices] = useState<Record<string, string[]>>({});
  const [isHotelPickerOpen, setIsHotelPickerOpen] = useState(false);
  const [detailHotel, setDetailHotel] = useState<Hotel | null>(null);
  const [hotelSearch, setHotelSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const selectedHotels = useMemo(
    () => hotels.filter((item) => selectedHotelIds.includes(item.id)),
    [hotels, selectedHotelIds],
  );
  const filteredHotels = useMemo(() => {
    const query = hotelSearch.trim().toLowerCase();
    if (!query) {
      return hotels;
    }

    return hotels.filter((hotel) =>
      `${hotel.name} ${hotel.city} ${hotel.country}`.toLowerCase().includes(query),
    );
  }, [hotelSearch, hotels]);
  const selectedVehicle = useMemo(
    () => vehicles.find((item) => item.id === vehicleId) || null,
    [vehicleId, vehicles],
  );
  const getAvailableUnits = (hotel: Hotel): number =>
    (hotel.rooms || []).reduce(
      (sum, room) => sum + (room.availableQuantity ?? room.quantity ?? 0),
      0,
    );
  const getBookedRoomTypeTotal = (hotelId: string): number =>
    Object.values(selectedHotelRoomTypes[hotelId] || {}).reduce((sum, value) => sum + value, 0);
  const getBookedRoomTypeSummary = (hotel: Hotel): Array<{ roomType: string; quantity: number }> =>
    (hotel.rooms || [])
      .map((room) => ({
        roomType: room.type,
        quantity: selectedHotelRoomTypes[hotel.id]?.[room.id] || 0,
      }))
      .filter((entry) => entry.quantity > 0);

  useEffect(() => {
    let mounted = true;

    const loadInventory = async () => {
      try {
        const [hotelsResult, vehiclesResult] = await Promise.all([
          hotelsService.getHotels({ limit: 100, discovery: true }),
          transportService.getVehicles({ limit: 100 }),
        ]);

        if (!mounted) {
          return;
        }

        setHotels(hotelsResult.data);
        setVehicles(vehiclesResult.data);
      } catch (error: any) {
        if (mounted) {
          setInventoryError(error.message || 'Failed to load agency inventory');
        }
      }
    };

    loadInventory();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditing || !id) {
      return;
    }

    let mounted = true;

    const loadPackage = async () => {
      try {
        const tripPackage = await packagesService.getPackageById(id);
        if (!mounted) {
          return;
        }

        setName(tripPackage.name);
        setDescription(tripPackage.description || '');
        setPrice(String(tripPackage.price));
        setDuration(String(tripPackage.duration));
        setStartDate(
          tripPackage.startDate
            ? new Date(tripPackage.startDate).toISOString().slice(0, 10)
            : '',
        );
        setMaxSeats(String(tripPackage.maxSeats ?? 1));
        setSelectedHotelIds(
          tripPackage.hotelIds && tripPackage.hotelIds.length > 0
            ? tripPackage.hotelIds
            : tripPackage.hotelId
              ? [tripPackage.hotelId]
              : [],
        );
        setSelectedHotelRooms(
          Object.fromEntries(
            Object.entries(
              (tripPackage.hotelRoomPlan || []).reduce(
                (
                  acc: Record<string, number>,
                  entry: { hotelId: string; roomId: string; rooms: number },
                ) => {
                  acc[entry.hotelId] = (acc[entry.hotelId] || 0) + entry.rooms;
                  return acc;
                },
                {},
              ),
            ),
          ),
        );
        setSelectedHotelRoomTypes(
          (tripPackage.hotelRoomPlan || []).reduce(
            (
              acc: Record<string, Record<string, number>>,
              entry: { hotelId: string; roomId: string; rooms: number },
            ) => {
              acc[entry.hotelId] = {
                ...(acc[entry.hotelId] || {}),
                [entry.roomId]: entry.rooms,
              };
              return acc;
            },
            {},
          ),
        );
        setSelectedHotelServices({});
        setVehicleId(tripPackage.vehicleId || '');
        setDestinations(tripPackage.destinations.join(', '));
        setImages(tripPackage.images.join(', '));
        setIsActive(tripPackage.isActive);
      } catch (error: any) {
        if (mounted) {
          setFormError(error.message || 'Failed to load trip offer');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPackage();

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};
    const destinationList = splitList(destinations);
    const imageList = splitList(images);
    const hotelRoomPlan = selectedHotelIds.flatMap((hotelId) =>
      Object.entries(selectedHotelRoomTypes[hotelId] || {})
        .filter(([, rooms]) => Number(rooms) > 0)
        .map(([roomId, rooms]) => ({
          hotelId,
          roomId,
          rooms: Number(rooms),
        })),
    );

    const nameError = validateMinLength(name, 'Trip offer name', 2);
    if (nameError) {
      nextErrors.name = nameError;
    }

    const priceError = validatePositiveNumber(price, 'Price', 1);
    if (priceError) {
      nextErrors.price = priceError;
    }

    const durationError = validatePositiveNumber(duration, 'Duration', 1);
    if (durationError) {
      nextErrors.duration = durationError;
    }

    const seatsError = validatePositiveNumber(maxSeats, 'Max seats', 1);
    if (seatsError) {
      nextErrors.maxSeats = seatsError;
    }

    if (isActive && !startDate) {
      nextErrors.startDate = 'Start date is required for an active offer';
    }

    if (isActive && selectedHotelIds.length === 0) {
      nextErrors.hotelIds = 'Select at least one hotel before publishing this offer';
    }

    if (isActive && hotelRoomPlan.length === 0) {
      nextErrors.hotelRoomPlan = 'Select at least one room allocation before publishing this offer';
    }

    if (
      isActive &&
      selectedHotelIds.some((hotelId) => getBookedRoomTypeTotal(hotelId) <= 0)
    ) {
      nextErrors.hotelRoomPlan = 'Every selected hotel must include at least one room allocation';
    }

    if (destinationList.length === 0) {
      nextErrors.destinations = 'Add at least one destination';
    }

    if (imageList.some((value) => !isValidUrl(value))) {
      nextErrors.images = 'Each image must be a valid URL';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const hotelRoomPlan = selectedHotelIds.flatMap((hotelId) =>
      Object.entries(selectedHotelRoomTypes[hotelId] || {})
        .filter(([, rooms]) => Number(rooms) > 0)
        .map(([roomId, rooms]) => ({
          hotelId,
          roomId,
          rooms: Number(rooms),
        })),
    );
    const plannedHotelIds = Array.from(new Set(hotelRoomPlan.map((entry) => entry.hotelId)));

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      duration: Number(duration),
      startDate,
      maxSeats: Number(maxSeats),
      hotelId: plannedHotelIds[0] || selectedHotelIds[0] || null,
      hotelIds: plannedHotelIds.length > 0 ? plannedHotelIds : selectedHotelIds,
      hotelRoomPlan,
      vehicleId: vehicleId || null,
      destinations: splitList(destinations),
      images: splitList(images),
      isActive,
    };

    try {
      if (isEditing && id) {
        await dispatch(updatePackage({ id, data: payload }) as any).unwrap();
      } else {
        await dispatch(createPackage(payload) as any).unwrap();
      }

      navigate('/packages');
    } catch (error: any) {
      setFormError(error.message || 'Failed to save trip offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="surface px-6 py-14 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip offer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="surface space-y-6 px-6 py-6 md:px-8 md:py-8">
        {formError && (
          <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
            {formError}
          </div>
        )}

        {inventoryError && (
          <div className="rounded-[22px] border border-[var(--warning-bg)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-text)]">
            {inventoryError}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Offer name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="app-field"
              placeholder="Hunza spring tour"
            />
            {errors.name && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Price
            </label>
            <input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="app-field"
              placeholder="85000"
            />
            {errors.price && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="duration" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Duration (days)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="app-field"
              placeholder="5"
            />
            {errors.duration && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.duration}</p>}
          </div>

          <div>
            <label htmlFor="startDate" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="app-field"
            />
            {errors.startDate && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.startDate}</p>}
          </div>

          <div>
            <label htmlFor="maxSeats" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Max seats
            </label>
            <input
              id="maxSeats"
              type="number"
              min="1"
              value={maxSeats}
              onChange={(event) => setMaxSeats(event.target.value)}
              className="app-field"
              placeholder="12"
            />
            {errors.maxSeats && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.maxSeats}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="app-field min-h-[132px]"
              placeholder="Short summary of what is included."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Stay hotels</label>
            <button
              type="button"
              onClick={() => setIsHotelPickerOpen(true)}
              className="app-btn-secondary h-11 w-full justify-center text-sm"
            >
              {selectedHotelIds.length > 0
                ? `Selected ${selectedHotelIds.length} hotel${selectedHotelIds.length > 1 ? 's' : ''}`
                : 'Select hotels'}
            </button>
            {errors.hotelIds && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.hotelIds}</p>}
            {errors.hotelRoomPlan && (
              <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.hotelRoomPlan}</p>
            )}
          </div>

          <div>
            <label htmlFor="vehicleId" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Travel vehicle
            </label>
            <select
              id="vehicleId"
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="app-field"
            >
              <option value="">No vehicle selected</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>

          {(selectedHotels.length > 0 || selectedVehicle) && (
            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              {selectedHotels.length > 0 && (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] p-4 md:col-span-2">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Selected hotels ({selectedHotels.length})
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedHotels.map((hotel) => (
                      <div key={hotel.id} className="rounded-[16px] border border-[var(--border)] bg-[var(--panel)] p-3">
                        <div className="text-sm font-semibold text-[var(--text)]">{hotel.name}</div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {hotel.city}, {hotel.country}
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="text-xs text-[var(--text-soft)]">
                            Reserved rooms: <span className="font-semibold text-[var(--text)]">{getBookedRoomTypeTotal(hotel.id) || selectedHotelRooms[hotel.id] || 0}</span>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">Available: {getAvailableUnits(hotel)}</span>
                        </div>
                        {getBookedRoomTypeSummary(hotel).length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {getBookedRoomTypeSummary(hotel).map((entry) => (
                              <span
                                key={`${hotel.id}-${entry.roomType}`}
                                className="rounded-full border border-[var(--border)] bg-[var(--panel-subtle)] px-2 py-1 text-xs text-[var(--text-muted)]"
                              >
                                {entry.roomType}: {entry.quantity}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-[var(--text-muted)]">
                            Open the hotel details and choose exact rooms to reserve.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVehicle && (
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Selected vehicle
                  </div>
                  {selectedVehicle.images[0] && (
                    <img
                      src={selectedVehicle.images[0]}
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="mb-3 h-32 w-full rounded-[18px] object-cover"
                    />
                  )}
                  <div className="text-sm font-semibold text-[var(--text)]">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </div>
                  <div className="mt-1 text-sm text-[var(--text-muted)]">
                    {selectedVehicle.type} - {selectedVehicle.capacity} seats
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="destinations" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Destinations
            </label>
            <input
              id="destinations"
              value={destinations}
              onChange={(event) => setDestinations(event.target.value)}
              className="app-field"
              placeholder="Hunza, Attabad, Passu"
            />
            <p className="mt-2 text-xs text-[var(--text-soft)]">Separate destinations with commas.</p>
            {errors.destinations && (
              <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.destinations}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="images" className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Image URLs
            </label>
            <textarea
              id="images"
              value={images}
              onChange={(event) => setImages(event.target.value)}
              className="app-field min-h-[108px]"
              placeholder="https://... , https://..."
            />
            <p className="mt-2 text-xs text-[var(--text-soft)]">Optional. Separate each URL with a comma.</p>
            {errors.images && <p className="mt-2 text-sm text-[var(--danger-text)]">{errors.images}</p>}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => {
              if (event.target.checked && (selectedHotelIds.length === 0 || !startDate)) {
                setFormError('To publish this offer, select at least one hotel and start date first.');
                return;
              }
              setFormError(null);
              setIsActive(event.target.checked);
            }}
            className="h-4 w-4 rounded border-[var(--border)]"
          />
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">Published</div>
            <div className="text-sm text-[var(--text-muted)]">Turn this off to hide the offer.</div>
          </div>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/packages')}
            className="app-btn-secondary h-11 px-5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create trip offer'}
          </button>
        </div>
      </form>

      {isHotelPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[var(--text)]">Select Hotels</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Choose one or more hotels for this offer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHotelPickerOpen(false)}
                className="app-btn-secondary h-10 px-4 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <input
                value={hotelSearch}
                onChange={(event) => setHotelSearch(event.target.value)}
                className="app-field"
                placeholder="Search hotels by name or city"
              />
            </div>

            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto rounded-[16px] border border-[var(--border)] bg-[var(--panel-subtle)] p-3">
              {filteredHotels.length === 0 ? (
                <div className="px-2 py-4 text-sm text-[var(--text-muted)]">No hotels found.</div>
              ) : (
                filteredHotels.map((hotel) => {
                  const checked = selectedHotelIds.includes(hotel.id);

                  return (
                    <div
                      key={hotel.id}
                      className="rounded-[12px] border border-[var(--border)] bg-[var(--panel)] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedHotelIds((current) => [...current, hotel.id]);
                              setSelectedHotelRooms((current) => ({
                                ...current,
                                [hotel.id]: current[hotel.id] || 1,
                              }));
                              setSelectedHotelServices((current) => ({
                                ...current,
                                [hotel.id]: current[hotel.id] || [],
                              }));
                              return;
                            }
                            setSelectedHotelIds((current) => current.filter((idValue) => idValue !== hotel.id));
                            setSelectedHotelRooms((current) => {
                              const { [hotel.id]: _removed, ...rest } = current;
                              return rest;
                            });
                            setSelectedHotelRoomTypes((current) => {
                              const { [hotel.id]: _removed, ...rest } = current;
                              return rest;
                            });
                            setSelectedHotelServices((current) => {
                              const { [hotel.id]: _removed, ...rest } = current;
                              return rest;
                            });
                          }}
                          className="mt-1 h-4 w-4 rounded border-[var(--border)]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[var(--text)]">{hotel.name}</div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {hotel.city}, {hotel.country}
                          </div>
                          {getBookedRoomTypeSummary(hotel).length > 0 ? (
                            <div className="mt-1 space-y-1 text-xs text-[var(--text-soft)]">
                              {getBookedRoomTypeSummary(hotel).map((entry) => (
                                <div key={`${hotel.id}-${entry.roomType}`}>
                                  {entry.roomType}: {entry.quantity} booked
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetailHotel(hotel)}
                          className="app-btn-secondary h-9 px-3 text-xs"
                        >
                          Book room
                        </button>
                      </div>
                      {getBookedRoomTypeSummary(hotel).length > 0 ? (
                        <div className="mt-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                          Total rooms booked: {getBookedRoomTypeTotal(hotel.id)}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[var(--text-muted)]">
                {selectedHotelIds.length} selected
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHotelIds([]);
                    setSelectedHotelRooms({});
                    setSelectedHotelRoomTypes({});
                    setSelectedHotelServices({});
                  }}
                  className="app-btn-secondary h-10 px-4 text-sm"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsHotelPickerOpen(false)}
                  className="app-btn-primary h-10 px-4 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {detailHotel ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[var(--text)]">{detailHotel.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {detailHotel.city}, {detailHotel.country}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailHotel(null)}
                className="app-btn-secondary h-10 px-4 text-sm"
              >
                Close
              </button>
            </div>

            {detailHotel.description ? (
              <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--panel-subtle)] p-3">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Description</div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{detailHotel.description}</p>
              </div>
            ) : null}

            <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--panel-subtle)] p-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Hotel Services</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(detailHotel.services || []).length > 0 ? (
                  (detailHotel.services || []).map((service) => {
                    const isSelected =
                      selectedHotelServices[detailHotel.id]?.includes(service.id) || false;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          setSelectedHotelServices((current) => {
                            const existing = current[detailHotel.id] || [];
                            const next = existing.includes(service.id)
                              ? existing.filter((value) => value !== service.id)
                              : [...existing, service.id];

                            return {
                              ...current,
                              [detailHotel.id]: next,
                            };
                          })
                        }
                        className={`rounded-md border px-2 py-1 text-xs ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                            : 'border-[var(--border)] bg-[var(--panel)] text-[var(--text)]'
                        }`}
                      >
                        {service.name}
                        {service.price > 0 ? ` (PKR ${service.price.toLocaleString()})` : ''}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-sm text-[var(--text-muted)]">No hotel services listed.</span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--panel-subtle)] p-3">
              <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Room Inventory</div>
              <div className="mt-3 space-y-2">
                {(detailHotel.rooms || []).length > 0 ? (
                  (detailHotel.rooms || []).map((room) => (
                    <div
                      key={room.id}
                      className="rounded-[10px] border border-[var(--border)] bg-[var(--panel)] px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[var(--text)]">{room.type}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Capacity {room.capacity} • PKR {room.price.toLocaleString()}
                          </div>
                          {(room.amenities || []).length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(room.amenities || []).map((amenity: string) => (
                                <span
                                  key={`${room.id}-${amenity}`}
                                  className="rounded-md border border-[var(--border)] bg-[var(--panel-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-soft)]"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--text-soft)]">Available</div>
                          <div className="text-sm font-semibold text-[var(--text)]">
                            {room.availableQuantity ?? room.quantity ?? 0}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <label className="text-xs text-[var(--text-soft)]">Book rooms</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={
                              !selectedHotelIds.includes(detailHotel.id) ||
                              (selectedHotelRoomTypes[detailHotel.id]?.[room.id] || 0) <= 0
                            }
                            onClick={() => {
                              const currentQty = selectedHotelRoomTypes[detailHotel.id]?.[room.id] || 0;
                              const nextValue = Math.max(0, currentQty - 1);
                              setSelectedHotelRoomTypes((current) => ({
                                ...current,
                                [detailHotel.id]: {
                                  ...(current[detailHotel.id] || {}),
                                  [room.id]: nextValue,
                                },
                              }));
                              setSelectedHotelRooms((current) => ({
                                ...current,
                                [detailHotel.id]: Math.max(
                                  1,
                                  Object.values({
                                    ...(selectedHotelRoomTypes[detailHotel.id] || {}),
                                    [room.id]: nextValue,
                                  }).reduce((sum, value) => sum + value, 0) || 1,
                                ),
                              }));
                            }}
                            className="app-btn-secondary h-9 w-9 p-0 text-base disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Decrease ${room.type} rooms`}
                          >
                            -
                          </button>
                          <div className="app-field flex h-9 w-16 items-center justify-center text-sm">
                            {selectedHotelRoomTypes[detailHotel.id]?.[room.id] || 0}
                          </div>
                          <button
                            type="button"
                            disabled={
                              !selectedHotelIds.includes(detailHotel.id) ||
                              (selectedHotelRoomTypes[detailHotel.id]?.[room.id] || 0) >=
                                Math.max(0, room.availableQuantity ?? room.quantity ?? 0)
                            }
                            onClick={() => {
                              const maxAvailable = Math.max(0, room.availableQuantity ?? room.quantity ?? 0);
                              const currentQty = selectedHotelRoomTypes[detailHotel.id]?.[room.id] || 0;
                              const nextValue = Math.min(maxAvailable, currentQty + 1);
                              setSelectedHotelRoomTypes((current) => ({
                                ...current,
                                [detailHotel.id]: {
                                  ...(current[detailHotel.id] || {}),
                                  [room.id]: nextValue,
                                },
                              }));
                              setSelectedHotelRooms((current) => ({
                                ...current,
                                [detailHotel.id]: Math.max(
                                  1,
                                  Object.values({
                                    ...(selectedHotelRoomTypes[detailHotel.id] || {}),
                                    [room.id]: nextValue,
                                  }).reduce((sum, value) => sum + value, 0) || 1,
                                ),
                              }));
                            }}
                            className="app-btn-secondary h-9 w-9 p-0 text-base disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Increase ${room.type} rooms`}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          Max {Math.max(0, room.availableQuantity ?? room.quantity ?? 0)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[var(--text-muted)]">No room inventory listed for this hotel yet.</div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--panel-subtle)] p-3">
              <div className="text-sm text-[var(--text-muted)]">
                {getBookedRoomTypeTotal(detailHotel.id)} room(s) selected for this hotel
              </div>
              {!selectedHotelIds.includes(detailHotel.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHotelIds((current) =>
                      current.includes(detailHotel.id) ? current : [...current, detailHotel.id],
                    );
                    setSelectedHotelRooms((current) => ({
                      ...current,
                      [detailHotel.id]: Math.max(1, getBookedRoomTypeTotal(detailHotel.id) || 1),
                    }));
                  }}
                  className="app-btn-secondary h-9 px-3 text-xs"
                >
                  Add Hotel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDetailHotel(null)}
                  className="app-btn-primary h-9 px-3 text-xs"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PackageForm;
