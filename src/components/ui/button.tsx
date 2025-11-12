import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand-primary)] text-[var(--brand-primary-contrast)] hover:opacity-90 active:opacity-80",
        destructive: "bg-[var(--brand-danger)] text-white hover:opacity-90 active:opacity-80",
        outline: "border border-[var(--brand-primary)] bg-transparent text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-contrast)]",
        secondary: "bg-[var(--brand-secondary)] text-[var(--brand-primary-contrast)] hover:opacity-90 active:opacity-80",
        ghost: "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-contrast)]",
        link: "text-[var(--brand-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
