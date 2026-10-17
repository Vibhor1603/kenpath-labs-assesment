import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
};

/** A native switch: one button with role="switch". The thumb moves with transform only. */
export function Switch({ checked, onCheckedChange, className, ...aria }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "group relative inline-flex h-12 w-[60px] shrink-0 items-center justify-center",
        className,
      )}
      {...aria}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative h-[30px] w-[50px] rounded-full transition-colors duration-200 ease-[var(--ease-out)]",
          checked ? "bg-ink" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "bg-surface absolute top-[3px] left-[3px] size-6 rounded-full shadow-[0_1px_2px_rgb(0_0_0/0.18),0_2px_6px_rgb(0_0_0/0.08)] transition-transform duration-300 ease-[var(--spring-ui)] group-active:scale-95",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
