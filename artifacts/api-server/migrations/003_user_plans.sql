CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'plans_plan_name_unique'
      AND conrelid = 'public.plans'::regclass
  ) THEN
    ALTER TABLE public.plans
      ADD CONSTRAINT plans_plan_name_unique UNIQUE (plan_name);
  END IF;
END;
$$;

INSERT INTO public.plans (plan_name, max_applications, licensed_users)
VALUES
  ('Tester', 1, 1),
  ('Developer', 5, 25),
  ('Seller', NULL, NULL)
ON CONFLICT (plan_name) DO NOTHING;

UPDATE public.users
SET plan_id = (
  SELECT id FROM public.plans WHERE lower(plan_name) = lower('Tester') LIMIT 1
)
WHERE plan_id IS NULL;

ALTER TABLE public.users
  ALTER COLUMN plan_id SET NOT NULL;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_id_fkey;

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_id_fkey
  FOREIGN KEY (plan_id)
  REFERENCES public.plans(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS users_plan_id_idx ON public.users (plan_id);

CREATE OR REPLACE FUNCTION public.assign_tester_plan_to_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tester_plan_id UUID;
BEGIN
  SELECT id INTO tester_plan_id
  FROM public.plans
  WHERE lower(plan_name) = lower('Tester')
  LIMIT 1;

  IF tester_plan_id IS NULL THEN
    RAISE EXCEPTION 'Tester plan not found';
  END IF;

  INSERT INTO public.users (
    id,
    email,
    username,
    password_hash,
    role,
    status,
    verified,
    credits,
    plan_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'user_name', ''), NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    'oauth',
    'user',
    'active',
    TRUE,
    0,
    tester_plan_id
  )
  ON CONFLICT (id) DO UPDATE
  SET plan_id = COALESCE(public.users.plan_id, EXCLUDED.plan_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_tester_plan_after_auth_signup ON auth.users;

CREATE TRIGGER assign_tester_plan_after_auth_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_tester_plan_to_new_auth_user();

SELECT 'Migration 003_user_plans completed successfully.' AS result;