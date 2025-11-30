import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:bg-primary/90 active:scale-95 transition-all",
        destructive:
          "bg-destructive text-white shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40 hover:bg-destructive/90 active:scale-95 transition-all",
        outline:
          "bg-transparent border border-border text-foreground hover:bg-muted hover:border-primary/50 shadow-sm hover:shadow-md transition-all",
        secondary:
          "bg-secondary text-white shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 hover:bg-secondary/90 active:scale-95 transition-all",
        ghost: "hover:bg-muted hover:text-foreground text-muted-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline transition-colors",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-6 text-base has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants, type ButtonProps };
