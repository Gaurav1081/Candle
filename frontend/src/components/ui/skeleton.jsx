import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-candle-electric-blue/10 animate-shimmer rounded-md backdrop-blur-sm border border-candle-electric-blue/20", className)}
      {...props} />
  );
}

export { Skeleton }