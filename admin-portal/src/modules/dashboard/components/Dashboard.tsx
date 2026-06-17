import { useNavigate } from 'react-router-dom';

import PageHeader from '../../../shared/components/UI/PageHeader';
import StatCard from '../../../shared/components/UI/StatCard';
import Card from '../../../shared/components/UI/Card';
import Badge from '../../../shared/components/UI/Badge';
import { useDashboardStats } from '../hooks/useDashboard';

const navIcon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d={d} />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  // ---- KPI tiles --------------------------------------------------------
  const kpis = [
    {
      label: 'Total users',
      value: stats?.totalUsers ?? 0,
      hint: `${stats?.recentRegistrations?.users ?? 0} new this period`,
      icon: navIcon('M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0'),
      onClick: () => navigate('/travelers'),
    },
    {
      label: 'Agencies',
      value: stats?.totalAgencies ?? 0,
      hint: `${stats?.approvedAgencies ?? 0} approved · ${stats?.pendingAgencies ?? 0} pending`,
      icon: navIcon('M3 21h18M5 21V8l7-4 7 4v13'),
      onClick: () => navigate('/agencies'),
    },
    {
      label: 'Hotels',
      value: stats?.totalHotels ?? 0,
      hint: `${stats?.approvedHotels ?? 0} approved · ${stats?.pendingHotels ?? 0} pending`,
      icon: navIcon('M3 21h18M5 21V7h14v14'),
      onClick: () => navigate('/hotels'),
    },
    {
      label: 'Vehicles',
      value: stats?.totalVehicles ?? 0,
      hint: `${stats?.approvedVehicles ?? 0} approved · ${stats?.pendingVehicles ?? 0} pending`,
      icon: navIcon('M5 13l1.5-5h11L19 13M5 13v5h2m12-5v5h-2M5 13h14'),
      onClick: () => navigate('/inventory?type=vehicles'),
    },
  ];

  // ---- Review queues ----------------------------------------------------
  const queues = [
    {
      label: 'Agency applications',
      count: stats?.pendingAgencies ?? 0,
      sub: 'KYC review pending',
      onClick: () => navigate('/agencies?status=PENDING'),
    },
    {
      label: 'Traveler KYC',
      count: stats?.pendingTravelers ?? 0,
      sub: 'Identity check pending',
      onClick: () => navigate('/travelers?status=PENDING'),
    },
    {
      label: 'Hotel listings',
      count: stats?.pendingHotels ?? 0,
      sub: 'Listing approval pending',
      onClick: () => navigate('/hotels?status=PENDING'),
    },
    {
      label: 'Vehicle listings',
      count: stats?.pendingVehicles ?? 0,
      sub: 'Listing approval pending',
      onClick: () => navigate('/inventory?type=vehicles&status=PENDING'),
    },
  ];

  const totalPending = queues.reduce((sum, q) => sum + (q.count || 0), 0);

  // ---- Business snapshot rows ------------------------------------------
  const businessRows = [
    { label: 'Total bookings', value: (stats?.totalBookings ?? 0).toLocaleString() },
    { label: 'Verified travelers', value: (stats?.verifiedTravelers ?? 0).toLocaleString() },
    { label: 'Approved agencies', value: (stats?.approvedAgencies ?? 0).toLocaleString() },
  ];

  // ---- Recent registrations --------------------------------------------
  const recents = [
    { label: 'New travelers', value: stats?.recentRegistrations?.users ?? 0 },
    { label: 'New agencies', value: stats?.recentRegistrations?.agencies ?? 0 },
    { label: 'New vehicle providers', value: stats?.recentRegistrations?.vehicleProviders ?? 0 },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Loading platform snapshot…" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ap-card ap-card-padded">
              <div className="ap-skel h-3 w-24 mb-3" />
              <div className="ap-skel h-7 w-16" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Platform snapshot — pending reviews, growth, and business totals."
        actions={
          totalPending > 0 ? (
            <Badge variant="warning" dot>
              {totalPending} pending review{totalPending === 1 ? '' : 's'}
            </Badge>
          ) : (
            <Badge variant="success" dot>
              All caught up
            </Badge>
          )
        }
      />

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon}
            hint={k.hint}
            onClick={k.onClick}
          />
        ))}
      </div>

      {/* Queues + business snapshot side by side */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Review queue"
          eyebrow="Action needed"
          action={
            totalPending > 0 ? (
              <Badge variant="warning">{totalPending}</Badge>
            ) : (
              <Badge variant="outline">0</Badge>
            )
          }
        >
          <div className="ap-list">
            {queues.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={q.onClick}
                className="ap-list-row"
                style={{ width: '100%', background: 'transparent', border: 0, borderTop: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="ap-list-row-primary">
                  <span className="ap-list-row-title">{q.label}</span>
                  <span className="ap-list-row-sub">{q.sub}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
                    {q.count}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5 text-[var(--text-soft)]"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Business snapshot" eyebrow="Lifetime">
          <div className="ap-list">
            {businessRows.map((row) => (
              <div key={row.label} className="ap-list-row">
                <span className="ap-list-row-sub" style={{ color: 'var(--text-muted)' }}>
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-[var(--text)] tabular-nums">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent registrations strip */}
      <div className="mt-5">
        <Card
          title="Recent registrations"
          eyebrow="Last 7 days"
          action={
            <button type="button" className="ap-btn ap-btn-ghost" onClick={() => navigate('/analytics')}>
              View analytics
            </button>
          }
        >
          <div className="grid gap-0 sm:grid-cols-3">
            {recents.map((r, i) => (
              <div
                key={r.label}
                className="px-5 py-4"
                style={{
                  borderLeft: i === 0 ? 'none' : '1px solid var(--border)',
                  borderTop: 'none',
                }}
              >
                <div className="text-xs text-[var(--text-muted)]">{r.label}</div>
                <div className="mt-1 text-xl font-semibold text-[var(--text)] tabular-nums">
                  {r.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
