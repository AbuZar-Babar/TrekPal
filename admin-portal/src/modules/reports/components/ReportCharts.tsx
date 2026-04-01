import {
  BookingsChartPoint,
  RevenueChartPoint,
  UserGrowthPoint,
} from '../services/reportsService';

interface ReportChartsProps {
  revenueData: RevenueChartPoint[];
  bookingsData: BookingsChartPoint[];
  userGrowthData: UserGrowthPoint[];
}

const ChartCard = ({
  title,
  subtitle,
  color,
  values,
  valueFormatter,
}: {
  title: string;
  subtitle: string;
  color: string;
  values: Array<{ month: string; value: number }>;
  valueFormatter: (value: number) => string;
}) => {
  const maxValue = Math.max(...values.map((value) => value.value), 0);

  return (
    <article className="sovereign-panel p-6">
      <div className="sovereign-label">{title}</div>
      <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{subtitle}</p>

      <div className="mt-6 flex h-56 items-end justify-between gap-3">
        {values.map((item) => {
          const height = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 12) : 12;
          return (
            <div key={`${title}-${item.month}`} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-44 w-full items-end rounded-[18px] bg-[var(--surface-low)] px-2 py-2">
                <div
                  className="w-full rounded-[12px]"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, color-mix(in srgb, ${color} 72%, white 28%), ${color})`,
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
                  {item.month}
                </div>
                <div className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                  {valueFormatter(item.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

const ReportCharts = ({ revenueData, bookingsData, userGrowthData }: ReportChartsProps) => {
  const revenueValues = revenueData.map((item) => ({ month: item.month, value: item.revenue }));
  const bookingsValues = bookingsData.map((item) => ({ month: item.month, value: item.bookings }));
  const userGrowthValues = userGrowthData.map((item) => ({ month: item.month, value: item.users }));

  return (
    <div className="grid gap-6">
      <ChartCard
        title="Revenue Trend"
        subtitle="Monthly revenue movement across the selected reporting window."
        color="var(--primary)"
        values={revenueValues}
        valueFormatter={(value) => `PKR ${Math.round(value).toLocaleString()}`}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Bookings Trend"
          subtitle="Confirmed booking volume by reporting period."
          color="#526074"
          values={bookingsValues}
          valueFormatter={(value) => value.toLocaleString()}
        />
        <ChartCard
          title="User Growth"
          subtitle="Traveler growth curve for the same reporting window."
          color="#595e78"
          values={userGrowthValues}
          valueFormatter={(value) => value.toLocaleString()}
        />
      </div>
    </div>
  );
};

export default ReportCharts;
