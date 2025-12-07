import { Link } from 'react-router-dom';

/**
 * Pending Approval Page - Shown after agency registration
 */
const PendingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Waiting for Admin Approval
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Your agency account has been successfully registered and is now pending admin approval.
            You will be able to log in and access your dashboard once an administrator approves your account.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">What happens next?</p>
                <p className="text-sm text-blue-700">
                  An administrator will review your registration and approve your account. 
                  You'll be notified once your account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02]"
            >
              Check Status / Try Login
            </Link>
            <Link
              to="/signup"
              className="block w-full py-2 px-4 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

