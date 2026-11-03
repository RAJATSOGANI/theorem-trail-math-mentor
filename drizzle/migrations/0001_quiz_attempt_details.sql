ALTER TABLE public.quiz_attempts
  ADD COLUMN difficulty text,
  ADD COLUMN mode text,
  ADD COLUMN source text NOT NULL DEFAULT 'library',
  ADD COLUMN duration_seconds int,
  ADD COLUMN details jsonb;