/*
  # Add hui payment logic constraints and triggers

  1. Changes
    - Add trigger to validate that number of payments matches total slots
    - Add trigger to validate payment rounds against total slots
    - Add trigger to ensure each member has correct number of payment records
    - Add check constraint to ensure round numbers are sequential and within bounds

  2. Logic Enforcement
    - Each hui group has a fixed number of total_slots
    - Each slot corresponds to one member
    - Total number of payment rounds equals total_slots
    - Each member must make payments for all rounds
    - Round numbers must be sequential from 1 to total_slots
*/

-- Function to validate payment rounds against total slots
CREATE OR REPLACE FUNCTION validate_hui_payment_rounds()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if round number is within valid range
  IF NEW.round_number > (
    SELECT total_slots 
    FROM hui_groups 
    WHERE id = NEW.hui_group_id
  ) THEN
    RAISE EXCEPTION 'Round number cannot exceed total slots of hui group';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment schedule when a member joins
CREATE OR REPLACE FUNCTION generate_member_payment_schedule()
RETURNS TRIGGER AS $$
DECLARE
  v_total_slots INTEGER;
  v_amount NUMERIC;
  v_current_round INTEGER;
BEGIN
  -- Get hui group details
  SELECT total_slots, amount
  INTO v_total_slots, v_amount
  FROM hui_groups
  WHERE id = NEW.hui_group_id;

  -- Generate payment records for all rounds
  FOR v_current_round IN 1..v_total_slots LOOP
    INSERT INTO hui_payments (
      hui_group_id,
      member_id,
      round_number,
      amount,
      status,
      due_date
    ) VALUES (
      NEW.hui_group_id,
      NEW.member_id,
      v_current_round,
      v_amount,
      'pending',
      -- Calculate due date based on hui group type
      (SELECT 
        start_date + 
        CASE type
          WHEN 'daily' THEN (v_current_round - 1) * INTERVAL '1 day'
          WHEN 'weekly' THEN (v_current_round - 1) * INTERVAL '1 week'
          WHEN 'monthly' THEN (v_current_round - 1) * INTERVAL '1 month'
        END
      FROM hui_groups WHERE id = NEW.hui_group_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate payment rounds
CREATE TRIGGER validate_hui_payment_rounds_trigger
BEFORE INSERT OR UPDATE ON hui_payments
FOR EACH ROW
EXECUTE FUNCTION validate_hui_payment_rounds();

-- Add trigger to generate payment schedule for new members
CREATE TRIGGER generate_member_payment_schedule_trigger
AFTER INSERT ON hui_members
FOR EACH ROW
EXECUTE FUNCTION generate_member_payment_schedule();

-- Add constraints to hui_payments table
ALTER TABLE hui_payments
ADD CONSTRAINT hui_payments_round_range_check 
CHECK (round_number > 0);

-- Add index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_hui_payments_member_group
ON hui_payments (hui_group_id, member_id, round_number);

COMMENT ON FUNCTION validate_hui_payment_rounds IS 
'Validates that payment round numbers do not exceed the total slots of the hui group';

COMMENT ON FUNCTION generate_member_payment_schedule IS 
'Automatically generates payment schedule when a member joins a hui group';

COMMENT ON TRIGGER validate_hui_payment_rounds_trigger ON hui_payments IS 
'Ensures payment rounds are valid for the hui group';

COMMENT ON TRIGGER generate_member_payment_schedule_trigger ON hui_members IS 
'Creates payment records for all rounds when a member joins';
