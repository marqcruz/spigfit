import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createExercise } from "./actions";

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data: exercises } = await supabase.from("exercises").select("id, name, muscle_group, instructions, video_url").order("name");
  return (
    <>
      <header className="page-header"><div><div className="eyebrow">Biblioteca</div><h1>Exercícios</h1><p>Crie o catálogo usado nas fichas de treino.</p></div></header>
      <section className="card">
        <div className="section-title"><h2>Novo exercício</h2></div>
        <form action={createExercise} className="form-grid">
          <div className="field"><label>Nome</label><input className="input" name="name" required /></div>
          <div className="field"><label>Grupo muscular</label><input className="input" name="muscle_group" placeholder="Peitoral, Costas, Pernas..." required /></div>
          <div className="field"><label>Vídeo demonstrativo</label><input className="input" name="video_url" type="url" placeholder="https://..." /></div>
          <div className="field"><label>Instruções</label><textarea className="textarea" name="instructions" /></div>
          <div className="form-actions"><button className="btn btn-primary"><Plus size={17} /> Adicionar exercício</button></div>
        </form>
      </section>
      <section className="section card">
        <div className="section-title"><h2>Biblioteca</h2><span className="badge badge-neutral">{exercises?.length ?? 0} exercícios</span></div>
        {exercises?.length ? <div className="table-wrap"><table><thead><tr><th>Exercício</th><th>Grupo</th><th>Instruções</th><th>Vídeo</th></tr></thead><tbody>{exercises.map((exercise) => <tr key={exercise.id}><td><strong>{exercise.name}</strong></td><td><span className="badge badge-neutral">{exercise.muscle_group}</span></td><td>{exercise.instructions || "—"}</td><td>{exercise.video_url ? <a href={exercise.video_url} target="_blank" rel="noreferrer" style={{ color: "#b8ff3d" }}>Abrir</a> : "—"}</td></tr>)}</tbody></table></div> : <div className="empty">Cadastre o primeiro exercício.</div>}
      </section>
    </>
  );
}
