/*
  # Add initial bankroll to profiles

  1. Changes
    - Add `initial_bankroll` column to `profiles` table
      - Type: numeric (decimal)
      - Default: 0
      - Description: The starting bankroll amount set by the user
    
  2. Notes
    - This allows users to set their starting bankroll
    - The total bankroll will be calculated as: initial_bankroll + total_profit
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'initial_bankroll'
  ) THEN
    ALTER TABLE profiles ADD COLUMN initial_bankroll numeric DEFAULT 0;
  END IF;
END $$;