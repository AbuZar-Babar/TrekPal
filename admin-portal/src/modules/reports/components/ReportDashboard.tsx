import { useEffect } from 'react';

import { formatCurrency } from '../../../shared/utils/formatters';
import ReportCharts from './ReportCharts';
import { useReports } from '../hooks/useReports';
import { ReportRange } from '../store/reportsSlice';

const rangeOptions: Array<{ label: string; value: ReportRange }> = [
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Last 12 Months', value: '12months' },
];

const ReportDashboard = () => {
  const {
    dashboardStats,
    revenueData,
    bookingsData,
    userGrowthData,
    range,
    loading,
    error,
    updateRange,
    loadAllReports,
  } = useReports();

  useEffect(() => {
    loadAllReports(range);
  }, [loadAllReports, range]);

  if (loading && !dashboardStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sovereign-panel p-8 text-center">
        <h3 className="font-headline text-2xl font-bold text-[var(--text)]">
          Failed to load reports
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  const latestRevenue = revenueData.at(-1)?.revenue ?? 0;
  const latestBookings = bookingsData.at(-1)?.bookings ?? 0;
  const latestUsers = userGrowthData.at(-1)?.users ?? 0;

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(dashboardStats?.totalRevenue),
      detail: `Latest period ${formatCurrency(latestRevenue)}`,
    },
    {
      label: 'Total Bookings',
      value: (dashboardStats?.totalBookings || 0).toLocaleString(),
      detail: `${latestBookings} bookings in the latest period`,
    },
    {
      label: 'Total Users',
      value: (dashboardStats?.totalUsers || 0).toLocaleString(),
      detail: `${latestUsers} travelers in the latest cumulative view`,
    },
    {
      label: 'Total Agencies',
      value: (dashboardStats?.totalAgencies || 0).toLocaleString(),
      detail: `${dashboardStats?.pendingAgencies || 0} agencies still pending`,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="sovereign-label">Reports & analytics</div>
          <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
            Read the platform like an editorial operations ledger
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            Track revenue, bookings, and user growth with a calmer administrative interface that
            keeps the numbers legible and the signal obvious.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-low)] p-1.5">
          {rangeOptions.map((option) => {
            const active = range === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateRange(option.value)}
                className={`sovereign-tab ${active ? 'sovereign-tab-active' : 'sovereign-tab-idle'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className="sovereign-kpi p-6">
            <div className="sovereign-label">{card.label}</div>
            <div className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
              {card.value}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <ReportCharts
          revenueData={revenueData}
          bookingsData={bookingsData}
          userGrowthData={userGrowthData}
        />

        <aside className="space-y-6">
          <div className="sovereign-dark-panel p-7">
            <div className="sovereign-label text-white/55">Insight summary</div>
            <h3 className="mt-3 font-headline text-2xl font-bold text-white">
              Current reporting posture
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Revenue and booking momentum remain visible, while agency growth and approval queues
              continue to shape the administrative workload.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[20px] bg-white/8 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  Booking Core
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {dashboardStats?.totalBookings || 0} bookings tracked
                </div>
              </div>
              <div className="rounded-[20px] bg-white/8 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  Revenue Base
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(dashboardStats?.totalRevenue)}
                </div>
              </div>
              <div className="rounded-[20px] bg-white/8 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  Agency Queue
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {dashboardStats?.pendingAgencies || 0} approvals pending
                </div>
              </div>
            </div>
          </div>

          <div className="sovereign-panel p-6">
            <div className="sovereign-label">Reading notes</div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <li>Compare booking trend against user growth before forecasting demand.</li>
              <li>Watch pending agency counts alongside revenue growth for review pressure.</li>
              <li>Use the longer range when judging structural growth, not weekly movement.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ReportDashboard;
