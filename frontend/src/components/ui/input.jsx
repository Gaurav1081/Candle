import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-candle-electric-blue/30 bg-candle-deep-dark/60 backdrop-blur-sm px-3 py-1 text-base text-white shadow-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-candle-muted-blue/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candle-electric-blue focus-visible:ring-offset-0 focus-visible:border-candle-electric-blue focus-visible:bg-candle-deep-dark/80 focus-visible:shadow-glow-sm hover:border-candle-accent-blue/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }