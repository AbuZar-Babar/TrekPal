import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/agencies', label: 'Agencies', icon: '🏢' },
    { path: '/hotels', label: 'Hotels', icon: '🏨' },
    { path: '/vehicles', label: 'Vehicles', icon: '🚗' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">TrekPal Admin</h1>
      </div>
      <nav className="mt-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 ${
                isActive ? 'bg-gray-800 border-r-4 border-indigo-500' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
