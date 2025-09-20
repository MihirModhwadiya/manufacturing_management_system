import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        planned: "bg-planned/10 text-planned border border-planned/20",
        "in-progress": "bg-in-progress/10 text-in-progress border border-in-progress/20",
        completed: "bg-completed/10 text-completed border border-completed/20",
        delayed: "bg-delayed/10 text-delayed border border-delayed/20",
        cancelled: "bg-cancelled/10 text-cancelled border border-cancelled/20",
        low: "bg-muted text-muted-foreground border",
        medium: "bg-warning/10 text-warning border border-warning/20",
        high: "bg-error/10 text-error border border-error/20",
        urgent: "bg-error text-error-foreground border border-error",
      },
    },
    defaultVariants: {
      variant: "planned",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {}

function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props} />
  );
}

export { StatusBadge, statusBadgeVariants };