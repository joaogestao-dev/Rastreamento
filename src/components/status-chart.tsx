"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartDataItem } from "@/lib/types";
import { BarChart3, PieChartIcon } from "lucide-react";

interface StatusChartProps {
  data: ChartDataItem[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function BarTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/30 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">
          {payload[0].value}
          <span className="ml-1 text-xs font-normal text-slate-400">pacotes</span>
        </p>
      </div>
    );
  }
  return null;
}

function PieTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-white/30 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-medium text-slate-500">{payload[0].name}</p>
        <p className="text-xl font-bold text-slate-900">
          {payload[0].value}
          <span className="ml-1 text-xs font-normal text-slate-400">pacotes</span>
        </p>
      </div>
    );
  }
  return null;
}

const RADIAN = Math.PI / 180;
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function StatusBarChart({ data }: StatusChartProps) {
  return (
    <Card className="border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <BarChart3 className="h-4 w-4 text-slate-600" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-900">
            Distribuição por Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 40 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#f1f5f9", radius: 6 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={`bar-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusPieChart({ data }: StatusChartProps) {
  return (
    <Card className="border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <PieChartIcon className="h-4 w-4 text-slate-600" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-900">
            Proporção de Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={110}
                labelLine={false}
                label={renderCustomLabel}
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, i) => (
                  <Cell key={`pie-${i}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-[11px] text-slate-500">{item.status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
