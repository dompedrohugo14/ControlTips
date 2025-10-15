/*
  # Add Welcome Notification Trigger

  1. Changes
    - Create function to send welcome notification when new user signs up
    - Create trigger to automatically send notification after user creation
    - Welcome notification sent during free trial period
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only triggered on new user creation
  
  3. Important Notes
    - Notification sent automatically when user completes signup
    - Message welcomes user to Control Tips during trial period
*/

-- Function to create welcome notification for new users
CREATE OR REPLACE FUNCTION send_welcome_notification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, created_by_admin)
  VALUES (
    NEW.id,
    'Bem-vindo ao Control Tips!',
    'Olá! Seja bem vindo ao Control Tips. Juntos vamos organizar suas apostas de maneira profissional e te ajudar a alavancar a sua banca.',
    'success',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send welcome notification after profile creation
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_notification();
