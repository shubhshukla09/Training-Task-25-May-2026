"use client";

import { useState } from "react";

export interface ChartDataPoint {
  date: string;
  views: number;
  visitors: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 italic text-sm">
        No page views data recorded.
      </div>
    );
  }

  // 1. Chart sizing variables
  const width = 700;
  const height = 280;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // 2. Compute bounds
  const maxViews = Math.max(...data.map((d) => d.views), 100);
  const maxVisitors = Math.max(...data.map((d) => d.visitors), 50);
  const maxVal = Math.max(maxViews, maxVisitors) * 1.15; // 15% head room

  // 3. Map points to SVG coordinates
  const points = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const yViews = height - paddingY - (d.views / maxVal) * chartHeight;
    const yVisitors = height - paddingY - (d.visitors / maxVal) * chartHeight;
    return { x, yViews, yVisitors, ...d };
  });

  // 4. Generate SVG Line Paths (Cubic Bezier curve helpers or clean polyline)
  let viewsPath = "";
  let visitorsPath = "";
  let viewsAreaPath = "";
  let visitorsAreaPath = "";

  if (points.length > 0) {
    // Generate clean segmented line coordinate maps
    viewsPath = `M ${points[0].x} ${points[0].yViews} ` + points.slice(1).map(p => `L ${p.x} ${p.yViews}`).join(" ");
    visitorsPath = `M ${points[0].x} ${points[0].yVisitors} ` + points.slice(1).map(p => `L ${p.x} ${p.yVisitors}`).join(" ");

    // Generate area-fill shape paths closing back at the chart baseline
    viewsAreaPath = `${viewsPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
    visitorsAreaPath = `${visitorsPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <div className="w-full flex flex-col p-6 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
      {/* Chart Legend Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white">Platform Activity Stream</h3>
          <p className="text-xs text-zinc-400">Chronological traffic over the last 7 days</p>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-glow-cyan" />
            <span className="text-xs font-semibold text-zinc-300">Page Views</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-violet-600 shadow-glow-violet" />
            <span className="text-xs font-semibold text-zinc-300">Unique Visitors</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Box */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Area gradients */}
            <linearGradient id="viewsGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="visitorsGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* horizontal background grid dividers */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingY + ratio * chartHeight;
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={index} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Gradients Filling */}
          <path d={viewsAreaPath} fill="url(#viewsGlow)" />
          <path d={visitorsAreaPath} fill="url(#visitorsGlow)" />

          {/* Activity Vector Stroke Lines */}
          <path
            d={viewsPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-chart"
            style={{
              strokeDasharray: "1000",
              strokeDashoffset: hoveredIdx === null ? "0" : "0", // Trigger standard layouts
            }}
          />
          <path
            d={visitorsPath}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-chart"
          />

          {/* Interactive Hover Columns */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Invisible touch target vertical bar */}
              <rect
                x={p.x - chartWidth / (data.length * 2)}
                y={paddingY}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(idx)}
                className="cursor-pointer"
              />

              {/* Vertical highlight bar on active column hover */}
              {hoveredIdx === idx && (
                <line
                  x1={p.x}
                  y1={paddingY}
                  x2={p.x}
                  y2={height - paddingY}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.5"
                  pointerEvents="none"
                />
              )}

              {/* Interactive Views Indicator Node */}
              {hoveredIdx === idx && (
                <>
                  <circle
                    cx={p.x}
                    cy={p.yViews}
                    r="6"
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />
                  <circle
                    cx={p.x}
                    cy={p.yVisitors}
                    r="6"
                    fill="#8b5cf6"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />
                </>
              )}

              {/* X Axis Date labels */}
              <text
                x={p.x}
                y={height - paddingY + 18}
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                textAnchor="middle"
                pointerEvents="none"
              >
                {p.date.split(",")[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Floating details tooltip below graph */}
      <div className="h-12 mt-4 border-t border-white/5 pt-3 flex items-center justify-center">
        {hoveredIdx !== null ? (
          <div className="flex items-center space-x-6 text-xs animate-fade-in-up">
            <span className="font-semibold text-white">{data[hoveredIdx].date}</span>
            <span className="text-zinc-400">|</span>
            <span className="text-cyan-400 font-bold flex items-center space-x-1">
              <span>Views:</span>
              <span>{data[hoveredIdx].views}</span>
            </span>
            <span className="text-zinc-400">|</span>
            <span className="text-violet-400 font-bold flex items-center space-x-1">
              <span>Unique:</span>
              <span>{data[hoveredIdx].visitors}</span>
            </span>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">Hover over the chart to inspect page metrics</p>
        )}
      </div>
    </div>
  );
}
