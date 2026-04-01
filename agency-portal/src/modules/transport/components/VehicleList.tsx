import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { formatCurrency, formatDate, formatStatusLabel } from '../../../shared/utils/formatters';
import { deleteVehicle, fetchVehicles } from '../store/transportSlice';

const VehicleList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vehicles, loading, error, pagination } = useSelector((state: RootState) => state.transport);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  const stats = [
    { label: 'Fleet total', value: vehicles.length },
    { label: 'Available', value: vehicles.filter((vehicle) => vehicle.isAvailable).length },
    { label: 'Unavailable', value: vehicles.filter((vehicle) => !vehicle.isAvailable).length },
    { label: 'With images', value: vehicles.filter((vehicle) => vehicle.images.length > 0).length },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.16fr,0.84fr]">
        <div className="app-card px-6 py-6 md:px-8 md:py-8">
          <div className="app-section-label">Vehicles</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Transport inventory for marketplace packaging</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Keep the fleet structured and available so traveler briefs can be quoted with credible vehicle coverage and transport pricing without waiting on admin verification.
          </p>
        </div>

        <div className="app-panel-dark px-6 py-6">
          <div className="app-section-label text-white/55">Fleet pulse</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Vehicle inventory overview</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">{stat.label}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="app-card px-5 py-5">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto] lg:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by make, model, or registration..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="app-field pl-11"
            />
            <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => navigate('/transport/new')}
            className="app-btn-primary h-11 px-5 text-sm"
          >
            Add vehicle
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            {search ? 'No vehicles match the current search' : 'No vehicles in the fleet yet'}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            {search
              ? 'Adjust the search query to widen the result set.'
              : 'Create your first vehicle listing to support transport-inclusive traveler offers.'}
          </p>
        </div>
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <table className="app-table min-w-[1120px]">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Capacity and price</th>
                <th>Availability</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="font-semibold tracking-tight text-[var(--text)]">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      {vehicle.year} • {formatStatusLabel(vehicle.type)}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold tracking-tight text-[var(--text)]">{vehicle.vehicleNumber || '--'}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      Driver {vehicle.driverName || '--'}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold tracking-tight text-[var(--text)]">{vehicle.capacity} seat(s)</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{formatCurrency(vehicle.pricePerDay)}</div>
                  </td>
                  <td>
                    <span className={`app-pill ${vehicle.isAvailable ? 'app-pill-success' : 'app-pill-danger'}`}>
                      {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>{formatDate(vehicle.updatedAt)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/transport/${vehicle.id}/edit`)}
                        className="app-btn-secondary h-10 px-4 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(vehicle.id)}
                        className="app-btn-secondary h-10 px-4 text-sm text-[var(--danger-text)]"
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
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="app-btn-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="app-btn-secondary h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
