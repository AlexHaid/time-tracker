import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import styles from "./button.module.css"

const variantClasses: Record<string, string> = {
  default: styles.variantDefault,
  destructive: styles.variantDestructive,
  outline: styles.variantOutline,
  secondary: styles.variantSecondary,
  ghost: styles.variantGhost,
  link: styles.variantLink,
}

const sizeClasses: Record<string, string> = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
}

function getButtonClasses(
  variant: string | undefined | null,
  size: string | undefined | null,
  className?: string
) {
  return cn(
    styles.base,
    variantClasses[variant ?? "default"],
    sizeClasses[size ?? "default"],
    className
  )
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
  size?: "default" | "sm" | "lg" | "icon" | null
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={getButtonClasses(variant, size, className)}
      {...props}
    />
  )
}

export { Button, getButtonClasses }
