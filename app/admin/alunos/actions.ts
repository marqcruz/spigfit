"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createStudent(formData: FormData) {
  await requireRole("admin");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 6) redirect("/admin/alunos?erro=dados");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "student" },
  });
  if (error || !data.user) redirect("/admin/alunos?erro=usuario");

  await admin.from("profiles").update({ full_name: fullName, phone, role: "student", status: "active" }).eq("id", data.user.id);
  revalidatePath("/admin/alunos");
  redirect("/admin/alunos?sucesso=criado");
}

export async function toggleStudent(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "inactive") as "active" | "inactive";
  const supabase = await createClient();
  await supabase.from("profiles").update({ status: nextStatus }).eq("id", id).eq("role", "student");
  revalidatePath("/admin/alunos");
}
