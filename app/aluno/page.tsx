import { Check, Clock, ExternalLink, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { getSaoPauloToday } from "@/lib/date";
import { saveExerciseProgress } from "./actions";

export default async function StudentTodayPage() {
  const profile = await requireRole("student");
  const today = getSaoPauloToday();
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("workout_assignments")
    .select("id, workouts(id, title, description, estimated_minutes, workout_items(id, sets, reps, rest_seconds, default_load, notes, order_index, exercises(name, muscle_group, instructions, video_url)))")
    .eq("student_id", profile.id)
    .eq("day_of_week", today.dayOfWeek)
    .eq("active", true)
    .lte("starts_on", today.isoDate)
    .or(`ends_on.is.null,ends_on.gte.${today.isoDate}`);

  const assignmentIds = assignments?.map(a => a.id) ?? [];
  const { data: progressData } = assignmentIds.length
    ? await supabase.from("exercise_progress").select("assignment_id, workout_item_id, completed, actual_load, completed_reps").in("assignment_id", assignmentIds).eq("training_date", today.isoDate)
    : { data: [] as any[] };

  const progressMap = new Map((progressData ?? []).map((p:any) => [`${p.assignment_id}:${p.workout_item_id}`, p]));
  const allItems = (assignments as any[] | null)?.flatMap(a => a.workouts?.workout_items ?? []) ?? [];
  const completedCount = (progressData ?? []).filter((p:any) => p.completed).length;
  const percent = allItems.length ? Math.round((completedCount / allItems.length) * 100) : 0;

  return (
    <>
      <header className="page-header"><div><div className="eyebrow">Olá, {profile.full_name.split(" ")[0]}</div><h1>Treino de hoje</h1><p style={{ textTransform: "capitalize" }}>{today.formatted}</p></div></header>
      {!assignments?.length ? <div className="empty"><h2>Dia de recuperação</h2><p>Não há treino programado para hoje.</p></div> : (
        <>
          <section className="workout-hero">
            <div className="eyebrow">Progresso diário</div>
            <h1>{percent}% CONCLUÍDO</h1>
            <div className="progress-row"><div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div><strong>{completedCount}/{allItems.length}</strong></div>
          </section>
          {(assignments as any[]).map((assignment) => {
            const workout = assignment.workouts;
            const items = [...(workout?.workout_items ?? [])].sort((a,b) => a.order_index - b.order_index);
            return <section className="section" key={assignment.id}>
              <div className="section-title"><div><h2>{workout?.title}</h2><div className="muted">{workout?.description}</div></div><span className="badge badge-neutral"><Clock size={13} />&nbsp; {workout?.estimated_minutes} min</span></div>
              <div className="exercise-list">{items.map((item:any, index:number) => {
                const progress = progressMap.get(`${assignment.id}:${item.id}`);
                const done = Boolean(progress?.completed);
                return <article className={`exercise-card ${done ? "done" : ""}`} key={item.id}>
                  <div className="exercise-number">{done ? <Check size={24} /> : index + 1}</div>
                  <div className="exercise-main"><h3>{item.exercises?.name}</h3><div className="exercise-meta"><span>{item.sets} séries × {item.reps}</span><span>{item.rest_seconds}s descanso</span><span>{item.exercises?.muscle_group}</span></div>{item.notes ? <p className="muted">{item.notes}</p> : null}{item.exercises?.video_url ? <a href={item.exercises.video_url} target="_blank" rel="noreferrer" style={{ color: "#b8ff3d", display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontWeight: 800, fontSize: 13 }}>Ver execução <ExternalLink size={14} /></a> : null}</div>
                  <form className="exercise-form" action={saveExerciseProgress}>
                    <input type="hidden" name="assignment_id" value={assignment.id} /><input type="hidden" name="workout_item_id" value={item.id} /><input type="hidden" name="training_date" value={today.isoDate} /><input type="hidden" name="completed" value={done ? "false" : "true"} />
                    <div className="field"><label>Carga (kg)</label><input className="input" name="actual_load" inputMode="decimal" defaultValue={progress?.actual_load ?? ""} placeholder={item.default_load ?? "0"} /></div>
                    <div className="field"><label>Repetições</label><input className="input" name="completed_reps" type="number" defaultValue={progress?.completed_reps ?? ""} /></div>
                    <button className={`btn ${done ? "btn-secondary" : "btn-primary"}`} type="submit">{done ? <><RotateCcw size={17} /> Reabrir</> : <><Check size={17} /> Concluir</>}</button>
                  </form>
                </article>
              })}</div>
            </section>
          })}
        </>
      )}
    </>
  );
}
