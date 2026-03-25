import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-candle-electric-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-candle-electric-blue/30 bg-candle-electric-blue/15 text-candle-accent-blue shadow-glow-sm hover:bg-candle-electric-blue/25 hover:border-candle-electric-blue/50",
        secondary:
          "border border-candle-muted-blue/30 bg-candle-muted-blue/15 text-candle-muted-blue hover:bg-candle-muted-blue/25 hover:border-candle-muted-blue/50",
        destructive:
          "border border-candle-error/30 bg-candle-error/15 text-red-400 shadow-sm hover:bg-candle-error/25 hover:border-candle-error/50",
        outline: 
          "border border-candle-electric-blue/30 bg-transparent text-candle-muted-blue hover:bg-candle-electric-blue/10 hover:text-white",
        success:
          "border border-candle-success/30 bg-candle-success/15 text-green-400 hover:bg-candle-success/25 hover:border-candle-success/50",
        warning:
          "border border-amber-500/30 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }