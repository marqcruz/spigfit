import Link from "next/link";
import { Dumbbell, ShieldCheck, Smartphone } from "lucide-react";
import { Logo } from "@/components/logo";
import { login } from "./actions";

const errors: Record<string, string> = {
  campos: "Preencha o e-mail e a senha.",
  credenciais: "E-mail ou senha inválidos.",
  "conta-inativa": "Esta conta está inativa. Fale com o administrador.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const params = await searchParams;
  const error = params.erro ? errors[params.erro] : null;

  return (
    <div className="login-page">
      <section className="login-hero">
        <Logo />
        <div className="hero-copy">
          <div className="eyebrow">Treino com direção</div>
          <h1>EVOLUÇÃO QUE VOCÊ CONSEGUE VER.</h1>
          <p>Organize alunos, prescreva treinos, acompanhe cargas e mantenha tudo acessível no celular.</p>
        </div>
        <div className="grid grid-3">
          <div><Smartphone color="#b8ff3d" /><p className="muted">Experiência mobile</p></div>
          <div><Dumbbell color="#b8ff3d" /><p className="muted">Treinos personalizados</p></div>
          <div><ShieldCheck color="#b8ff3d" /><p className="muted">Dados protegidos</p></div>
        </div>
      </section>
      <section className="login-side">
        <div className="login-card">
          <Logo />
          <h2 style={{ marginTop: 30 }}>Acessar conta</h2>
          <p>Entre para visualizar ou gerenciar os treinos.</p>
          {error ? <div className="message message-error">{error}</div> : null}
          <form action={login}>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input className="input" id="password" name="password" type="password" autoComplete="current-password" placeholder="Sua senha" required />
            </div>
            <button className="btn btn-primary btn-full" type="submit">Entrar no SPIGFIT</button>
          </form>
          <div className="demo-link">Ainda não configurou o banco? <Link href="/demo">Abrir demonstração</Link></div>
        </div>
      </section>
    </div>
  );
}
