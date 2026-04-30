import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { createVehicle, fetchVehicles, updateVehicle } from '../store/transportSlice';
import { transportService } from '../services/transportService';
import ImageGalleryInput from '../../../shared/components/forms/ImageGalleryInput';

interface VehicleFormData {
  type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  pricePerDay: number;
  images: string[];
  isAvailable: boolean;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
}

const initialState: VehicleFormData = {
  type: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  capacity: 4,
  pricePerDay: 0,
  images: [],
  isAvailable: true,
  vehicleNumber: '',
  driverName: '',
  driverPhone: '',
  driverLicense: '',
};

const VehicleForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<VehicleFormData>(initialState);
  const [loading, setLoading] = useState(false);
  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    setFetchingVehicle(true);
    transportService
      .getVehicleById(id)
      .then((vehicle) => {
        setFormData({
          type: vehicle.type,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          capacity: vehicle.capacity,
          pricePerDay: vehicle.pricePerDay,
          images: vehicle.images || [],
          isAvailable: vehicle.isAvailable,
          vehicleNumber: vehicle.vehicleNumber || '',
          driverName: vehicle.driverName || '',
          driverPhone: vehicle.driverPhone || '',
          driverLicense: vehicle.driverLicense || '',
        });
      })
      .catch(() => setError('Failed to load vehicle details'))
      .finally(() => setFetchingVehicle(false));
  }, [id, isEdit]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]:
        type === 'number'
          ? Number(value) || 0
          : type === 'checkbox'
            ? (event.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit && id) {
        await dispatch(updateVehicle({ id, data: formData }) as any);
      } else {
        await dispatch(createVehicle(formData) as any);
      }
      navigate('/transport');
      dispatch(fetchVehicles({ limit: 20 }) as any);
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingVehicle) {
    return (
      <div className="surface px-6 py-14 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">{isEdit ? 'Update vehicle' : 'Add vehicle'}</h2>
      </section>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Vehicle information</h2>
                <p>Core fleet data used in pricing and dispatch planning.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Vehicle type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="app-field"
                >
                  <option value="">Select type</option>
                  <option value="CAR">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="VAN">Van</option>
                  <option value="BUS">Bus</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Registration number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                  className="app-field"
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Make</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="app-field"
                  placeholder="Toyota"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="app-field"
                  placeholder="Corolla"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="app-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Seats</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="app-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Price per day (PKR)</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="app-field"
                />
              </div>
            </div>
        </div>

        <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Driver information</h2>
                <p>Attach the operator details needed for real bookings.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Driver name</label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  required
                  className="app-field"
                  placeholder="Driver full name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Driver phone</label>
                <input
                  type="tel"
                  name="driverPhone"
                  value={formData.driverPhone}
                  onChange={handleChange}
                  required
                  className="app-field"
                  placeholder="+92 300 1234567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Driver license</label>
                <input
                  type="text"
                  name="driverLicense"
                  value={formData.driverLicense}
                  onChange={handleChange}
                  required
                  className="app-field"
                  placeholder="License number"
                />
              </div>
            </div>
        </div>

        <ImageGalleryInput
          title="Images"
          images={formData.images}
          uploadImage={transportService.uploadImage}
          onChange={(images) => setFormData((current) => ({ ...current, images }))}
        />

        <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Availability</h2>
                <p>Set whether the vehicle should be assignable right now.</p>
              </div>
            </div>
            <div className="mt-5">
              <label className="flex items-center gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                />
                <span className="text-sm leading-7 text-[var(--text)]">Vehicle is currently available for booking</span>
              </label>
            </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/transport')}
            className="app-btn-secondary h-11 px-5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEdit ? 'Update vehicle' : 'Create vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
