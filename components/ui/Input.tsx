import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full rounded-lg border border-line bg-surface-0 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent-500 focus:outline-2 focus:outline-accent-500/30 disabled:opacity-50";

export function Input({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-secondary">
          {label}
        </span>
      )}
      <input {...props} className={cn(fieldClasses, error && "border-danger", className)} />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-secondary">
          {label}
        </span>
      )}
      <textarea
        {...props}
        className={cn(fieldClasses, "min-h-28", error && "border-danger", className)}
      />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  error,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-secondary">
          {label}
        </span>
      )}
      <select {...props} className={cn(fieldClasses, error && "border-danger", className)}>
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
