"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createWorkout(formData: FormData) {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("workouts").insert({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    estimated_minutes: Number(formData.get("estimated_minutes") ?? 45),
    created_by: profile.id,
  });
  revalidatePath("/admin/treinos");
}

export async function addWorkoutItem(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const workoutId = String(formData.get("workout_id") ?? "");
  const { data: last } = await supabase.from("workout_items").select("order_index").eq("workout_id", workoutId).order("order_index", { ascending: false }).limit(1).maybeSingle();
  await supabase.from("workout_items").insert({
    workout_id: workoutId,
    exercise_id: String(formData.get("exercise_id") ?? ""),
    sets: Number(formData.get("sets") ?? 3),
    reps: String(formData.get("reps") ?? "12"),
    rest_seconds: Number(formData.get("rest_seconds") ?? 60),
    default_load: String(formData.get("default_load") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    order_index: (last?.order_index ?? 0) + 1,
  });
  revalidatePath("/admin/treinos");
}

export async function assignWorkout(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("workout_assignments").insert({
    workout_id: String(formData.get("workout_id") ?? ""),
    student_id: String(formData.get("student_id") ?? ""),
    day_of_week: Number(formData.get("day_of_week") ?? 1),
    starts_on: String(formData.get("starts_on") ?? ""),
    ends_on: String(formData.get("ends_on") ?? "") || null,
  });
  revalidatePath("/admin/treinos");
}
