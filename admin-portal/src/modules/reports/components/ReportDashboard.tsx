import MetricCard from '../../../shared/components/analytics/MetricCard';
import SimpleChartCard from '../../../shared/components/analytics/SimpleChartCard';
import { useBookingsChart, useDashboardStats, useUserGrowth } from '../../dashboard/hooks/useDashboard';

const ReportDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: bookingsData = [] } = useBookingsChart();
  const { data: userGrowthData = [] } = useUserGrowth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Agencies',
      value: stats?.totalAgencies ?? 0,
      hint: 'All agency accounts',
    },
    {
      label: 'Total Travelers',
      value: stats?.totalUsers ?? 0,
      hint: 'All traveler accounts',
    },
    {
      label: 'Pending Agencies',
      value: stats?.pendingAgencies ?? 0,
      hint: 'Waiting for review',
    },
    {
      label: 'Pending Travelers',
      value: stats?.pendingTravelers ?? 0,
      hint: 'Waiting for review',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value.toLocaleString()}
            hint={card.hint}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SimpleChartCard
          title="User Growth"
          subtitle="Traveler count over time"
          points={userGrowthData.map((item) => ({
            label: item.month,
            value: item.users,
          }))}
          color="var(--primary)"
        />
        <SimpleChartCard
          title="Bookings Trend"
          subtitle="Bookings by month"
          points={bookingsData.map((item) => ({
            label: item.month,
            value: item.bookings,
          }))}
          color="#5f6b7c"
        />
      </section>
    </div>
  );
};

export default ReportDashboard;
