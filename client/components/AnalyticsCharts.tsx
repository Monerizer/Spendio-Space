import React from "react";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export function BarChart({ data, title, currency = "€" }: { data: ChartData[]; title: string; currency?: string }) {
  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-[#1a1a1a]">{title}</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-[#1a1a1a]">{item.label}</span>
              <span className="text-sm font-semibold text-[#666666]">
                {currency}{item.value.toFixed(0)}
              </span>
            </div>
            <div className="w-full h-8 bg-[#f3f3f3] rounded-lg overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${item.color}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PieChart({ data, title }: { data: ChartData[]; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentAngle = 0;

  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    return {
      item,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: ((item.value / total) * 100).toFixed(1),
    };
  });

  // Map colors to SVG fill colors
  const colorMap: Record<string, string> = {
    "bg-green-500": "#22c55e",
    "bg-blue-500": "#3b82f6",
    "bg-red-500": "#ef4444",
    "bg-yellow-500": "#eab308",
    "bg-purple-500": "#a855f7",
  };

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-[#1a1a1a]">{title}</h3>
      <div className="flex gap-6 items-center justify-center flex-wrap">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.path}
              fill={colorMap[slice.item.color] || "#ccc"}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="space-y-2">
          {data.map((item, idx) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-[#666666]">
                  {item.label}: {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TrendChart({
  data,
  title,
  color,
  currency = "€",
}: {
  data: { month: string; value: number }[];
  title: string;
  color: string;
  currency?: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value)) || 1;
  const minValue = Math.min(...data.map((d) => d.value)) || 0;
  const range = maxValue - minValue || 1;

  const points = data
    .map((item, idx) => {
      const x = (idx / (data.length - 1 || 1)) * 280 + 10;
      const y = 120 - ((item.value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-[#1a1a1a]">{title}</h3>
      <div className="space-y-3">
        <svg height="150" width="100%" viewBox="0 0 300 150" style={{ minHeight: "150px" }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={120 - y} x2="300" y2={120 - y} stroke="#e5e5e5" strokeWidth="1" />
          ))}

          {/* Trend line */}
          <polyline
            points={points}
            fill="none"
            stroke={color === "bg-green-500" ? "#22c55e" : "#3b82f6"}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {data.map((item, idx) => {
            const x = (idx / (data.length - 1 || 1)) * 280 + 10;
            const y = 120 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="3"
                fill={color === "bg-green-500" ? "#22c55e" : "#3b82f6"}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          {data.map((item) => (
            <div key={item.month} className="flex justify-between min-w-20">
              <span className="text-[#666666]">{item.month}:</span>
              <span className="font-semibold text-[#1a1a1a]">{currency}{item.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
