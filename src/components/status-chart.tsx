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
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">
          {payload[0].value}
          <span className="ml-1 text-xs font-normal text-muted-foreground">pacotes</span>
        </p>
      </div>
    );
  }
  return null;
}

function PieTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
        <p className="text-xs font-medium text-muted-foreground">{payload[0].name}</p>
        <p className="text-xl font-bold text-foreground">
          {payload[0].value}
          <span className="ml-1 text-xs font-normal text-muted-foreground">pacotes</span>
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm font-semibold text-foreground">
            Distribuição por Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 40 }} barSize={32}>
              <defs>
                {data.map((entry, index) => (
                  <linearGradient key={`grad-${index}`} id={`colorUv-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={entry.fill} stopOpacity={1}/>
                    <stop offset="95%" stopColor={entry.fill} stopOpacity={0.4}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#1f1f2e", radius: 6 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={`bar-${i}`} fill={`url(#colorUv-${i})`} />
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
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm font-semibold text-foreground">
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
                stroke="#141420"
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
              <span className="text-[11px] text-gray-400">{item.status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
