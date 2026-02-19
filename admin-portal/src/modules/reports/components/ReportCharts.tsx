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
  colorClass,
  maxValue,
  values,
  valueFormatter,
}: {
  title: string;
  colorClass: string;
  maxValue: number;
  values: Array<{ month: string; value: number }>;
  valueFormatter: (value: number) => string;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-52 flex items-end justify-between gap-2">
        {values.map((item) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={`${title}-${item.month}`} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '180px' }}>
                <div
                  className={`w-full rounded-lg absolute bottom-0 transition-all duration-500 ${colorClass}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-2 font-medium">{item.month}</span>
              <span className="text-[10px] text-gray-400">{valueFormatter(item.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReportCharts = ({ revenueData, bookingsData, userGrowthData }: ReportChartsProps) => {
  const revenueValues = revenueData.map((r) => ({ month: r.month, value: r.revenue }));
  const bookingsValues = bookingsData.map((b) => ({ month: b.month, value: b.bookings }));
  const userGrowthValues = userGrowthData.map((u) => ({ month: u.month, value: u.users }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <ChartCard
        title="Revenue Trend"
        colorClass="bg-gradient-to-t from-indigo-500 to-indigo-400"
        maxValue={Math.max(...revenueValues.map((v) => v.value), 0)}
        values={revenueValues}
        valueFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
      />
      <ChartCard
        title="Bookings Trend"
        colorClass="bg-gradient-to-t from-green-500 to-emerald-400"
        maxValue={Math.max(...bookingsValues.map((v) => v.value), 0)}
        values={bookingsValues}
        valueFormatter={(value) => value.toString()}
      />
      <ChartCard
        title="User Growth"
        colorClass="bg-gradient-to-t from-purple-500 to-violet-400"
        maxValue={Math.max(...userGrowthValues.map((v) => v.value), 0)}
        values={userGrowthValues}
        valueFormatter={(value) => value.toString()}
      />
    </div>
  );
};

export default ReportCharts;
