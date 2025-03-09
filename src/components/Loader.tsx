import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
  text?: string
}

const Loading = ({ className, size = "md", variant = "primary", text }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }

  const variantClasses = {
    default: "stroke-muted-foreground",
    primary: "stroke-primary",
    secondary: "stroke-secondary"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <svg 
        className={cn("animate-pulse", sizeClasses[size])} 
        viewBox="0 0 64 48"
      >
        <polyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          className={cn("fill-none stroke-[3px] stroke-muted", variantClasses[variant])}
          strokeDasharray="144"
          strokeDashoffset="144"
          style={{
            animation: "dash 1.4s linear infinite"
          }}
        />
      </svg>
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      
      {/* <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style> */}
    </div>
  )
}

export default Loading
