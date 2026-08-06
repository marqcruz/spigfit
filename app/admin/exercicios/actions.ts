"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createExercise(formData: FormData) {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    muscle_group: String(formData.get("muscle_group") ?? "").trim(),
    instructions: String(formData.get("instructions") ?? "").trim(),
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    created_by: profile.id,
  };
  if (!payload.name || !payload.muscle_group) return;
  await supabase.from("exercises").insert(payload);
  revalidatePath("/admin/exercicios");
}
