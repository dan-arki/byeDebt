/*
  # Create debts table for debt management system

  1. New Tables
    - `debts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users table)
      - `debtor_name` (text, required)
      - `creditor_name` (text, required)
      - `amount` (numeric, required, positive)
      - `currency` (text, required)
      - `due_date` (date, required)
      - `status` (text, default 'pending', check constraint)
      - `description` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `debts` table
    - Add policies for authenticated users to manage their own debts
    - Users can SELECT, INSERT, UPDATE, DELETE their own debts only

  3. Performance
    - Add index on user_id for faster lookups
    - Add trigger to automatically update updated_at column

  4. Data Integrity
    - Foreign key constraint to users table with CASCADE delete
    - Check constraints for positive amounts and valid status values
*/

-- Create the debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  debtor_name text NOT NULL,
  creditor_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own debts"
  ON public.debts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts"
  ON public.debts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
  ON public.debts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
  ON public.debts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON public.debts (user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_debts_updated_at ON public.debts;
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();