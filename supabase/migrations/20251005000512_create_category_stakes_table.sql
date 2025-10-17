/*
  # Create Category Stakes Configuration Table

  ## Overview
  This migration creates a table to store stake percentages for each betting category per user.
  
  ## New Tables
  - `category_stakes`
    - `id` (uuid, primary key) - Unique identifier for the stake configuration
    - `user_id` (uuid, foreign key) - References the user who owns this configuration
    - `category` (text) - The betting category name
    - `stake_percentage` (decimal) - The maximum stake percentage allowed for this category (0-100)
    - `created_at` (timestamptz) - Timestamp when the configuration was created
    - `updated_at` (timestamptz) - Timestamp when the configuration was last updated

  ## Security
  - Enable RLS on `category_stakes` table
  - Users can only read their own stake configurations
  - Users can only insert their own stake configurations
  - Users can only update their own stake configurations
  - Users can only delete their own stake configurations

  ## Constraints
  - Unique constraint on (user_id, category) to prevent duplicates
  - Check constraint to ensure stake_percentage is between 0 and 100
*/

-- Create the category_stakes table
CREATE TABLE IF NOT EXISTS category_stakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  stake_percentage decimal(5, 2) NOT NULL CHECK (stake_percentage >= 0 AND stake_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable Row Level Security
ALTER TABLE category_stakes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own stake configurations
CREATE POLICY "Users can view own stake configurations"
  ON category_stakes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own stake configurations
CREATE POLICY "Users can create own stake configurations"
  ON category_stakes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own stake configurations
CREATE POLICY "Users can update own stake configurations"
  ON category_stakes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own stake configurations
CREATE POLICY "Users can delete own stake configurations"
  ON category_stakes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_stakes_user_id ON category_stakes(user_id);
