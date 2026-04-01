import {
  useBookingsChart,
  useDashboardStats,
  useRevenueChart,
  useUserGrowth,
} from '../hooks/useDashboard';

const Dashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart();
  const { data: bookingsData } = useBookingsChart();
  const { data: userGrowthData } = useUserGrowth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

  const hotelApprovalRate =
    stats && stats.totalHotels > 0
      ? Math.round((stats.approvedHotels / stats.totalHotels) * 100)
      : 0;

  const metricCards = [
    {
      label: 'Pending Agencies',
      value: stats?.pendingAgencies ?? 0,
      detail: `${stats?.approvedAgencies ?? 0} approved agencies`,
    },
    {
      label: 'Traveler Volume',
      value: stats?.totalUsers ?? 0,
      detail: `${stats?.recentRegistrations.users ?? 0} recent registrations`,
    },
    {
      label: 'Hotel Approval Rate',
      value: `${hotelApprovalRate}%`,
      detail: `${stats?.approvedHotels ?? 0} of ${stats?.totalHotels ?? 0} hotels approved`,
    },
    {
      label: 'Approved Vehicles',
      value: stats?.approvedVehicles ?? 0,
      detail: `${stats?.pendingVehicles ?? 0} awaiting moderation`,
    },
  ];

  const actionItems = [
    {
      title: 'Agency review queue requires daily handling',
      description: `${stats?.pendingAgencies ?? 0} applications are still pending approval.`,
      badge: 'Agency queue',
      tone: 'warning',
    },
    {
      title: 'Hospitality inventory moderation remains active',
      description: `${Math.max((stats?.totalHotels ?? 0) - (stats?.approvedHotels ?? 0), 0)} hotel listings still need a decision.`,
      badge: 'Hotel moderation',
      tone: 'neutral',
    },
    {
      title: 'Fleet readiness needs review coverage',
      description: `${stats?.pendingVehicles ?? 0} vehicle records are waiting for approval.`,
      badge: 'Vehicle audit',
      tone: 'danger',
    },
  ];

  const sparkBlocks = [
    {
      label: 'Revenue cadence',
      value: `PKR ${Math.round(stats?.totalRevenue ?? 0).toLocaleString()}`,
      bars: revenueData?.map((item) => item.revenue) ?? [],
      color: 'var(--primary)',
    },
    {
      label: 'Booking movement',
      value: `${stats?.totalBookings ?? 0} total`,
      bars: bookingsData?.map((item) => item.bookings) ?? [],
      color: '#6b7280',
    },
    {
      label: 'User growth',
      value: `${stats?.totalUsers ?? 0} active travelers`,
      bars: userGrowthData?.map((item) => item.users) ?? [],
      color: '#595e78',
    },
  ];

  const pillClass = (tone: string) => {
    switch (tone) {
      case 'warning':
        return 'sovereign-pill sovereign-pill-warning';
      case 'danger':
        return 'sovereign-pill sovereign-pill-danger';
      default:
        return 'sovereign-pill sovereign-pill-neutral';
    }
  };

  return (
    <div className="space-y-8">
      <section className="sovereign-hero relative p-8">
        <div className="absolute inset-y-0 right-[-10%] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="sovereign-label text-white/55">Dashboard overview</div>
            <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-white">
              Operational control with editorial clarity
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Review approval queues, monitor platform health, and keep marketplace systems under
              disciplined administrative control.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                Total Revenue
              </div>
              <div className="mt-2 font-headline text-2xl font-extrabold text-white">
                PKR {Math.round(stats?.totalRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                Bookings
              </div>
              <div className="mt-2 font-headline text-2xl font-extrabold text-white">
                {formatNumber(stats?.totalBookings ?? 0)}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/6 px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                Registered Users
              </div>
              <div className="mt-2 font-headline text-2xl font-extrabold text-white">
                {formatNumber(stats?.totalUsers ?? 0)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article key={card.label} className="sovereign-kpi p-6">
            <div className="sovereign-label">{card.label}</div>
            <div className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-[var(--text)]">
              {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <div className="sovereign-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="sovereign-label">Critical action required</div>
                <h3 className="mt-2 font-headline text-2xl font-bold tracking-tight text-[var(--text)]">
                  Review queues with the highest operational pressure
                </h3>
              </div>
              <div className="sovereign-pill sovereign-pill-danger">
                {actionItems.length} active flags
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {actionItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-low)] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className={pillClass(item.tone)}>{item.badge}</div>
                      <h4 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text)]">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                        {item.description}
                      </p>
                    </div>
                    <button type="button" className="sovereign-button-secondary h-11 px-4">
                      Review now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {sparkBlocks.map((block) => {
              const max = Math.max(...block.bars, 0);

              return (
                <article key={block.label} className="sovereign-panel-muted p-5">
                  <div className="sovereign-label">{block.label}</div>
                  <div className="mt-2 text-xl font-bold tracking-tight text-[var(--text)]">
                    {block.value}
                  </div>
                  <div className="mt-4 flex h-20 items-end gap-1">
                    {block.bars.length === 0
                      ? Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={`${block.label}-placeholder-${index}`}
                            className="flex-1 rounded-full bg-[var(--surface-strong)]"
                            style={{ height: `${28 + index * 8}%` }}
                          />
                        ))
                      : block.bars.map((value, index) => (
                          <div
                            key={`${block.label}-${index}`}
                            className="flex-1 rounded-full"
                            style={{
                              height: `${max > 0 ? Math.max((value / max) * 100, 10) : 10}%`,
                              backgroundColor: block.color,
                              opacity: 0.35 + index / (block.bars.length * 1.6),
                            }}
                          />
                        ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="sovereign-dark-panel p-7">
          <div className="sovereign-label text-white/55">System status</div>
          <h3 className="mt-3 font-headline text-2xl font-bold text-white">
            Infrastructure heartbeat
          </h3>

          <div className="mt-8 space-y-5">
            {[
              ['Auth & Identity', '99.9% availability'],
              ['Traveler Marketplace', 'Operational'],
              ['Inventory Approval Core', 'Operational'],
              ['Verification AI', 'Scaling'],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_12px_rgba(154,188,227,0.8)]" />
                  <span className="text-sm text-white/75">{label}</span>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/8 bg-white/6 p-5">
            <div className="sovereign-label text-white/45">Node availability</div>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`node-${index}`}
                  className="h-7 flex-1 rounded-md bg-[var(--primary)]"
                  style={{ opacity: index === 3 ? 0.45 : 0.9 }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              <span>Primary Region</span>
              <span>92% load</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Dashboard;
