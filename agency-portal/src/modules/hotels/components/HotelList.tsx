/**
 * Dummy Hotel List Component
 * Placeholder for future hotel management functionality
 */
const HotelList = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Hotels</h1>
        <button
          onClick={() => window.location.href = '/hotels/new'}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          + Add Hotel
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hotel Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            This feature is under development. You'll be able to view and manage all your hotels here soon.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/hotels/new'}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Add New Hotel
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
