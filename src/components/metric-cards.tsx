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
            className="group relative overflow-hidden border-white/20 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${metric.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-full ${metric.color.replace("text-", "bg-")} opacity-0 transition-opacity duration-300 group-hover:opacity-60`}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
