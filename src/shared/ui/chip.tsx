import { cn } from "@/shared/lib/cn";

type ChipProps = {
  label: string;
  className?: string;
};

export function Chip({ label, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700",
        className,
      )}
    >
      {label}
    </span>
  );
}
