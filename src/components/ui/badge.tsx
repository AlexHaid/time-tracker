import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import styles from "./badge.module.css"

const variantClasses: Record<string, string> = {
  default: styles.variantDefault,
  secondary: styles.variantSecondary,
  destructive: styles.variantDestructive,
  outline: styles.variantOutline,
}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "destructive" | "outline" | null
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(styles.base, variantClasses[variant ?? "default"], className)}
      {...props}
    />
  )
}

export { Badge }
