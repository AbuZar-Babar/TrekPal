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
      onClick: () => navigate('/agencies?status=PENDING'),
    },
    {
      label: 'Pending Travelers',
      value: stats?.pendingTravelers ?? 0,
      hint: 'Review traveler KYC',
      onClick: () => navigate('/travelers?status=PENDING'),
    },
    {
      label: 'Hotels',
      value: stats?.totalHotels ?? 0,
      hint: 'View hotel inventory',
      onClick: () => navigate('/inventory?type=hotels'),
    },
    {
      label: 'Vehicles',
      value: stats?.totalVehicles ?? 0,
      hint: 'View vehicle inventory',
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
