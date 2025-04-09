import * as React from "react"
import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex", className)}
        {...props}
      />
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn(
          "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      />
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(
  ({ className, asChild, href, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : href ? "a" : "span"
    
    return (
      <Comp
        ref={ref}
        className={cn(
          "transition-colors hover:text-foreground",
          href ? "text-muted-foreground hover:text-primary" : "text-foreground font-medium",
          className
        )}
        href={href}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}) => {
  return (
    <li
      className={cn("text-muted-foreground", className)}
      aria-hidden="true"
      {...props}
    >
      {children || <span className="mx-1">/</span>}
    </li>
  )
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} 