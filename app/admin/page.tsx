import { Activity, BookOpen, Dumbbell, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { createClient } from "@/lib/supabase/server";
import { getSaoPauloToday } from "@/lib/date";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = getSaoPauloToday();

  const [students, workouts, assignments, activity] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").eq("status", "active"),
    supabase.from("workouts").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("workout_assignments").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("exercise_progress").select("id", { count: "exact", head: true }).eq("training_date", today.isoDate).eq("completed", true),
  ]);

  const { data: recent } = await supabase
    .from("exercise_progress")
    .select("id, training_date, actual_load, completed_reps, profiles(full_name), workout_items(exercises(name))")
    .eq("completed", true)
    .order("updated_at", { ascending: false })
    .limit(8);

  return (
    <>
      <header className="page-header">
        <div><div className="eyebrow">Painel administrativo</div><h1>Visão geral</h1><p>Alunos, fichas e execução em tempo real.</p></div>
      </header>
      <section className="grid grid-4">
        <StatCard label="Alunos ativos" value={students.count ?? 0} icon={Users} />
        <StatCard label="Fichas ativas" value={workouts.count ?? 0} icon={BookOpen} />
        <StatCard label="Programações" value={assignments.count ?? 0} icon={Dumbbell} />
        <StatCard label="Exercícios hoje" value={activity.count ?? 0} icon={Activity} detail={today.formatted} />
      </section>
      <section className="section card">
        <div className="section-title"><h2>Atividades recentes</h2><span className="muted">Últimas conclusões</span></div>
        {recent?.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Aluno</th><th>Exercício</th><th>Data</th><th>Carga</th><th>Repetições</th></tr></thead>
              <tbody>
                {(recent as any[]).map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.profiles?.full_name ?? "Aluno"}</strong></td>
                    <td>{item.workout_items?.exercises?.name ?? "Exercício"}</td>
                    <td>{new Date(`${item.training_date}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                    <td>{item.actual_load ? `${item.actual_load} kg` : "—"}</td>
                    <td>{item.completed_reps ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">Nenhuma atividade registrada ainda.</div>}
      </section>
    </>
  );
}
