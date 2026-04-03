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
            className="group relative cursor-default overflow-hidden glass rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-foreground">
                    {metric.value}
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.05] transition-transform duration-500 group-hover:scale-105"
                >
                  <Icon className={`h-5 w-5 ${metric.color}`} strokeWidth={2.5} />
                </div>
              </div>
              <div
                className={`absolute bottom-0 left-0 h-[3px] w-full ${metric.color.replace("text-", "bg-")} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
