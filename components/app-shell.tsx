import Link from "next/link";
import { BarChart3, BookOpen, Dumbbell, History, Home, LogOut, Users } from "lucide-react";
import type { Profile } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/login/actions";

const adminLinks = [
  { href: "/admin", label: "Visão geral", icon: Home },
  { href: "/admin/alunos", label: "Alunos", icon: Users },
  { href: "/admin/exercicios", label: "Exercícios", icon: Dumbbell },
  { href: "/admin/treinos", label: "Treinos", icon: BookOpen },
];

const studentLinks = [
  { href: "/aluno", label: "Treino", icon: Dumbbell },
  { href: "/aluno/historico", label: "Histórico", icon: History },
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const links = profile.role === "admin" ? adminLinks : studentLinks;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav className="nav">
          {links.map(({ href, label, icon: Icon }) => (
            <Link className="nav-link" href={href} key={href}>
              <Icon size={19} /> {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-mini">
            <strong>{profile.full_name}</strong>
            <span>{profile.role === "admin" ? "Administrador" : "Aluno"}</span>
          </div>
          <form action={signOut}>
            <button className="btn btn-secondary btn-full" type="submit">
              <LogOut size={17} /> Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="main">{children}</main>
      <nav className="mobile-nav">
        {links.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={20} /> <span>{label}</span>
          </Link>
        ))}
        <form action={signOut}>
          <button type="submit" style={{ all: "unset", width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#9cab9f", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
            <LogOut size={20} /> <span>Sair</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
