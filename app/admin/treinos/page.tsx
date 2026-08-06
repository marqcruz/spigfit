import { CalendarPlus, ListPlus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addWorkoutItem, assignWorkout, createWorkout } from "./actions";
import { getSaoPauloToday } from "@/lib/date";

const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const today = getSaoPauloToday();
  const [{ data: workouts }, { data: exercises }, { data: students }, { data: assignments }] = await Promise.all([
    supabase.from("workouts").select("id, title, description, estimated_minutes, workout_items(id)").eq("active", true).order("created_at", { ascending: false }),
    supabase.from("exercises").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name").eq("role", "student").eq("status", "active").order("full_name"),
    supabase.from("workout_assignments").select("id, day_of_week, starts_on, ends_on, profiles(full_name), workouts(title)").eq("active", true).order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <>
      <header className="page-header"><div><div className="eyebrow">Programação</div><h1>Treinos</h1><p>Monte fichas e distribua por dia da semana.</p></div></header>
      <section className="grid grid-3">
        <article className="card">
          <div className="section-title"><h2>1. Criar ficha</h2><Plus size={20} color="#b8ff3d" /></div>
          <form action={createWorkout}>
            <div className="field"><label>Título</label><input className="input" name="title" placeholder="Treino A — Peito e tríceps" required /></div>
            <div className="field"><label>Descrição</label><textarea className="textarea" name="description" /></div>
            <div className="field"><label>Duração estimada</label><input className="input" name="estimated_minutes" type="number" defaultValue={45} min={10} /></div>
            <button className="btn btn-primary btn-full"><Plus size={17} /> Criar ficha</button>
          </form>
        </article>
        <article className="card">
          <div className="section-title"><h2>2. Inserir exercício</h2><ListPlus size={20} color="#b8ff3d" /></div>
          <form action={addWorkoutItem}>
            <div className="field"><label>Ficha</label><select className="select" name="workout_id" required><option value="">Selecione</option>{workouts?.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}</select></div>
            <div className="field"><label>Exercício</label><select className="select" name="exercise_id" required><option value="">Selecione</option>{exercises?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div className="grid grid-3">
              <div className="field"><label>Séries</label><input className="input" name="sets" type="number" defaultValue={3} min={1} /></div>
              <div className="field"><label>Reps</label><input className="input" name="reps" defaultValue="12" /></div>
              <div className="field"><label>Descanso</label><input className="input" name="rest_seconds" type="number" defaultValue={60} /></div>
            </div>
            <div className="field"><label>Carga sugerida</label><input className="input" name="default_load" placeholder="Ex.: 20 kg" /></div>
            <div className="field"><label>Observação</label><input className="input" name="notes" /></div>
            <button className="btn btn-primary btn-full"><ListPlus size={17} /> Inserir na ficha</button>
          </form>
        </article>
        <article className="card">
          <div className="section-title"><h2>3. Atribuir ao aluno</h2><CalendarPlus size={20} color="#b8ff3d" /></div>
          <form action={assignWorkout}>
            <div className="field"><label>Aluno</label><select className="select" name="student_id" required><option value="">Selecione</option>{students?.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div>
            <div className="field"><label>Ficha</label><select className="select" name="workout_id" required><option value="">Selecione</option>{workouts?.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}</select></div>
            <div className="field"><label>Dia da semana</label><select className="select" name="day_of_week">{days.map((day, i) => <option key={day} value={i}>{day}</option>)}</select></div>
            <div className="grid grid-2"><div className="field"><label>Início</label><input className="input" name="starts_on" type="date" defaultValue={today.isoDate} required /></div><div className="field"><label>Término</label><input className="input" name="ends_on" type="date" /></div></div>
            <button className="btn btn-primary btn-full"><CalendarPlus size={17} /> Programar treino</button>
          </form>
        </article>
      </section>
      <section className="section grid grid-2">
        <article className="card"><div className="section-title"><h2>Fichas criadas</h2><span className="badge badge-neutral">{workouts?.length ?? 0}</span></div>{workouts?.length ? workouts.map((w:any) => <div key={w.id} style={{ padding: "14px 0", borderBottom: "1px solid #29352d" }}><strong>{w.title}</strong><div className="muted">{w.estimated_minutes} min · {w.workout_items?.length ?? 0} exercícios</div></div>) : <div className="empty">Nenhuma ficha criada.</div>}</article>
        <article className="card"><div className="section-title"><h2>Programações ativas</h2><span className="badge badge-neutral">{assignments?.length ?? 0}</span></div>{assignments?.length ? (assignments as any[]).map(a => <div key={a.id} style={{ padding: "14px 0", borderBottom: "1px solid #29352d" }}><strong>{a.profiles?.full_name}</strong><div className="muted">{a.workouts?.title} · {days[a.day_of_week]}</div></div>) : <div className="empty">Nenhuma programação ativa.</div>}</article>
      </section>
    </>
  );
}
