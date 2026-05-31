import StatCard from '../../../shared/components/UI/StatCard';
import SimpleChartCard from '../../../shared/components/analytics/SimpleChartCard';
import PageHeader from '../../../shared/components/UI/PageHeader';
import Badge from '../../../shared/components/UI/Badge';
import { useBookingsChart, useDashboardStats, useRevenueChart, useUserGrowth } from '../../dashboard/hooks/useDashboard';

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ReportDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: bookingsData = [] } = useBookingsChart();
  const { data: userGrowthData = [] } = useUserGrowth();
  const { data: revenueData = [] } = useRevenueChart();

  const kpis = [
    {
      label: 'Total agencies',
      value: stats?.totalAgencies ?? 0,
      hint: `${stats?.approvedAgencies ?? 0} approved`,
      icon: icon('M3 21h18M5 21V8l7-4 7 4v13'),
    },
    {
      label: 'Total travelers',
      value: stats?.totalUsers ?? 0,
      hint: `${stats?.verifiedTravelers ?? 0} verified`,
      icon: icon('M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0'),
    },
    {
      label: 'Total bookings',
      value: (stats?.totalBookings ?? 0).toLocaleString(),
      icon: icon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z'),
    },
    {
      label: 'Total revenue',
      value: new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(stats?.totalRevenue ?? 0),
      icon: icon('M12 2v20m5-17H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'),
    },
  ];

  const pendingTotal = (stats?.pendingAgencies ?? 0) + (stats?.pendingTravelers ?? 0);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Loading platform data…" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="sovereign-pattern-card p-5">
              <div className="ap-skel h-3 w-20 mb-4" />
              <div className="ap-skel h-8 w-14" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Platform-wide trends — growth, bookings, and revenue over time."
        actions={
          pendingTotal > 0 ? (
            <Badge variant="warning" dot>
              {pendingTotal} pending
            </Badge>
          ) : null
        }
      />

      {/* KPI tiles */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            hint={k.hint}
            icon={k.icon}
          />
        ))}
      </div>

      {/* Revenue (full-width) */}
      <div className="mt-5">
        <SimpleChartCard
          title="Revenue trend"
          subtitle="Monthly revenue — last 6 months"
          points={revenueData.map((item) => ({ label: item.month, value: item.revenue }))}
          valueFormatter={(v) =>
            new Intl.NumberFormat('en-PK', {
              style: 'currency',
              currency: 'PKR',
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(v)
          }
          color="#a78bfa"
        />
      </div>

      {/* Bookings + User growth side-by-side */}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SimpleChartCard
          title="Bookings trend"
          subtitle="Confirmed bookings by month"
          points={bookingsData.map((item) => ({ label: item.month, value: item.bookings }))}
          color="#f59e0b"
        />
        <SimpleChartCard
          title="User growth"
          subtitle="New traveler registrations by month"
          points={userGrowthData.map((item) => ({ label: item.month, value: item.users }))}
          color="#0ea5e9"
        />
      </div>
    </>
  );
};

export default ReportDashboard;
