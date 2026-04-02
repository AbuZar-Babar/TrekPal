interface SimpleChartPoint {
  label: string;
  value: number;
}

interface SimpleChartCardProps {
  title: string;
  subtitle?: string;
  points: SimpleChartPoint[];
  valueFormatter?: (value: number) => string;
  color?: string;
}

const SimpleChartCard = ({
  title,
  subtitle,
  points,
  valueFormatter = (value) => value.toLocaleString(),
  color = 'var(--primary)',
}: SimpleChartCardProps) => {
  const maxValue = Math.max(...points.map((point) => point.value), 0);

  return (
    <article className="sovereign-panel p-6">
      <div className="sovereign-label">{title}</div>
      {subtitle ? <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p> : null}

      <div className="mt-6 flex h-56 items-end justify-between gap-3">
        {points.map((point) => {
          const height = maxValue > 0 ? Math.max((point.value / maxValue) * 100, 12) : 12;
          return (
            <div key={`${title}-${point.label}`} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-44 w-full items-end rounded-[18px] bg-[var(--surface-low)] px-2 py-2">
                <div
                  className="w-full rounded-[12px]"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, color-mix(in srgb, ${color} 70%, white 30%), ${color})`,
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
                  {point.label}
                </div>
                <div className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                  {valueFormatter(point.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default SimpleChartCard;
