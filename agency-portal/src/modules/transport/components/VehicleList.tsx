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



  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit || 1));

  return (
    <div className="space-y-6">
      <section className="section-title-row">
        <h2 className="section-title">Fleet Management</h2>
      </section>

      <section className="surface">
        <div className="page-toolbar">
          <div className="search-shell">
            <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by make, model, or registration"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/transport/new')}
            className="app-btn-primary app-btn-md"
          >
            Add vehicle
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="surface px-6 py-14 text-center">
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
        <>
          <div className="mobile-record-list lg:hidden">
            {vehicles.map((vehicle) => (
              <article key={vehicle.id} className="record-card">
                <div className="record-grid">
                  <div>
                    <div className="text-base font-semibold tracking-tight text-[var(--text)]">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      {vehicle.year} | {formatStatusLabel(vehicle.type)}
                    </div>
                  </div>
                  <span className={`app-pill ${vehicle.isAvailable ? 'app-pill-success' : 'app-pill-danger'}`}>
                    {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                  <div>Registration {vehicle.vehicleNumber || '--'}</div>
                  <div>Driver {vehicle.driverName || '--'}</div>
                  <div>{vehicle.capacity} seats</div>
                </div>

                <div className="record-grid">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-soft)]">
                      Daily rate
                    </div>
                    <div className="mt-1 text-base font-semibold text-[var(--text)]">
                      {formatCurrency(vehicle.pricePerDay)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[var(--text-soft)]">
                    Updated {formatDate(vehicle.updatedAt)}
                  </div>
                </div>

                <div className="record-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/transport/${vehicle.id}/edit`)}
                    className="app-btn-secondary app-btn-md"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vehicle.id)}
                    className="app-btn-secondary app-btn-md text-[var(--danger-text)]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="surface hidden overflow-x-auto lg:block">
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
                        {vehicle.year} | {formatStatusLabel(vehicle.type)}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">
                        {vehicle.vehicleNumber || '--'}
                      </div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">
                        Driver {vehicle.driverName || '--'}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">
                        {vehicle.capacity} seat(s)
                      </div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">
                        {formatCurrency(vehicle.pricePerDay)}
                      </div>
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
                          className="app-btn-secondary app-btn-md"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle.id)}
                          className="app-btn-secondary app-btn-md text-[var(--danger-text)]"
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
        </>
      )}

      {pagination.total > pagination.limit && (
        <div className="page-pagination">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="app-btn-secondary app-btn-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= totalPages}
            className="app-btn-secondary app-btn-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleList;

