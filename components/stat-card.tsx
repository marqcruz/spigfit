import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, detail }: { label: string; value: string | number; icon: LucideIcon; detail?: string }) {
  return (
    <article className="card stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={19} /></span>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {detail ? <div className="muted">{detail}</div> : null}
      </div>
    </article>
  );
}
