/*
  # Add tham_amount to hui_payments

  1. Changes
    - Add tham_amount column to hui_payments table
    - Update calculation functions to include tham amount
    - Add constraints and validation for tham amount

  2. Security
    - Maintain existing RLS policies
*/

-- Add tham_amount column to hui_payments
ALTER TABLE hui_payments
ADD COLUMN tham_amount NUMERIC DEFAULT 0;

-- Add constraint to ensure tham_amount is not negative
ALTER TABLE hui_payments
ADD CONSTRAINT hui_payments_tham_amount_check
CHECK (tham_amount >= 0);

-- Update the payment status function to handle tham amounts
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update payment status based on due date and tham amount
  IF NEW.status = 'pending' AND NEW.due_date < CURRENT_DATE THEN
    NEW.payment_status := 'overdue';
  ELSIF NEW.status = 'paid' THEN
    NEW.payment_status := 'paid';
    
    -- If this is round 1 and has tham_amount, it means the member has "hotted"
    IF NEW.round_number = 1 AND NEW.tham_amount > 0 THEN
      -- Update the payment amount to reflect the actual amount after tham
      NEW.amount := (
        SELECT amount * total_slots - (NEW.tham_amount * (total_slots - 1))
        FROM hui_groups
        WHERE id = NEW.hui_group_id
      );
    END IF;
  ELSE
    NEW.payment_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
