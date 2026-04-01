import { useDashboardStats } from '../../dashboard/hooks/useDashboard';

import { formatDateTime } from '../../../shared/utils/formatters';

const now = new Date();

const activityFeed = [
  {
    title: 'Agency verification flagged for manual inspection',
    description: 'A mismatch was detected between submitted business registration and office proof.',
    tag: 'Agency audit',
    tone: 'danger',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  },
  {
    title: 'Traveler KYC volume increased across Lahore and Islamabad',
    description: 'Daily KYC submissions exceeded the rolling weekly average by 18%.',
    tag: 'Traveler queue',
    tone: 'warning',
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
  },
  {
    title: 'Hotel moderation sweep completed successfully',
    description: 'No critical anomalies found in the latest hospitality inventory review batch.',
    tag: 'Hotel moderation',
    tone: 'success',
    timestamp: new Date(now.getTime() - 9 * 60 * 60 * 1000),
  },
  {
    title: 'Vehicle compliance watchlist refreshed',
    description: 'Operational fleet records were re-indexed for insurance and registration checks.',
    tag: 'Vehicle audit',
    tone: 'neutral',
    timestamp: new Date(now.getTime() - 14 * 60 * 60 * 1000),
  },
];

const toneClasses: Record<string, string> = {
  success: 'sovereign-pill sovereign-pill-success',
  warning: 'sovereign-pill sovereign-pill-warning',
  danger: 'sovereign-pill sovereign-pill-danger',
  neutral: 'sovereign-pill sovereign-pill-neutral',
};

const ActivityDashboard = () => {
  const { data: stats } = useDashboardStats();

  const eventMetrics = [
    {
      label: 'Pending Agency Reviews',
      value: stats?.pendingAgencies ?? 0,
      detail: 'Applications awaiting formal decision.',
    },
    {
      label: 'Pending Hotel Reviews',
      value: stats ? stats.totalHotels - stats.approvedHotels : 0,
      detail: 'Hospitality inventory requiring moderation.',
    },
    {
      label: 'Pending Vehicle Reviews',
      value: stats ? stats.totalVehicles - stats.approvedVehicles : 0,
      detail: 'Fleet records needing inspection.',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="sovereign-panel overflow-hidden p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="sovereign-label">Audit & moderation activity</div>
              <h2 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-[var(--text)]">
                Decision queues that need sovereign attention
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                Track review spikes, moderation flags, and operational events from one editorial
                activity ledger.
              </p>
            </div>

            <div className="sovereign-pill sovereign-pill-success">Live monitoring</div>
          </div>

          <div className="mt-8 space-y-4">
            {activityFeed.map((item) => (
              <article
                key={`${item.title}-${item.tag}`}
                className="rounded-[22px] border border-[var(--border)] bg-[var(--panel-muted)] p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className={toneClasses[item.tone]}>{item.tag}</div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    {formatDateTime(item.timestamp)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sovereign-dark-panel p-7">
            <div className="sovereign-label text-white/55">Operational posture</div>
            <h3 className="mt-3 font-headline text-2xl font-bold text-white">
              Activity heartbeat
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Enforcement remains stable, but agency and traveler review queues need active daily
              handling to preserve approval velocity.
            </p>

            <div className="mt-8 space-y-4">
              {eventMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[20px] bg-white/8 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    {metric.label}
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-headline text-3xl font-extrabold text-white">
                      {metric.value}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-white/65">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sovereign-panel p-6">
            <div className="sovereign-label">Current focus</div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <li>Prioritize pending agency files submitted within the last 48 hours.</li>
              <li>Keep traveler KYC backlog under the daily intake level.</li>
              <li>Audit rejected vehicles for repeated compliance drift.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ActivityDashboard;
