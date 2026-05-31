import { useState, useId, useRef, useEffect } from 'react';

interface SimpleChartPoint {
  label: string;
  value: number;
}

interface SimpleChartCardProps {
  title: string;
  subtitle?: string;
  points: SimpleChartPoint[];
  valueFormatter?: (value: number) => string;
  /** Pass a real hex / rgb string — CSS vars don't resolve inside SVG attributes */
  color?: string;
}

// ─── Layout constants ────────────────────────────────────────────────────────
const VW = 560;
const VH = 160;
const PAD = { top: 12, right: 20, bottom: 4, left: 20 };
const innerW = VW - PAD.left - PAD.right;
const innerH = VH - PAD.top - PAD.bottom;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map data → SVG coords with a non-zero baseline (±10 % headroom). */
const project = (points: SimpleChartPoint[]) => {
  const values = points.map((p) => p.value);
  const dataMax = Math.max(...values, 1);
  const dataMin = Math.min(...values, 0);
  const range = dataMax - dataMin || 1;

  // Give 8 % breathing room above and below so the line never hugs the edge
  const visMin = dataMin - range * 0.08;
  const visMax = dataMax + range * 0.08;
  const visRange = visMax - visMin;

  return points.map((p, i) => ({
    x: PAD.left + (i / Math.max(points.length - 1, 1)) * innerW,
    y: PAD.top + innerH - ((p.value - visMin) / visRange) * innerH,
    label: p.label,
    value: p.value,
  }));
};

/** Smooth cubic-bezier path (Catmull-Rom → Bezier). */
const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return '';
  const t = 0.3; // tension
  const d: string[] = [`M ${pts[0].x},${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }
  return d.join(' ');
};

// ─── Resolve CSS variables to real colour strings ─────────────────────────────
const resolveCssColor = (raw: string): string => {
  if (!raw.startsWith('var(')) return raw;
  try {
    const prop = raw.replace(/^var\(/, '').replace(/\)$/, '').trim();
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(prop)
      .trim();
    return resolved || '#888';
  } catch {
    return '#888';
  }
};

// ─── Component ───────────────────────────────────────────────────────────────

const SimpleChartCard = ({
  title,
  subtitle,
  points,
  valueFormatter = (v) => v.toLocaleString(),
  color = '#888888',
}: SimpleChartCardProps) => {
  const uid = useId().replace(/:/g, '');
  const [active, setActive] = useState<number | null>(null);
  const [resolvedColor, setResolvedColor] = useState(color);
  const svgRef = useRef<SVGSVGElement>(null);

  // Resolve CSS variable on mount and when color prop changes
  useEffect(() => {
    setResolvedColor(resolveCssColor(color));
  }, [color]);

  if (!points.length) {
    return (
      <article className="sovereign-panel p-6">
        <div className="sovereign-label">{title}</div>
        {subtitle ? <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p> : null}
        <div className="mt-8 flex h-36 items-center justify-center text-sm text-[var(--text-soft)]">
          No data available
        </div>
      </article>
    );
  }

  const projected = project(points);
  const linePath = smoothPath(projected);
  const first = projected[0];
  const last = projected[projected.length - 1];
  const bottomY = PAD.top + innerH;
  const fillPath = `${linePath} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;

  // 3 horizontal guide lines
  const gridLines = [0.25, 0.5, 0.75].map(
    (f) => PAD.top + innerH * (1 - f),
  );

  const activePoint = active !== null ? projected[active] : null;
  const hitWidth = innerW / Math.max(points.length, 1);

  return (
    <article className="sovereign-panel overflow-hidden">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-2">
        <div className="min-w-0">
          <div className="sovereign-label">{title}</div>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>

        {/* Live value — appears on hover */}
        <div
          className="shrink-0 text-right transition-opacity duration-150"
          style={{ opacity: activePoint ? 1 : 0, minWidth: '6rem' }}
        >
          <div
            className="text-base font-semibold tabular-nums leading-tight"
            style={{ color: resolvedColor }}
          >
            {activePoint ? valueFormatter(activePoint.value) : ''}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-soft)]">
            {activePoint?.label ?? ''}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative select-none px-0 pb-5 pt-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH + 28}`}
          className="w-full overflow-visible"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <defs>
            {/* Area fill gradient — use real colour string, not a CSS var */}
            <linearGradient id={`fg-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                style={{ stopColor: resolvedColor, stopOpacity: 0.22 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: resolvedColor, stopOpacity: 0 }}
              />
            </linearGradient>

            {/* Soft glow on the line */}
            <filter id={`gl-${uid}`} x="-10%" y="-60%" width="120%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip to chart area only */}
            <clipPath id={`cp-${uid}`}>
              <rect x={PAD.left} y={0} width={innerW} height={VH + 4} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {gridLines.map((y, i) => (
            <line
              key={i}
              x1={PAD.left}
              y1={y}
              x2={VW - PAD.right}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
          ))}

          {/* Filled area */}
          <path
            d={fillPath}
            fill={`url(#fg-${uid})`}
            clipPath={`url(#cp-${uid})`}
          />

          {/* Main line with glow */}
          <path
            d={linePath}
            fill="none"
            stroke={resolvedColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#gl-${uid})`}
            clipPath={`url(#cp-${uid})`}
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: 0,
              animation: 'chart-draw 1.1s cubic-bezier(0.4,0,0.2,1) forwards',
            }}
          />

          {/* Data-point dots */}
          {projected.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={active === i ? 5 : 3}
              fill={active === i ? resolvedColor : 'var(--surface)'}
              stroke={resolvedColor}
              strokeWidth="2"
              style={{ transition: 'r 100ms ease, fill 100ms ease' }}
            />
          ))}

          {/* Active crosshair */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={PAD.top}
              x2={activePoint.x}
              y2={bottomY}
              stroke={resolvedColor}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.45"
            />
          )}

          {/* Invisible hover hit-areas */}
          {projected.map((pt, i) => (
            <rect
              key={i}
              x={pt.x - hitWidth / 2}
              y={0}
              width={hitWidth}
              height={VH}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}

          {/* X-axis labels */}
          {projected.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={VH + 20}
              textAnchor="middle"
              fill="var(--text-soft)"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.05em"
              style={{ textTransform: 'uppercase', fontFamily: 'inherit' }}
            >
              {pt.label}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
};

export default SimpleChartCard;
