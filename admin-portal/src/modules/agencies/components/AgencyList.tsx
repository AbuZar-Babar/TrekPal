import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { fetchAgencies, approveAgency, rejectAgency } from '../store/agencySlice';
import AgencyCard from './AgencyCard';

const AgencyList = () => {
  const dispatch = useDispatch();
  const { agencies, loading, error, pagination } = useSelector(
    (state: RootState) => state.agencies
  );
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchAgencies({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      }) as any
    );
  }, [dispatch, page, statusFilter, search]);

  const handleApprove = async (id: string) => {
    if (confirm('Are you sure you want to approve this agency?')) {
      await dispatch(approveAgency({ id }) as any);
      dispatch(fetchAgencies({ page, status: statusFilter || undefined }) as any);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      await dispatch(rejectAgency({ id, reason: reason || undefined }) as any);
      dispatch(fetchAgencies({ page, status: statusFilter || undefined }) as any);
    }
  };

  if (loading && agencies.length === 0) {
    return <div className="text-center py-8">Loading agencies...</div>;
  }

  if (error) {
    const isNetworkError = error.includes('Backend server is not running') || error.includes('Network Error');
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          {isNetworkError && (
            <div className="text-sm text-red-700 bg-red-100 p-3 rounded">
              <p className="font-semibold mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Make sure the backend server is running</li>
                <li>Open a terminal in the <code className="bg-red-200 px-1 rounded">backend</code> folder</li>
                <li>Run: <code className="bg-red-200 px-1 rounded">npm run dev</code></li>
                <li>The server should start on <code className="bg-red-200 px-1 rounded">http://localhost:3000</code></li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search agencies..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="grid gap-4">
        {agencies.map((agency) => (
          <AgencyCard
            key={agency.id}
            agency={agency}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>

      {agencies.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">No agencies found</div>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AgencyList;
