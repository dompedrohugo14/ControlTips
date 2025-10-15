/*
  # Add Admin Role to Profiles

  1. Changes
    - Add `is_admin` column to `profiles` table
      - Type: boolean
      - Default: false
      - Not null
    
  2. Security
    - Only admins can modify admin status
    - Add RLS policy to protect admin field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

CREATE POLICY "Only admins can update admin status"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    CASE 
      WHEN (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true THEN true
      WHEN auth.uid() = id AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()) THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE 
      WHEN (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true THEN true
      WHEN auth.uid() = id AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()) THEN true
      ELSE false
    END
  );
