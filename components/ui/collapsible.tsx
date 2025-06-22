"use client"

import * as React from "react"
import { Collapse, CollapseProps } from "@chakra-ui/react"
import { cn } from "@/lib/utils"

export type CollapsibleProps = CollapseProps

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Collapse
        ref={ref}
        className={cn("", className)}
        {...props}
      >
        {children}
      </Collapse>
    )
  }
)
Collapsible.displayName = "Collapsible"

export { Collapsible } 