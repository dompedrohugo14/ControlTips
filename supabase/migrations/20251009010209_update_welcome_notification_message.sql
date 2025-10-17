/*
  # Update Welcome Notification Message

  1. Changes
    - Update welcome notification message to new text
    - Keep existing trigger and function structure
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only triggered on new user creation
  
  3. Important Notes
    - Notification sent automatically when user completes signup
    - Updated message emphasizes data-driven approach and bankroll management
*/

-- Update function to create welcome notification with new message
CREATE OR REPLACE FUNCTION send_welcome_notification()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, created_by_admin)
  VALUES (
    NEW.id,
    'Bem-vindo ao Control Tips!',
    'Aqui você deixa o achismo de lado, organiza sua banca e evolui com dados reais. Sua nova fase na gestão de apostas começa agora!',
    'success',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;