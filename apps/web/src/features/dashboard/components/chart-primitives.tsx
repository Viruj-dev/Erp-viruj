"use client";

interface BarDatum {
  name: string;
  value: number;
}

export function MiniBarChart({ data }: { data: readonly BarDatum[] }) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="flex h-64 items-end gap-3">
      {data.map((item) => (
        <div
          key={item.name}
          className="flex flex-1 flex-col items-center gap-3"
        >
          <div className="flex h-full w-full items-end rounded-2xl bg-surface-container-low px-2 pb-2">
            <div
              className="w-full rounded-xl bg-gradient-to-t from-primary to-primary-container"
              style={{ height: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DonutStat({
  value,
  total,
  color,
  label,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
}) {
  const percent = Math.round((value / total) * 100);
  const degrees = (value / total) * 360;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative flex h-44 w-44 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${degrees}deg, #eceef0 ${degrees}deg 360deg)`,
        }}
      >
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
          <span className="font-headline text-3xl font-black text-on-surface">
            {percent}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

interface LineDatum {
  month: string;
  revenue: number;
  expenses: number;
}

export function LineCompare({ data }: { data: readonly LineDatum[] }) {
  const width = 100;
  const height = 100;
  const max = Math.max(
    ...data.flatMap((item) => [item.revenue, item.expenses])
  );

  const buildPath = (key: "revenue" | "expenses") =>
    data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - (item[key] / max) * height;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return (
    <div className="space-y-4">
      <svg
        className="h-[320px] w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <path
          d={buildPath("expenses")}
          fill="none"
          stroke="#006a6a"
          strokeWidth="2.5"
        />
        <path
          d={buildPath("revenue")}
          fill="none"
          stroke="#00478d"
          strokeWidth="2.5"
        />
      </svg>
      <div className="grid grid-cols-7 gap-2">
        {data.map((item) => (
          <span
            key={item.month}
            className="text-center text-[11px] font-bold uppercase tracking-wider text-outline"
          >
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
}
