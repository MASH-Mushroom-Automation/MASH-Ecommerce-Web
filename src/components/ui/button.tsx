import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { colors } from "@/lib/colors"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-[#6A994E] text-white hover:bg-[#6A994E]/90 shadow-sm hover:shadow-md",
        primary: "bg-[#1E392A] text-white hover:bg-[#1E392A]/90 shadow-sm hover:shadow-md",
        secondary: "bg-[#6A994E] text-white hover:bg-[#6A994E]/90 shadow-sm hover:shadow-md",
        outline: "bg-white text-[#1F2937] hover:bg-[#F5F5F5] hover:text-[#1E392A] shadow-md hover:shadow-lg ring-1 ring-gray-200",
        ghost: "text-[#1F2937] hover:bg-[#F5F5F5] hover:text-[#1E392A]",
        link: "text-[#6A994E] underline-offset-4 hover:underline",
        destructive: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 sm:h-10 min-h-[44px] px-4 py-2",
        sm: "h-9 sm:h-9 min-h-[40px] rounded-md px-3",
        lg: "h-11 sm:h-11 min-h-[48px] rounded-md px-6",
        xl: "h-12 sm:h-12 min-h-[52px] rounded-md px-8 text-base",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
        "icon-sm": "h-9 w-9 min-h-[40px] min-w-[40px]",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, rounded, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
