"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, BookOpen, Check, Dumbbell, Home, Users } from "lucide-react";
import { Logo } from "./logo";
import { StatCard } from "./stat-card";

const exercises = [
  { name: "Supino reto", meta: "4 séries × 10 repetições", load: "40", reps: "10" },
  { name: "Supino inclinado", meta: "3 séries × 12 repetições", load: "16", reps: "12" },
  { name: "Crucifixo no cabo", meta: "3 séries × 15 repetições", load: "12", reps: "15" },
  { name: "Tríceps corda", meta: "4 séries × 12 repetições", load: "24", reps: "12" },
];

export function DemoApp() {
  const [mode, setMode] = useState<"student" | "admin">("student");
  const [done, setDone] = useState<number[]>([0]);
  const percent = useMemo(() => Math.round((done.length / exercises.length) * 100), [done]);

  return <div className="app-shell">
    <aside className="sidebar"><Logo /><nav className="nav"><button className="nav-link" onClick={() => setMode("student")} style={{ border: 0, width: "100%", background: "transparent", cursor: "pointer" }}><Dumbbell size={19} /> Área do aluno</button><button className="nav-link" onClick={() => setMode("admin")} style={{ border: 0, width: "100%", background: "transparent", cursor: "pointer" }}><Home size={19} /> Área administrativa</button></nav><div className="sidebar-footer"><Link className="btn btn-secondary btn-full" href="/login">Voltar ao login</Link></div></aside>
    <main className="main">{mode === "student" ? <>
      <header className="page-header"><div><div className="eyebrow">Olá, Marcos</div><h1>Treino de hoje</h1><p>quinta-feira, 06 de agosto</p></div><button className="btn btn-secondary" onClick={() => setMode("admin")}>Ver como professor</button></header>
      <section className="workout-hero"><div className="eyebrow">Treino A · Peito e tríceps</div><h1>{percent}% CONCLUÍDO</h1><div className="progress-row"><div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div><strong>{done.length}/{exercises.length}</strong></div></section>
      <div className="exercise-list">{exercises.map((exercise, i) => { const completed = done.includes(i); return <article className={`exercise-card ${completed ? "done" : ""}`} key={exercise.name}><div className="exercise-number">{completed ? <Check /> : i + 1}</div><div className="exercise-main"><h3>{exercise.name}</h3><div className="exercise-meta"><span>{exercise.meta}</span><span>60s descanso</span></div></div><div className="exercise-form"><div className="field"><label>Carga</label><input className="input" defaultValue={exercise.load} /></div><div className="field"><label>Reps</label><input className="input" defaultValue={exercise.reps} /></div><button className={`btn ${completed ? "btn-secondary" : "btn-primary"}`} onClick={() => setDone(completed ? done.filter(v => v !== i) : [...done, i])}>{completed ? "Reabrir" : "Concluir"}</button></div></article> })}</div>
    </> : <>
      <header className="page-header"><div><div className="eyebrow">Painel administrativo</div><h1>Visão geral</h1><p>Demonstração com dados fictícios.</p></div><button className="btn btn-secondary" onClick={() => setMode("student")}>Ver como aluno</button></header>
      <section className="grid grid-4"><StatCard label="Alunos ativos" value={38} icon={Users} /><StatCard label="Fichas ativas" value={12} icon={BookOpen} /><StatCard label="Programações" value={74} icon={Dumbbell} /><StatCard label="Exercícios hoje" value={126} icon={Activity} /></section>
      <section className="section card"><div className="section-title"><h2>Alunos em destaque</h2><span className="badge badge-active">Semana atual</span></div><div className="table-wrap"><table><thead><tr><th>Aluno</th><th>Treinos</th><th>Conclusão</th><th>Última atividade</th></tr></thead><tbody><tr><td><strong>Ana Carolina</strong></td><td>4</td><td>96%</td><td>Hoje, 17:42</td></tr><tr><td><strong>Bruno Henrique</strong></td><td>3</td><td>91%</td><td>Hoje, 16:10</td></tr><tr><td><strong>Camila Souza</strong></td><td>4</td><td>88%</td><td>Hoje, 14:55</td></tr></tbody></table></div></section>
    </>}</main>
    <nav className="mobile-nav"><button onClick={() => setMode("student")} style={{ all: "unset", display: "grid", placeItems: "center", color: "#9cab9f", fontSize: 10, fontWeight: 800, cursor: "pointer" }}><Dumbbell size={20} />Treino</button><button onClick={() => setMode("admin")} style={{ all: "unset", display: "grid", placeItems: "center", color: "#9cab9f", fontSize: 10, fontWeight: 800, cursor: "pointer" }}><Home size={20} />Admin</button></nav>
  </div>;
}
