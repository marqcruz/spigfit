"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveExerciseProgress(formData: FormData) {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const workoutItemId = String(formData.get("workout_item_id") ?? "");
  const trainingDate = String(formData.get("training_date") ?? "");
  const completed = String(formData.get("completed") ?? "false") === "true";
  const loadRaw = String(formData.get("actual_load") ?? "").replace(",", ".");
  const repsRaw = String(formData.get("completed_reps") ?? "");

  await supabase.from("exercise_progress").upsert({
    assignment_id: assignmentId,
    workout_item_id: workoutItemId,
    student_id: profile.id,
    training_date: trainingDate,
    completed,
    actual_load: loadRaw ? Number(loadRaw) : null,
    completed_reps: repsRaw ? Number(repsRaw) : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "assignment_id,workout_item_id,student_id,training_date" });
  revalidatePath("/aluno");
}
