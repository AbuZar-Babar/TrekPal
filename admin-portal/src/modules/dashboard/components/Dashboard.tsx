import { useNavigate } from 'react-router-dom';

import MetricCard from '../../../shared/components/analytics/MetricCard';
import { useDashboardStats } from '../hooks/useDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  const cards = [
    {
      label: 'Pending Agencies',
      value: stats?.pendingAgencies ?? 0,
      hint: 'Review agency KYC',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V7l7-4 7 4v14M9 10h6M9 14h6" />
        </svg>
      ),
      onClick: () => navigate('/agencies?status=PENDING'),
    },
    {
      label: 'Pending Travelers',
      value: stats?.pendingTravelers ?? 0,
      hint: 'Review traveler KYC',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0" />
        </svg>
      ),
      onClick: () => navigate('/travelers?status=PENDING'),
    },
    {
      label: 'Hotels',
      value: stats?.totalHotels ?? 0,
      hint: 'View hotel inventory',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V5h14v16M9 9h2m4 0h2m-8 4h2m4 0h2" />
        </svg>
      ),
      onClick: () => navigate('/inventory?type=hotels'),
    },
    {
      label: 'Vehicles',
      value: stats?.totalVehicles ?? 0,
      hint: 'View vehicle inventory',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13l2-6h14l2 6M5 13v5h2m10-5v5h2M7 18a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      ),
      onClick: () => navigate('/inventory?type=vehicles'),
    },
  ];

  const quickActions = [
    { label: 'Review agencies', onClick: () => navigate('/agencies?status=PENDING') },
    { label: 'Review travelers', onClick: () => navigate('/travelers?status=PENDING') },
    { label: 'View inventory', onClick: () => navigate('/inventory') },
    { label: 'Open analytics', onClick: () => navigate('/analytics') },
  ];

  return (
    <div className="space-y-6">
      <section>
        <div className="sovereign-label">Overview</div>
        <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
          Dashboard
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Review pending work and jump straight to action.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value.toLocaleString()}
            hint={card.hint}
            icon={card.icon}
            onClick={card.onClick}
          />
        ))}
      </section>

      <section className="sovereign-panel p-6">
        <div className="sovereign-label">Quick actions</div>
        <div className="mt-4 flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="sovereign-button-secondary h-11 px-5"
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
