import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { fetchVehicles, approveVehicle, rejectVehicle } from '../store/vehiclesSlice';
import VehicleCard from './VehicleCard';

const VehicleApprovalList = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error, pagination } = useSelector(
    (state: RootState) => state.vehicles
  );
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchVehicles({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );
  }, [dispatch, page, statusFilter, search]);

  const handleApprove = async (id: string) => {
    if (confirm('Are you sure you want to approve this vehicle?')) {
      await dispatch(approveVehicle({ id }) as any);
      dispatch(fetchVehicles({ page, status: statusFilter || undefined }) as any);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      await dispatch(rejectVehicle({ id, reason: reason || undefined }) as any);
      dispatch(fetchVehicles({ page, status: statusFilter || undefined }) as any);
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    const isNetworkError = error.includes('Backend server is not running') || error.includes('Network Error');
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          {isNetworkError && (
            <div className="text-sm text-red-700 bg-red-100 p-4 rounded-xl text-left">
              <p className="font-semibold mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Make sure the backend server is running</li>
                <li>Run: <code className="bg-red-200 px-1 rounded">npm run dev</code> in the backend folder</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transport Vehicles</h1>
            <p className="text-xs text-gray-400">
              {pagination.total} total {pagination.total === 1 ? 'vehicle' : 'vehicles'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm transition-all cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>

      {/* Empty State */}
      {vehicles.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h.01M16 17h.01M3 11l1.5-5.25A2 2 0 016.42 4h11.16a2 2 0 011.92 1.75L21 11M3 11v6a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-6M3 11h18" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No vehicles found</h3>
          <p className="text-sm text-gray-500">
            {statusFilter ? `No vehicles with status "${statusFilter}"` : 'No vehicles registered yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleApprovalList;
