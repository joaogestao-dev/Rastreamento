"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EventMetric } from "@/lib/types";
import { motion, Variants } from "framer-motion";

interface MetricCardsProps {
  metrics: EventMetric[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <motion.div 
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        
        // Adapting colors from slate to sleek zinc/neutral vibe
        const bgColorMap = metric.bgColor.replace("-50", "-100/50");
        
        return (
          <motion.div key={metric.label} variants={itemVariants}>
            <Card
              className="group relative cursor-default overflow-hidden border-zinc-200/60 bg-white/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                      {metric.label}
                    </p>
                    <p className="font-geist text-3xl font-extrabold tracking-tight text-zinc-900">
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bgColorMap} transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3`}
                  >
                    <Icon className={`h-5 w-5 ${metric.color}`} strokeWidth={2.5} />
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 h-[3px] w-full ${metric.color.replace("text-", "bg-")} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
