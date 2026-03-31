const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  banned: "bg-red-500/15 text-red-400 border-red-500/30",
  suspended: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  verified: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  unverified: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  purchase: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  refund: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  bonus: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  deduction: "bg-red-500/15 text-red-400 border-red-500/30",
  transfer: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  blacklisted: "bg-red-500/15 text-red-400 border-red-500/30",
  default: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
}
