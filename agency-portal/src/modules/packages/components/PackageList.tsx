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
    dispatch(fetchPackages({ page, limit: 20, search: search || undefined }) as any);
  }, [dispatch, page, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this trip offer?')) {
      await dispatch(deletePackage(id) as any);
      dispatch(fetchPackages({ page, limit: 20, search: search || undefined }) as any);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--text)]">Offers</h2>
        <button
          onClick={() => navigate('/packages/new')}
          className="app-btn-primary h-11 px-5 text-sm"
        >
          New Offer
        </button>
      </section>

      <div className="page-toolbar surface">
        <div className="search-shell">
          <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Filter offers..."
            className="border-0 bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="surface py-20 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
      ) : packages.length === 0 ? (
        <div className="surface py-20 text-center">
          <p className="text-[var(--text-soft)]">No offers found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <article key={pkg.id} className="surface flex flex-col p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{pkg.name}</h3>
                  <p className="text-sm text-[var(--text-soft)]">{pkg.duration} Days</p>
                </div>
                <span className={`app-pill ${pkg.isActive ? 'app-pill-success' : 'app-pill-neutral'}`}>
                  {pkg.isActive ? 'Active' : 'Draft'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {pkg.destinations.map((dest) => (
                  <span key={dest} className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--panel-subtle)] px-2 py-1 rounded">
                    {dest}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-[var(--border)]">
                <div className="text-sm font-bold text-[var(--text)]">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/packages/${pkg.id}/edit`)}
                    className="h-9 px-4 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-subtle)] rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="h-9 px-4 text-xs font-medium text-[var(--danger-text)] hover:bg-[var(--danger-bg)] rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="app-btn-secondary h-10 px-4 text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-[var(--text-soft)]">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="app-btn-secondary h-10 px-4 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PackageList;
