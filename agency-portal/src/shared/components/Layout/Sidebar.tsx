import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar Navigation Component
 */
const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/transport', label: 'Transport', icon: '🚗' },
    { path: '/hotels', label: 'Hotels', icon: '🏨' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Navigation</h2>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-r-4 border-indigo-500 text-white' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
