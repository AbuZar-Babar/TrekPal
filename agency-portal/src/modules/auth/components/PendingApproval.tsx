import { Link, useLocation } from 'react-router-dom';

/**
 * Pending Approval Page - Shown after agency registration
 * Consistent design with login/register pages
 */
const PendingApproval = () => {
  const location = useLocation();
  const { email, name } = (location.state as { email?: string; name?: string }) || {};

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image - same as login/register */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 px-4 animate-slideUp">
        {/* Logo/Header */}
        <div className="text-center mb-6 text-white animate-fadeDown">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-xl border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 text-center animate-scaleIn">
          {/* Animated Clock Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6 animate-pulse-soft">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Account Under Review
          </h2>

          {name && (
            <p className="text-indigo-600 font-medium mb-3 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
              {name}
            </p>
          )}

          {/* Message */}
          <p className="text-gray-500 text-sm mb-6 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Your agency registration has been submitted successfully. Our admin team will review your KYC documents and verify your account.
          </p>

          {/* Status Steps */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="space-y-4">
              {/* Step 1 - Done */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Registration Complete</p>
                  <p className="text-xs text-gray-400">Account & KYC documents submitted</p>
                </div>
              </div>

              {/* Step 2 - In Progress */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm animate-pulse-soft">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Admin Review</p>
                  <p className="text-xs text-gray-400">Reviewing your documents & credentials</p>
                </div>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex items-start gap-3 opacity-40">
                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Account Approved</p>
                  <p className="text-xs text-gray-400">Login and start managing trips</p>
                </div>
              </div>
            </div>
          </div>

          {email && (
            <div className="flex items-center justify-center gap-2 bg-indigo-50 rounded-xl py-2.5 px-4 mb-6 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-indigo-700 font-medium">{email}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '0.55s' }}>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Try Logging In
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Registration
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-fadeDown { animation: fadeDown 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out 0.1s both; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out both; }
        .animate-pulse-soft { animation: pulseSoft 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PendingApproval;
