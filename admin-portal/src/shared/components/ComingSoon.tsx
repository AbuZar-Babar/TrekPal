import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
    title: string;
    description?: string;
}

/**
 * Reusable Coming Soon placeholder page
 */
const ComingSoon = ({ title, description }: ComingSoonProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md" style={{ animation: 'fadeUp 0.5s ease-out' }}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-2xl mb-6">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>

                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                    Under Development
                </span>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm mb-8">
                    {description || 'This feature is currently being built. Check back soon!'}
                </p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>

                <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </div>
        </div>
    );
};

export default ComingSoon;
