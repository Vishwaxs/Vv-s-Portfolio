import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface-1 p-6 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
