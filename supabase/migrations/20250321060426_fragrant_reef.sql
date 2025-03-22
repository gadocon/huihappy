/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `type` (text) - 'income' or 'expense'
      - `amount` (numeric)
      - `description` (text)
      - `transaction_date` (date)
      - `payment_method` (text) - 'cash' or 'bank_transfer'
      - `category` (text) - 'hui_payment', 'hui_payout', 'commission', 'other'
      - `hui_group_id` (uuid, optional) - Reference to hui_groups
      - `member_id` (uuid, optional) - Reference to members
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to manage transactions
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  transaction_date date NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer')),
  category text NOT NULL CHECK (category IN ('hui_payment', 'hui_payout', 'commission', 'other')),
  hui_group_id uuid REFERENCES hui_groups(id) ON DELETE SET NULL,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can manage transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
