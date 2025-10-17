/*
  # Update Profiles Trigger to Include Phone

  1. Changes
    - Update the `handle_new_user()` function to extract phone from user metadata
    - This ensures phone number is saved to profiles table when user signs up

  2. Important Notes
    - Phone is now extracted from raw_user_meta_data during sign up
    - Existing trigger is replaced with updated version
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
