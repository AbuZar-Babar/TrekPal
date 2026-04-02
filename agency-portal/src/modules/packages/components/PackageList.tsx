import { useEffect, useMemo, useState } from 'react';
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

  const uniqueDestinations = useMemo(
    () => new Set(packages.flatMap((item) => item.destinations.map((destination) => destination.toLowerCase()))).size,
    [packages],
  );

  const stats = [
    { label: 'Trip offers', value: packages.length },
    { label: 'Active', value: packages.filter((item) => item.isActive).length },
    { label: 'Hidden', value: packages.filter((item) => !item.isActive).length },
    { label: 'Destinations', value: uniqueDestinations },
  ];

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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="app-kpi px-5 py-5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
              {stat.label}
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">{stat.value}</div>
          </div>
        ))}
      </section>

      <div className="app-card px-5 py-5">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto] lg:items-center">
          <div className="relative">
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
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-soft)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
      </div>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
          <p className="mt-4 text-sm text-[var(--text-muted)]">Loading trip offers...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="app-table-shell px-6 py-14 text-center">
          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
            {search ? 'No trip offers match the search' : 'No trip offers yet'}
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {search ? 'Try a broader search.' : 'Create one offer and publish your own packages directly.'}
          </p>
        </div>
      ) : (
        <div className="app-table-shell overflow-x-auto">
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
                    <div className="mt-1 text-sm text-[var(--text-muted)]">
                      {tripPackage.duration} day(s)
                    </div>
                    {tripPackage.description && (
                      <div className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
                        {tripPackage.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {tripPackage.destinations.slice(0, 3).map((destination) => (
                        <span key={destination} className="app-pill app-pill-neutral">
                          {destination}
                        </span>
                      ))}
                      {tripPackage.destinations.length > 3 && (
                        <span className="app-pill app-pill-neutral">
                          +{tripPackage.destinations.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold tracking-tight text-[var(--text)]">
                      {formatCurrency(tripPackage.price)}
                    </div>
                  </td>
                  <td>
                    <span className={`app-pill ${tripPackage.isActive ? 'app-pill-success' : 'app-pill-neutral'}`}>
                      {tripPackage.isActive ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td>{formatDate(tripPackage.updatedAt)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/packages/${tripPackage.id}/edit`)}
                        className="app-btn-secondary h-10 px-4 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tripPackage.id)}
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
