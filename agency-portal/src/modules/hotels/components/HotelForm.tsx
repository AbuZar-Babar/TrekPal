/**
 * Dummy Hotel Form Component
 * Placeholder for future hotel management functionality
 */
const HotelForm = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Hotel</h2>
      <div className="bg-white p-8 rounded-lg shadow">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hotel Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            This feature is under development. You'll be able to add and manage hotels here soon.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelForm;
