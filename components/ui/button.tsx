import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-transparent text-sm font-bold whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/40 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary),black_18%)] hover:brightness-105",
        outline:
          "border-border bg-background text-foreground shadow-[0_3px_0_0_var(--border)] hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_3px_0_0_color-mix(in_oklab,var(--secondary),black_10%)] hover:brightness-95",
        ghost: "shadow-none hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive border-destructive text-destructive-foreground shadow-[0_3px_0_0_color-mix(in_oklab,var(--destructive),black_18%)] hover:brightness-105",
        link: "rounded-none border-0 text-primary shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        xs: "h-7 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
