import { Activity, CalendarDays, Trophy } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString().slice(0, 10);

  const { data } = await supabase.from("exercise_progress").select("id, training_date, actual_load, completed_reps, workout_items(exercises(name))").eq("student_id", profile.id).eq("completed", true).gte("training_date", sinceIso).order("training_date", { ascending: false });
  const rows = (data ?? []) as any[];
  const uniqueDays = new Set(rows.map(r => r.training_date)).size;
  const maxLoad = rows.reduce((max, r) => Math.max(max, Number(r.actual_load ?? 0)), 0);

  return <>
    <header className="page-header"><div><div className="eyebrow">Sua evolução</div><h1>Histórico</h1><p>Atividades concluídas nos últimos 30 dias.</p></div></header>
    <section className="grid grid-3"><StatCard label="Exercícios concluídos" value={rows.length} icon={Activity} /><StatCard label="Dias treinados" value={uniqueDays} icon={CalendarDays} /><StatCard label="Maior carga registrada" value={`${maxLoad} kg`} icon={Trophy} /></section>
    <section className="section card"><div className="section-title"><h2>Registros</h2></div>{rows.length ? <div className="table-wrap"><table><thead><tr><th>Data</th><th>Exercício</th><th>Carga</th><th>Repetições</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{new Date(`${r.training_date}T12:00:00`).toLocaleDateString("pt-BR")}</td><td><strong>{r.workout_items?.exercises?.name}</strong></td><td>{r.actual_load ? `${r.actual_load} kg` : "—"}</td><td>{r.completed_reps ?? "—"}</td></tr>)}</tbody></table></div> : <div className="empty">Conclua exercícios para formar seu histórico.</div>}</section>
  </>;
}
