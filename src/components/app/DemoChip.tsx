import { cn } from "@/lib/utils";

/**
 * DemoChip: shown in the top bar while ?demo=1 is active.
 * Small, unobtrusive — just an informational label.
 */
export function DemoChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        "bg-accent text-accent-foreground text-[12px] font-medium leading-none",
        "border border-border/60",
        className,
      )}
      aria-label="Demo mode active"
    >
      Demo mode
    </span>
  );
}
