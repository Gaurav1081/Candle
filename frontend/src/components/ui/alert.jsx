import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: 
          "bg-candle-electric-blue/10 border-candle-electric-blue/30 text-white backdrop-blur-sm [&>svg]:text-candle-accent-blue",
        destructive:
          "bg-candle-error/10 border-candle-error/30 text-red-400 backdrop-blur-sm [&>svg]:text-red-400",
        success:
          "bg-candle-success/10 border-candle-success/30 text-green-400 backdrop-blur-sm [&>svg]:text-green-400",
        warning:
          "bg-amber-500/10 border-amber-500/30 text-amber-400 backdrop-blur-sm [&>svg]:text-amber-400",
        info:
          "bg-candle-muted-blue/10 border-candle-muted-blue/30 text-candle-muted-blue backdrop-blur-sm [&>svg]:text-candle-muted-blue",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }