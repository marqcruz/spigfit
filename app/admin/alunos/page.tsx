import { Plus, Power } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createStudent, toggleStudent } from "./actions";

const errorMessages: Record<string, string> = {
  dados: "Informe nome, e-mail e uma senha com pelo menos 6 caracteres.",
  usuario: "Não foi possível criar o aluno. Verifique se o e-mail já existe.",
};

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ erro?: string; sucesso?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: students } = await supabase.from("profiles").select("id, full_name, email, phone, status, created_at").eq("role", "student").order("full_name");

  return (
    <>
      <header className="page-header"><div><div className="eyebrow">Gestão</div><h1>Alunos</h1><p>Cadastre acessos e controle as contas.</p></div></header>
      {params.erro ? <div className="message message-error">{errorMessages[params.erro]}</div> : null}
      {params.sucesso ? <div className="message message-success">Aluno criado com sucesso.</div> : null}
      <section className="card">
        <div className="section-title"><h2>Novo aluno</h2><span className="muted">A senha poderá ser trocada depois.</span></div>
        <form action={createStudent} className="form-grid">
          <div className="field"><label>Nome completo</label><input className="input" name="full_name" required /></div>
          <div className="field"><label>E-mail</label><input className="input" name="email" type="email" required /></div>
          <div className="field"><label>Telefone</label><input className="input" name="phone" placeholder="(16) 99999-9999" /></div>
          <div className="field"><label>Senha inicial</label><input className="input" name="password" type="password" minLength={6} required /></div>
          <div className="form-actions"><button className="btn btn-primary" type="submit"><Plus size={17} /> Cadastrar aluno</button></div>
        </form>
      </section>
      <section className="section card">
        <div className="section-title"><h2>Alunos cadastrados</h2><span className="badge badge-neutral">{students?.length ?? 0} registros</span></div>
        {students?.length ? <div className="table-wrap"><table>
          <thead><tr><th>Aluno</th><th>Contato</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>{students.map((student) => <tr key={student.id}>
            <td><strong>{student.full_name}</strong><div className="muted">{student.email}</div></td>
            <td>{student.phone || "—"}</td>
            <td><span className={`badge ${student.status === "active" ? "badge-active" : "badge-inactive"}`}>{student.status === "active" ? "Ativo" : "Inativo"}</span></td>
            <td><form action={toggleStudent}><input type="hidden" name="id" value={student.id} /><input type="hidden" name="next_status" value={student.status === "active" ? "inactive" : "active"} /><button className="btn btn-secondary" type="submit"><Power size={16} /> {student.status === "active" ? "Desativar" : "Ativar"}</button></form></td>
          </tr>)}</tbody>
        </table></div> : <div className="empty">Nenhum aluno cadastrado.</div>}
      </section>
    </>
  );
}
