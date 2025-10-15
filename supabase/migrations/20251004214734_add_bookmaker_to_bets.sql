/*
  # Add bookmaker field to bets table

  1. Changes
    - Add `bookmaker` column to `bets` table
      - Type: text (bookmaker/betting house name)
      - Nullable: true (for backward compatibility with existing bets)
      - Default: empty string
  
  2. Notes
    - This field stores the name of the betting house where the bet was placed
    - Existing bets will have an empty bookmaker value
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bets' AND column_name = 'bookmaker'
  ) THEN
    ALTER TABLE bets ADD COLUMN bookmaker text DEFAULT '';
  END IF;
END $$;
