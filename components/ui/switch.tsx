"use client"

import * as React from "react"
import { Switch as ChakraSwitch, SwitchProps as ChakraSwitchProps } from "@chakra-ui/react"
import { cn } from "@/lib/utils"

export type SwitchProps = ChakraSwitchProps

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <ChakraSwitch
        ref={ref}
        colorScheme="purple"
        className={cn("", className)}
        {...props}
      />
    )
  }
)
Switch.displayName = "Switch"

export { Switch } 