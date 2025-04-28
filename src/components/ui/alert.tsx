import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export function Alert({ children, className, variant = "default", ...props }: AlertProps) {
  const styles = {
    default: {
      background: "#fff8db",
      border: "1px solid #ffe066",
      color: "#856404",
    },
    destructive: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#b91c1c",
    },
  };

  return (
    <div
      className={cn("rounded-lg p-4 mb-4", className)}
      style={{
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
        ...styles[variant],
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...props} style={{ margin: 0, ...props.style }}>
      {children}
    </p>
  );
}
