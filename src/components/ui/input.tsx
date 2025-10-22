import * as React from "react"

import { cn } from "@/lib/utils"
import { colors } from "@/lib/colors"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

function Input({ className, type, icon, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900",
          "placeholder:text-gray-400",
          "transition-colors duration-200",
          "focus:border-[#6A994E] focus:outline-none focus:ring-2 focus:ring-[#6A994E]/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input }
