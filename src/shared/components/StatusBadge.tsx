export type StatusBadgeTone = "reviewed" | "flagged" | "unreviewed";

interface StatusBadgeProps {
  label: string;
  tone: StatusBadgeTone;
}

export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}
