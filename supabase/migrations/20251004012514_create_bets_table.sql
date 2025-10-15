/*
  # Create Bets Table

  1. New Tables
    - `bets`
      - `id` (uuid, primary key) - Identificador único da aposta
      - `user_id` (uuid, foreign key to auth.users) - ID do usuário que fez a aposta
      - `event` (text) - Nome do evento (ex: "Flamengo vs Palmeiras")
      - `category` (text) - Categoria da aposta (ex: "Futebol", "Basquete", "Tênis")
      - `odd` (numeric) - Odd da aposta
      - `stake` (numeric) - Valor apostado
      - `result` (text) - Resultado da aposta ("win", "loss", "pending")
      - `profit` (numeric) - Lucro ou prejuízo da aposta
      - `bet_date` (timestamptz) - Data em que a aposta foi realizada
      - `created_at` (timestamptz) - Data de criação do registro
      - `updated_at` (timestamptz) - Data de atualização do registro

  2. Security
    - Enable RLS on `bets` table
    - Add policies for authenticated users to:
      - Read their own bets
      - Create new bets
      - Update their own bets
      - Delete their own bets
    
  3. Important Notes
    - Users can only access their own betting data
    - All timestamps are stored in UTC
    - Profit is calculated as: (stake * odd) - stake for wins, or -stake for losses
*/

CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  category text NOT NULL,
  odd numeric(10, 2) NOT NULL CHECK (odd > 0),
  stake numeric(10, 2) NOT NULL CHECK (stake > 0),
  result text NOT NULL CHECK (result IN ('win', 'loss', 'pending')),
  profit numeric(10, 2) NOT NULL DEFAULT 0,
  bet_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets"
  ON bets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets"
  ON bets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets"
  ON bets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bets"
  ON bets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_bet_date ON bets(bet_date DESC);
CREATE INDEX IF NOT EXISTS idx_bets_category ON bets(category);
