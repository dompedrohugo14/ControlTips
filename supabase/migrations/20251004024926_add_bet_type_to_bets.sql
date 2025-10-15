/*
  # Add bet_type column to bets table

  1. Changes
    - Add `bet_type` column to `bets` table to store the type of bet (e.g., "Simples", "Múltipla", "Sistema")

  2. Notes
    - Uses IF NOT EXISTS pattern to prevent errors if column already exists
    - No default value required as this will be set by user input
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bets' AND column_name = 'bet_type'
  ) THEN
    ALTER TABLE bets ADD COLUMN bet_type text NOT NULL DEFAULT '';
  END IF;
END $$;