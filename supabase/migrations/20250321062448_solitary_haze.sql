/*
  # Add Debt Calculation Functions and Views

  1. New Functions
    - calculate_member_debt: Calculates total debt for a member
    - calculate_payment_status: Determines if a member is ahead or behind on payments
  
  2. New Views
    - member_payment_status: Shows payment status and debt for each member
    - overdue_payments: Lists all overdue payments
  
  3. Changes
    - Add payment_status column to hui_payments
    - Add triggers to automatically update debt calculations
*/

-- Function to calculate member's total debt
CREATE OR REPLACE FUNCTION calculate_member_debt(p_member_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_due NUMERIC := 0;
  v_total_paid NUMERIC := 0;
BEGIN
  -- Calculate total amount due based on payment schedule
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_due
  FROM hui_payments
  WHERE member_id = p_member_id
  AND due_date <= CURRENT_DATE;

  -- Calculate total amount paid
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_paid
  FROM hui_payments
  WHERE member_id = p_member_id
  AND status = 'paid';

  -- Return debt (negative means they owe money)
  RETURN v_total_paid - v_total_due;
END;
$$ LANGUAGE plpgsql;

-- View for member payment status
CREATE OR REPLACE VIEW member_payment_status AS
SELECT 
  m.id AS member_id,
  m.name AS member_name,
  m.type AS member_type,
  COUNT(DISTINCT hm.hui_group_id) AS total_hui_groups,
  COUNT(hp.id) AS total_payments,
  COUNT(hp.id) FILTER (WHERE hp.status = 'paid') AS paid_payments,
  COUNT(hp.id) FILTER (WHERE hp.status = 'pending' AND hp.due_date < CURRENT_DATE) AS overdue_payments,
  SUM(hp.amount) FILTER (WHERE hp.status = 'paid') AS total_paid_amount,
  calculate_member_debt(m.id) AS current_debt,
  CASE 
    WHEN calculate_member_debt(m.id) >= 0 THEN 'ahead'
    ELSE 'behind'
  END AS payment_status
FROM members m
LEFT JOIN hui_members hm ON m.id = hm.member_id
LEFT JOIN hui_payments hp ON m.id = hp.member_id
GROUP BY m.id, m.name, m.type;

-- View for overdue payments
CREATE OR REPLACE VIEW overdue_payments AS
SELECT 
  hp.id AS payment_id,
  m.name AS member_name,
  hg.name AS hui_group_name,
  hp.amount,
  hp.due_date,
  CURRENT_DATE - hp.due_date AS days_overdue
FROM hui_payments hp
JOIN members m ON hp.member_id = m.id
JOIN hui_groups hg ON hp.hui_group_id = hg.id
WHERE hp.status = 'pending' 
AND hp.due_date < CURRENT_DATE
ORDER BY hp.due_date ASC;

-- Function to update payment status
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update payment status based on due date
  IF NEW.status = 'pending' AND NEW.due_date < CURRENT_DATE THEN
    NEW.payment_status := 'overdue';
  ELSIF NEW.status = 'paid' THEN
    NEW.payment_status := 'paid';
  ELSE
    NEW.payment_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add payment_status column
ALTER TABLE hui_payments 
ADD COLUMN IF NOT EXISTS payment_status TEXT 
DEFAULT 'pending'
CHECK (payment_status IN ('pending', 'overdue', 'paid'));

-- Add trigger for payment status updates
CREATE TRIGGER update_payment_status_trigger
BEFORE INSERT OR UPDATE ON hui_payments
FOR EACH ROW
EXECUTE FUNCTION update_payment_status();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hui_payments_status_date
ON hui_payments (status, due_date);

CREATE INDEX IF NOT EXISTS idx_hui_payments_member_date
ON hui_payments (member_id, due_date);

COMMENT ON FUNCTION calculate_member_debt IS 
'Calculates the total debt for a member based on due payments and paid amounts';

COMMENT ON VIEW member_payment_status IS 
'Provides a summary of payment status and debt for each member';

COMMENT ON VIEW overdue_payments IS 
'Lists all overdue payments with member and hui group details';
