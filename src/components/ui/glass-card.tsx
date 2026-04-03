import * as React from "react";
import { cn } from "@/lib/utils";

type GlassVariant = "default" | "elevated" | "subtle";

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: GlassVariant;
}

const variantClasses: Record<GlassVariant, string> = {
  default: "glass rounded-2xl",
  elevated: "glass-elevated rounded-2xl",
  subtle: "glass-subtle rounded-2xl",
};

function GlassCard({ variant = "default", className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
}

export { GlassCard };
export type { GlassCardProps, GlassVariant };
