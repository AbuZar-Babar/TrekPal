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
  driver: {
    name: string;
    phone: string;
    licenseNumber: string;
  };
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
  driver: {
    name: '',
    phone: '',
    licenseNumber: '',
  },
};

const currentYear = new Date().getFullYear();

const VehicleForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<VehicleFormData>(initialState);
  const [loading, setLoading] = useState(false);
  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<0 | 1>(0);

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
          driver: {
            name: vehicle.driver.name || '',
            phone: vehicle.driver.phone || '',
            licenseNumber: vehicle.driver.licenseNumber || '',
          },
        });
      })
      .catch(() => setError('Failed to load vehicle details'))
      .finally(() => setFetchingVehicle(false));
  }, [id, isEdit]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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

  const handleDriverChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      driver: {
        ...current.driver,
        [name]: value,
      },
    }));
  };

  const validateVehicleStep = (): string | null => {
    if (!formData.type) {
      return 'Select a vehicle type';
    }
    if (!formData.vehicleNumber.trim()) {
      return 'Registration number is required';
    }
    if (!formData.make.trim()) {
      return 'Make is required';
    }
    if (!formData.model.trim()) {
      return 'Model is required';
    }
    if (formData.year < 1900 || formData.year > currentYear + 1) {
      return 'Enter a valid model year';
    }
    if (formData.capacity < 1) {
      return 'Seats must be at least 1';
    }
    if (formData.pricePerDay < 0) {
      return 'Price per day cannot be negative';
    }
    return null;
  };

  const validateDriverStep = (): string | null => {
    if (!formData.driver.name.trim()) {
      return 'Driver name is required';
    }
    return null;
  };

  const handleNextStep = () => {
    const stepError = validateVehicleStep();
    if (stepError) {
      setError(stepError);
      return;
    }

    setError(null);
    setActiveStep(1);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const vehicleError = validateVehicleStep();
    if (vehicleError) {
      setError(vehicleError);
      setActiveStep(0);
      return;
    }

    const driverError = validateDriverStep();
    if (driverError) {
      setError(driverError);
      setActiveStep(1);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isEdit && id) {
        await dispatch(updateVehicle({ id, data: formData }) as any).unwrap();
      } else {
        await dispatch(createVehicle(formData) as any).unwrap();
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
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading vehicle workspace...</p>
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
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveStep(0)}
              className={`rounded-[22px] border px-4 py-4 text-left transition ${
                activeStep === 0
                  ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                  : 'border-[var(--border)] bg-[var(--panel-subtle)]'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Step 1
              </div>
              <div className="mt-2 text-base font-semibold text-[var(--text)]">Vehicle details</div>
              <div className="mt-1 text-sm text-[var(--text-muted)]">
                Vehicle info, gallery, and availability.
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeStep === 1) {
                  setActiveStep(1);
                }
              }}
              className={`rounded-[22px] border px-4 py-4 text-left transition ${
                activeStep === 1
                  ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                  : 'border-[var(--border)] bg-[var(--panel-subtle)]'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Step 2
              </div>
              <div className="mt-2 text-base font-semibold text-[var(--text)]">Driver details</div>
              <div className="mt-1 text-sm text-[var(--text-muted)]">
                Assign the driver before submitting.
              </div>
            </button>
          </div>
        </div>

        {activeStep === 0 ? (
          <>
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
                    max={currentYear + 1}
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
          </>
        ) : (
          <div className="surface px-6 py-6">
            <div className="surface-header px-0 pt-0">
              <div>
                <h2>Driver information</h2>
                <p>Every vehicle must have one assigned driver before it is saved.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Driver name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.driver.name}
                  onChange={handleDriverChange}
                  required
                  className="app-field"
                  placeholder="Ahmad Khan"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Driver phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.driver.phone}
                  onChange={handleDriverChange}
                  className="app-field"
                  placeholder="+92 300 1234567"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--text)]">License number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.driver.licenseNumber}
                  onChange={handleDriverChange}
                  className="app-field"
                  placeholder="LIC-12345"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm text-[var(--text-muted)]">
              <div className="font-semibold text-[var(--text)]">
                {formData.make || 'Vehicle'} {formData.model || ''} {formData.vehicleNumber ? `(${formData.vehicleNumber})` : ''}
              </div>
              <div className="mt-1">
                {formData.type || 'Vehicle type not selected'} · {formData.capacity} seats · PKR {formData.pricePerDay.toLocaleString()} per day
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/transport')}
            className="app-btn-secondary h-11 px-5 text-sm"
          >
            Cancel
          </button>
          {activeStep === 1 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveStep(0);
                }}
                className="app-btn-secondary h-11 px-5 text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : isEdit ? 'Update vehicle' : 'Create vehicle'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className="app-btn-primary h-11 px-5 text-sm"
            >
              Continue to driver
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
