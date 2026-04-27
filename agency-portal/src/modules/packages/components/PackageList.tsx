import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RootState } from '../../../store';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { deletePackage, fetchPackages } from '../store/packagesSlice';

const PackageList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { packages, loading, error, pagination } = useSelector((state: RootState) => state.packages);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchPackages({
        page,
        limit: 20,
        search: search || undefined,
      }) as any,
    );
  }, [dispatch, page, search]);



  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this trip offer?')) {
      return;
    }

    await dispatch(deletePackage(id) as any);
    dispatch(
      fetchPackages({
        page,
        limit: 20,
        search: search || undefined,
      }) as any,
    );
  };

  return (
    <div className="space-y-6">
      <section className="mb-4">
        <h2 className="text-2xl font-semibold text-[var(--text)]">Offer Management</h2>
      </section>

      <div className="page-toolbar">
        <div className="search-shell">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search trip offers..."
            className="app-field pl-11"
          />
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => navigate('/packages/new')}
          className="app-btn-primary h-11 px-5 text-sm"
        >
          New trip offer
        </button>
      </div>

      {error && (
        <div className="rounded-[18px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface loading-state">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip offers...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="surface empty-state">
          <div className="empty-state-title">
            {search ? 'No trip offers match the search' : 'No trip offers yet'}
          </div>
          <div className="empty-state-copy">
            {search ? 'Try a broader search.' : 'Create your first offer to start publishing agency packages.'}
          </div>
        </div>
      ) : (
        <>
          <div className="mobile-record-list lg:hidden">
            {packages.map((tripPackage) => (
              <div key={tripPackage.id} className="record-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="record-title">{tripPackage.name}</div>
                    <div className="record-copy">{tripPackage.duration} day(s)</div>
                  </div>
                  <span className={`app-pill ${tripPackage.isActive ? 'app-pill-success' : 'app-pill-neutral'}`}>
                    {tripPackage.isActive ? 'Published' : 'Hidden'}
                  </span>
                </div>

                {tripPackage.description && <div className="record-copy">{tripPackage.description}</div>}

                <div className="chip-row">
                  {tripPackage.destinations.slice(0, 3).map((destination) => (
                    <span key={destination} className="app-pill app-pill-neutral">{destination}</span>
                  ))}
                  {tripPackage.destinations.length > 3 && (
                    <span className="app-pill app-pill-neutral">+{tripPackage.destinations.length - 3}</span>
                  )}
                </div>

                {(tripPackage.hotel || tripPackage.vehicle) && (
                  <div className="chip-row">
                    {tripPackage.hotel && <span className="app-pill app-pill-neutral">Hotel: {tripPackage.hotel.name}</span>}
                    {tripPackage.vehicle && <span className="app-pill app-pill-neutral">Vehicle: {tripPackage.vehicle.make} {tripPackage.vehicle.model}</span>}
                  </div>
                )}

                <div className="record-grid">
                  <div className="record-meta-block">
                    <div className="record-meta-label">Price</div>
                    <div className="record-meta-value">{formatCurrency(tripPackage.price)}</div>
                  </div>
                  <div className="record-meta-block">
                    <div className="record-meta-label">Updated</div>
                    <div className="record-meta-value">{formatDate(tripPackage.updatedAt)}</div>
                  </div>
                </div>

                <div className="record-actions">
                  <button type="button" onClick={() => navigate(`/packages/${tripPackage.id}/edit`)} className="app-btn-secondary h-10 px-4 text-sm">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(tripPackage.id)} className="app-btn-secondary h-10 px-4 text-sm text-[var(--danger-text)]">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="app-table-shell hidden overflow-x-auto lg:block">
            <table className="app-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Destinations</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((tripPackage) => (
                  <tr key={tripPackage.id}>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{tripPackage.name}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{tripPackage.duration} day(s)</div>
                      {(tripPackage.hotel || tripPackage.vehicle) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tripPackage.hotel && <span className="app-pill app-pill-neutral">Hotel: {tripPackage.hotel.name}</span>}
                          {tripPackage.vehicle && <span className="app-pill app-pill-neutral">Vehicle: {tripPackage.vehicle.make} {tripPackage.vehicle.model}</span>}
                        </div>
                      )}
                      {tripPackage.description && (
                        <div className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{tripPackage.description}</div>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {tripPackage.destinations.slice(0, 3).map((destination) => (
                          <span key={destination} className="app-pill app-pill-neutral">{destination}</span>
                        ))}
                        {tripPackage.destinations.length > 3 && <span className="app-pill app-pill-neutral">+{tripPackage.destinations.length - 3}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold tracking-tight text-[var(--text)]">{formatCurrency(tripPackage.price)}</div>
                    </td>
                    <td>
                      <span className={`app-pill ${tripPackage.isActive ? 'app-pill-success' : 'app-pill-neutral'}`}>
                        {tripPackage.isActive ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td>{formatDate(tripPackage.updatedAt)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => navigate(`/packages/${tripPackage.id}/edit`)} className="app-btn-secondary h-10 px-4 text-sm">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(tripPackage.id)} className="app-btn-secondary h-10 px-4 text-sm text-[var(--danger-text)]">
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
            onClick={() => setPage((current) => Math.max(1, current - 1))}
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
            onClick={() => setPage((current) => current + 1)}
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

export default PackageList;
