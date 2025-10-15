/*
  # Create Notifications Table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key) - Unique identifier for the notification
      - `user_id` (uuid, references auth.users) - ID of the user receiving the notification
      - `title` (text) - Notification title
      - `message` (text) - Notification message content
      - `type` (text) - Type of notification (info, warning, success, alert)
      - `is_read` (boolean) - Whether the notification has been read
      - `created_by_admin` (boolean) - Whether created by an admin
      - `created_at` (timestamptz) - When the notification was created
      - `read_at` (timestamptz, nullable) - When the notification was read

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update (mark as read) their own notifications
    - Add policy for admins to insert notifications

  3. Important Notes
    - Users can only see their own notifications
    - Admins can create notifications for any user
    - System/AI can create notifications programmatically
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
  is_read boolean DEFAULT false,
  created_by_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
