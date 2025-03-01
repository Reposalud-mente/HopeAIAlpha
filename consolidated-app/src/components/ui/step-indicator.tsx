import { CheckIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProps {
  id: string
  label: string
  icon?: React.ReactNode
  status?: "complete" | "current" | "upcoming"
}

interface StepIndicatorProps {
  steps: StepProps[]
  currentStep: number
  className?: string
  onStepClick?: (stepIndex: number) => void
}

export function StepIndicator({ steps, currentStep, className, onStepClick }: StepIndicatorProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex items-center min-w-max pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center min-w-[120px]">
            <div
              className={cn(
                "flex items-center gap-2 md:gap-3 rounded-lg px-2 md:px-4 py-2 md:py-3 transition-all",
                index < currentStep && "bg-green-100 text-green-800",
                index === currentStep && "bg-blue-100 text-blue-800",
                index > currentStep && "bg-gray-100 text-gray-500",
                onStepClick && "cursor-pointer hover:opacity-90"
              )}
              onClick={() => onStepClick && onStepClick(index)}
              role={onStepClick ? "button" : undefined}
              aria-current={index === currentStep ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex h-6 w-6 md:h-8 md:w-8 flex-shrink-0 items-center justify-center rounded-full",
                  index < currentStep && "bg-green-500 text-white",
                  index === currentStep && "bg-blue-500 text-white",
                  index > currentStep && "bg-gray-200 text-gray-500"
                )}
              >
                {index < currentStep ? (
                  <CheckIcon className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <span className="text-xs md:text-sm">{index + 1}</span>
                )}
              </div>
              <span className="font-medium text-xs md:text-sm whitespace-nowrap">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 px-1 md:px-2 flex justify-center">
                <ChevronRightIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

