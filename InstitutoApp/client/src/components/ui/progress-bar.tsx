import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  showLabel = false,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className={cn("bg-secondary h-2 rounded-full", barClassName)}
        style={{ width: `${value}%` }}
      >
        {showLabel && (
          <span className="inline-block mt-0.5">{value}%</span>
        )}
      </div>
    </div>
  );
}
