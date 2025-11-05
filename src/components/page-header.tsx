import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <div className="text-base text-muted-foreground">{description}</div>}
      </div>
      {action}
    </div>
  )
}
