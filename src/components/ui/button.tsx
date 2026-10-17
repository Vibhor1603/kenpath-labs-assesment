import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-surface shadow-[inset_0_1px_0_rgb(255_255_255/0.14),var(--shadow-md)] hover:bg-[color-mix(in_oklch,var(--ink),white_10%)]",
        secondary:
          "bg-surface text-ink ring-1 ring-line-strong ring-inset hover:bg-sunk/60",
        quiet: "text-ink hover:bg-sunk/70",
      },
      size: {
        lg: "h-14 px-6 text-[17px] [&_svg]:size-5",
        md: "h-12 px-5 text-[15px] [&_svg]:size-[18px]",
        icon: "size-12 [&_svg]:size-[22px]",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
