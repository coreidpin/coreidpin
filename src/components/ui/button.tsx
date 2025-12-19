import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary: Black background, white text
        default: "!bg-black hover:!bg-gray-900 !text-white shadow-md hover:shadow-lg active:scale-[0.98] border-0 focus-visible:ring-gray-400",
        
        // Destructive: Red background, white text
        destructive: "!bg-red-600 hover:!bg-red-700 !text-white shadow-md hover:shadow-lg active:scale-[0.98] border-0 focus-visible:ring-red-400",
        
        // Outline: White background, black border and text
        outline: "!bg-white hover:!bg-gray-50 !text-black border-2 !border-black shadow-sm hover:shadow-md active:scale-[0.98] focus-visible:ring-gray-400",
        
        // Secondary: Gray background, black text
        secondary: "!bg-gray-100 hover:!bg-gray-200 !text-gray-900 shadow-sm hover:shadow-md active:scale-[0.98] border-0 focus-visible:ring-gray-400",
        
        // Ghost: Transparent background, becomes black on hover
        ghost: "!bg-transparent hover:!bg-gray-100 !text-gray-900 active:scale-[0.98] focus-visible:ring-gray-400",
        
        // Link: Text only with underline
        link: "!bg-transparent !text-gray-900 underline-offset-4 hover:underline active:opacity-80 focus-visible:ring-gray-400",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 text-base has-[>svg]:px-4",
        icon: "size-10 rounded-md",
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
>(({ className, variant, size, asChild = false, style, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  // Ensure text color is explicitly set via inline styles
  const getInlineStyle = (): React.CSSProperties => {
    const baseStyle = style || {};
    
    switch (variant) {
      case 'default':
      case 'destructive':
        return { ...baseStyle, color: '#ffffff', backgroundColor: variant === 'default' ? '#000000' : '#dc2626' };
      case 'outline':
        return { ...baseStyle, color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' };
      case 'secondary':
        return { ...baseStyle, color: '#111827', backgroundColor: '#f3f4f6' };
      case 'ghost':
      case 'link':
        return { ...baseStyle, color: '#111827' };
      default:
        return { ...baseStyle, color: '#ffffff', backgroundColor: '#000000' };
    }
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={getInlineStyle()}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
