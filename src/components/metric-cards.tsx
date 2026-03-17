"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EventMetric } from "@/lib/types";

interface MetricCardsProps {
  metrics: EventMetric[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.label}
            className="group relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
              {/* Subtle bottom accent bar */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${metric.bgColor}`}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
