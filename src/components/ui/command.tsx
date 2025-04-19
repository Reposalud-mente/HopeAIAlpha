import * as React from "react"

interface CommandProps {
  children: React.ReactNode
}
export function Command({ children }: CommandProps) {
  return <div>{children}</div>
}
export function CommandInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full border-b px-2 py-1 mb-2" {...props} />
}
export function CommandEmpty({ children }: { children: React.ReactNode }) {
  return <div className="text-gray-400 px-2 py-1">{children}</div>
}
export function CommandGroup({ children }: { children: React.ReactNode }) {
  return <div className="py-1">{children}</div>
}
export function CommandItem({ children, value, onSelect }: { children: React.ReactNode; value: string; onSelect: () => void }) {
  return (
    <div
      className="flex items-center px-2 py-1 cursor-pointer hover:bg-blue-50 rounded"
      tabIndex={0}
      role="option"
      aria-selected={false}
      onClick={onSelect}
    >
      {children}
    </div>
  )
}
