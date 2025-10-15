/*
  # Add Trial Period to Profiles

  1. Changes
    - Add `trial_ends_at` column to profiles table
      - Stores the date when the trial period ends
      - Defaults to 7 days from account creation
      - Type: timestamptz (timestamp with timezone)
  
  2. Security
    - No changes to RLS policies needed
    - Users can read their own trial_ends_at value
  
  3. Important Notes
    - New users automatically get 7 days of trial access
    - Trial period starts from account creation date
    - After trial ends, users must subscribe to continue access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at timestamptz DEFAULT (now() + interval '7 days');
  END IF;
END $$;

-- Update existing users to have trial period
UPDATE profiles 
SET trial_ends_at = created_at + interval '7 days'
WHERE trial_ends_at IS NULL;

-- Update the trigger function to set trial period for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    now() + interval '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
