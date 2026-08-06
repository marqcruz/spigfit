create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'student');
create type public.account_status as enum ('active', 'inactive');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  phone text,
  role public.app_role not null default 'student',
  status public.account_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  instructions text,
  video_url text,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  estimated_minutes integer not null default 45 check (estimated_minutes > 0),
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_items (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  sets integer not null default 3 check (sets > 0),
  reps text not null default '12',
  rest_seconds integer not null default 60 check (rest_seconds >= 0),
  default_load text,
  notes text,
  order_index integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.workout_assignments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  starts_on date not null default current_date,
  ends_on date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on)
);

create table public.exercise_progress (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.workout_assignments(id) on delete cascade,
  workout_item_id uuid not null references public.workout_items(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  training_date date not null default current_date,
  completed boolean not null default false,
  actual_load numeric(8,2),
  completed_reps integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, workout_item_id, student_id, training_date)
);

create index idx_profiles_role on public.profiles(role);
create index idx_assignments_student_day on public.workout_assignments(student_id, day_of_week);
create index idx_progress_student_date on public.exercise_progress(student_id, training_date desc);
create index idx_workout_items_workout on public.workout_items(workout_id, order_index);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'student')::public.app_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role' or public.is_admin() then
    return new;
  end if;

  new.role := old.role;
  new.status := old.status;
  new.email := old.email;
  return new;
end;
$$;

create trigger protect_profile_privileges_before_update
before update on public.profiles
for each row execute procedure public.protect_profile_privileges();

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_items enable row level security;
alter table public.workout_assignments enable row level security;
alter table public.exercise_progress enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "exercises_read_authenticated" on public.exercises
for select to authenticated using (active = true or public.is_admin());
create policy "exercises_admin_insert" on public.exercises
for insert to authenticated with check (public.is_admin());
create policy "exercises_admin_update" on public.exercises
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "exercises_admin_delete" on public.exercises
for delete to authenticated using (public.is_admin());

create policy "workouts_read_assigned_or_admin" on public.workouts
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.workout_assignments a
    where a.workout_id = workouts.id and a.student_id = auth.uid() and a.active = true
  )
);
create policy "workouts_admin_insert" on public.workouts for insert to authenticated with check (public.is_admin());
create policy "workouts_admin_update" on public.workouts for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "workouts_admin_delete" on public.workouts for delete to authenticated using (public.is_admin());

create policy "workout_items_read_assigned_or_admin" on public.workout_items
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.workout_assignments a
    where a.workout_id = workout_items.workout_id and a.student_id = auth.uid() and a.active = true
  )
);
create policy "workout_items_admin_insert" on public.workout_items for insert to authenticated with check (public.is_admin());
create policy "workout_items_admin_update" on public.workout_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "workout_items_admin_delete" on public.workout_items for delete to authenticated using (public.is_admin());

create policy "assignments_read_own_or_admin" on public.workout_assignments
for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "assignments_admin_insert" on public.workout_assignments for insert to authenticated with check (public.is_admin());
create policy "assignments_admin_update" on public.workout_assignments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "assignments_admin_delete" on public.workout_assignments for delete to authenticated using (public.is_admin());

create policy "progress_read_own_or_admin" on public.exercise_progress
for select to authenticated using (student_id = auth.uid() or public.is_admin());
create policy "progress_insert_own_or_admin" on public.exercise_progress
for insert to authenticated with check (
  public.is_admin() or (
    student_id = auth.uid() and exists (
      select 1
      from public.workout_assignments a
      join public.workout_items wi on wi.workout_id = a.workout_id
      where a.id = exercise_progress.assignment_id
        and a.student_id = auth.uid()
        and a.active = true
        and wi.id = exercise_progress.workout_item_id
    )
  )
);
create policy "progress_update_own_or_admin" on public.exercise_progress
for update to authenticated using (student_id = auth.uid() or public.is_admin()) with check (
  public.is_admin() or (
    student_id = auth.uid() and exists (
      select 1
      from public.workout_assignments a
      join public.workout_items wi on wi.workout_id = a.workout_id
      where a.id = exercise_progress.assignment_id
        and a.student_id = auth.uid()
        and a.active = true
        and wi.id = exercise_progress.workout_item_id
    )
  )
);
create policy "progress_delete_admin" on public.exercise_progress
for delete to authenticated using (public.is_admin());
