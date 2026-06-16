import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-500 focus-visible:outline-accent-600",
  secondary:
    "border border-line bg-surface-1 text-ink hover:bg-surface-2 focus-visible:outline-accent-600",
  ghost: "text-ink-secondary hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90 focus-visible:outline-danger",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = BaseProps & { href: string; target?: string; rel?: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if ("href" in props && props.href !== undefined) {
    const { href, target, rel } = props;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = { ...(props as ButtonProps) };
  delete buttonProps.variant;
  delete buttonProps.size;
  delete buttonProps.className;
  delete (buttonProps as { children?: unknown }).children;
  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
