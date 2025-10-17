/*
  # Add minimum bankroll field to profiles table

  1. Changes
    - Add `minimum_bankroll` column to `profiles` table
      - Type: numeric (decimal value for minimum bankroll threshold)
      - Nullable: true (optional field)
      - Default: null (no minimum set by default)
  
  2. Notes
    - This field stores the user's minimum bankroll threshold
    - When current bankroll falls below this value, the UI will show a warning (red color)
    - Users can set this via a modal in the header
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'minimum_bankroll'
  ) THEN
    ALTER TABLE profiles ADD COLUMN minimum_bankroll numeric DEFAULT NULL;
  END IF;
END $$;
