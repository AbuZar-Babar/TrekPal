import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../store';
import { Driver } from '../../../shared/types';
import { fetchDrivers, createDriver, updateDriver } from '../store/driversSlice';
import { formatDate } from '../../../shared/utils/formatters';

type DriverFormData = {
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const emptyForm: DriverFormData = {
  name: '',
  phone: '',
  licenseNumber: '',
  status: 'ACTIVE',
};

const DriversPage = () => {
  const dispatch = useDispatch();
  const { drivers, loading, saving, error } = useSelector((state: RootState) => state.drivers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DriverFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDrivers() as any);
  }, [dispatch]);

  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedId) ?? null,
    [drivers, selectedId],
  );

  useEffect(() => {
    if (!selectedDriver) {
      setFormData(emptyForm);
      return;
    }

    setFormData({
      name: selectedDriver.name,
      phone: selectedDriver.phone || '',
      licenseNumber: selectedDriver.licenseNumber || '',
      status: selectedDriver.status,
    });
  }, [selectedDriver]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const startCreate = () => {
    setSelectedId(null);
    setFormData(emptyForm);
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    try {
      if (selectedDriver) {
        await dispatch(updateDriver({ id: selectedDriver.id, data: formData }) as any).unwrap();
      } else {
        await dispatch(createDriver(formData) as any).unwrap();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save driver');
      return;
    }

    if (!selectedDriver) {
      setFormData(emptyForm);
    }
    dispatch(fetchDrivers() as any);
  };

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">Drivers</h2>
      </section>

      {(error || formError) && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {formError || error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="surface px-6 py-6">
          <div className="surface-header px-0 pt-0">
            <div>
              <h2>Driver roster</h2>
              <p>Each vehicle must be paired with one active driver.</p>
            </div>
            <button type="button" onClick={startCreate} className="app-btn-primary app-btn-md">
              New driver
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-12 text-sm text-[var(--text-muted)]">
              No drivers yet. Add your first driver before creating another vehicle.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {drivers.map((driver: Driver) => {
                const active = selectedId === driver.id;
                return (
                  <button
                    key={driver.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(driver.id);
                      setFormError(null);
                    }}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      active
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                        : 'border-[var(--border)] bg-[var(--panel-subtle)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-[var(--text)]">{driver.name}</div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">{driver.phone || 'No phone provided'}</div>
                      </div>
                      <span className={`app-pill ${driver.status === 'ACTIVE' ? 'app-pill-success' : 'app-pill-neutral'}`}>
                        {driver.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-[var(--text-soft)] sm:grid-cols-2">
                      <div>License: {driver.licenseNumber || '--'}</div>
                      <div>Vehicle: {driver.vehicleLabel || 'Unassigned'}</div>
                      <div>Added: {formatDate(driver.createdAt)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="surface px-6 py-6">
          <div className="surface-header px-0 pt-0">
            <div>
              <h2>{selectedDriver ? 'Edit driver' : 'Add driver'}</h2>
              <p>Drivers stay under the provider account and are assigned to a single vehicle.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Driver name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="app-field"
                placeholder="Driver full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="app-field"
                placeholder="+92 300 1234567"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">License number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="app-field"
                placeholder="License number"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="app-field"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {selectedDriver?.vehicleLabel ? (
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm text-[var(--text-muted)]">
                Current vehicle assignment: <span className="font-semibold text-[var(--text)]">{selectedDriver.vehicleLabel}</span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={startCreate} className="app-btn-secondary h-11 px-5 text-sm">
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : selectedDriver ? 'Update driver' : 'Create driver'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default DriversPage;
