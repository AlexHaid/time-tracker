import * as React from "react"

import { cn } from "@/lib/utils"
import styles from "./alert.module.css"

const variantClasses: Record<string, string> = {
  default: styles.variantDefault,
  destructive: styles.variantDestructive,
}

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive" | null
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(styles.base, variantClasses[variant ?? "default"], className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(styles.alertTitle, className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(styles.alertDescription, className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
