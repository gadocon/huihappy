/*
  # Add Sample Data for Hui Management System

  1. Sample Data
    - Members with different types (regular/vip)
    - Hui groups with different types (daily/weekly/monthly)
    - Hui members with proper slot assignments
    - Payment records with realistic statuses
    
  2. Business Rules
    - Number of members equals number of periods for each hui group
    - Payment schedule follows group type (daily/weekly/monthly)
    - Members can be in multiple hui groups
    - Payment status reflects real scenarios (paid/pending)
    - Hotting status properly tracked
*/

-- Clear existing data
TRUNCATE members, hui_groups, hui_members, hui_payments, transactions CASCADE;

-- Insert sample members
INSERT INTO members (id, name, phone, type, id_number, address, bank_accounts) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nguyễn Văn An', '0901234567', 'regular', '001301000001', 'Quận 1, TP.HCM', '[{"bank": "Vietcombank", "account_number": "1234567890", "account_name": "NGUYEN VAN AN"}]'),
  ('22222222-2222-2222-2222-222222222222', 'Trần Thị Bình', '0902345678', 'vip', '001301000002', 'Quận 2, TP.HCM', '[{"bank": "Techcombank", "account_number": "2345678901", "account_name": "TRAN THI BINH"}]'),
  ('33333333-3333-3333-3333-333333333333', 'Lê Văn Cường', '0903456789', 'regular', '001301000003', 'Quận 3, TP.HCM', '[{"bank": "ACB", "account_number": "3456789012", "account_name": "LE VAN CUONG"}]'),
  ('44444444-4444-4444-4444-444444444444', 'Phạm Thị Dung', '0904567890', 'regular', '001301000004', 'Quận 4, TP.HCM', '[{"bank": "BIDV", "account_number": "4567890123", "account_name": "PHAM THI DUNG"}]'),
  ('55555555-5555-5555-5555-555555555555', 'Hoàng Văn Em', '0905678901', 'vip', '001301000005', 'Quận 5, TP.HCM', '[{"bank": "Vietcombank", "account_number": "5678901234", "account_name": "HOANG VAN EM"}]');

-- Insert hui groups
-- 1. Daily hui group (5 slots, 1M/day)
INSERT INTO hui_groups (id, name, type, total_slots, amount, start_date, status, interest_rate) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', 'Hụi ngày 1tr', 'daily', 5, 1000000, CURRENT_DATE, 'active', 0.01);

-- 2. Weekly hui group (4 slots, 5M/week)
INSERT INTO hui_groups (id, name, type, total_slots, amount, start_date, status, interest_rate) VALUES
  ('bbbbbbbb-2222-2222-2222-222222222222', 'Hụi tuần 5tr', 'weekly', 4, 5000000, CURRENT_DATE, 'active', 0.02);

-- 3. Monthly hui group (3 slots, 20M/month)
INSERT INTO hui_groups (id, name, type, total_slots, amount, start_date, status, interest_rate) VALUES
  ('cccccccc-3333-3333-3333-333333333333', 'Hụi tháng 20tr', 'monthly', 3, 20000000, CURRENT_DATE, 'active', 0.03);

-- Temporarily disable the trigger that auto-generates payments
ALTER TABLE hui_members DISABLE TRIGGER generate_member_payment_schedule_trigger;

-- Insert hui members
-- Daily hui group members
INSERT INTO hui_members (hui_group_id, member_id, slot_number) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1),
  ('aaaaaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2),
  ('aaaaaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 3),
  ('aaaaaaaa-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 4),
  ('aaaaaaaa-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 5);

-- Weekly hui group members
INSERT INTO hui_members (hui_group_id, member_id, slot_number) VALUES
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 1),
  ('bbbbbbbb-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2),
  ('bbbbbbbb-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 3),
  ('bbbbbbbb-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 4);

-- Monthly hui group members
INSERT INTO hui_members (hui_group_id, member_id, slot_number) VALUES
  ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 1),
  ('cccccccc-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2),
  ('cccccccc-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 3);

-- Re-enable the trigger
ALTER TABLE hui_members ENABLE TRIGGER generate_member_payment_schedule_trigger;

-- Insert payments for daily hui (first member has hotted)
INSERT INTO hui_payments (hui_group_id, member_id, round_number, amount, status, due_date, paid_at) VALUES
  -- Member 1 (đã hốt)
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1, 1000000, 'paid', CURRENT_DATE - INTERVAL '4 day', CURRENT_DATE - INTERVAL '4 day'),
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 2, 1000000, 'paid', CURRENT_DATE - INTERVAL '3 day', CURRENT_DATE - INTERVAL '3 day'),
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 3, 1000000, 'paid', CURRENT_DATE - INTERVAL '2 day', CURRENT_DATE - INTERVAL '2 day'),
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 4, 1000000, 'pending', CURRENT_DATE - INTERVAL '1 day', null),
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5, 1000000, 'pending', CURRENT_DATE, null),
  
  -- Member 2 (chưa hốt)
  ('aaaaaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, 1000000, 'paid', CURRENT_DATE - INTERVAL '4 day', CURRENT_DATE - INTERVAL '4 day'),
  ('aaaaaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2, 1000000, 'paid', CURRENT_DATE - INTERVAL '3 day', CURRENT_DATE - INTERVAL '3 day'),
  ('aaaaaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 3, 1000000, 'pending', CURRENT_DATE - INTERVAL '2 day', null),
  ('aaaaaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 4, 1000000, 'pending', CURRENT_DATE - INTERVAL '1 day', null),
  ('aaaaaaaa-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 5, 1000000, 'pending', CURRENT_DATE, null);

-- Insert payments for weekly hui (first member has hotted)
INSERT INTO hui_payments (hui_group_id, member_id, round_number, amount, status, due_date, paid_at) VALUES
  -- Member 2 (đã hốt)
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 1, 5000000, 'paid', CURRENT_DATE - INTERVAL '3 week', CURRENT_DATE - INTERVAL '3 week'),
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 2, 5000000, 'paid', CURRENT_DATE - INTERVAL '2 week', CURRENT_DATE - INTERVAL '2 week'),
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 3, 5000000, 'pending', CURRENT_DATE - INTERVAL '1 week', null),
  ('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 4, 5000000, 'pending', CURRENT_DATE, null),
  
  -- Member 3 (chưa hốt)
  ('bbbbbbbb-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 1, 5000000, 'paid', CURRENT_DATE - INTERVAL '3 week', CURRENT_DATE - INTERVAL '3 week'),
  ('bbbbbbbb-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 2, 5000000, 'pending', CURRENT_DATE - INTERVAL '2 week', null),
  ('bbbbbbbb-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 3, 5000000, 'pending', CURRENT_DATE - INTERVAL '1 week', null),
  ('bbbbbbbb-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 4, 5000000, 'pending', CURRENT_DATE, null);

-- Insert payments for monthly hui (first member has hotted)
INSERT INTO hui_payments (hui_group_id, member_id, round_number, amount, status, due_date, paid_at) VALUES
  -- Member 3 (đã hốt)
  ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 1, 20000000, 'paid', CURRENT_DATE - INTERVAL '2 month', CURRENT_DATE - INTERVAL '2 month'),
  ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 2, 20000000, 'paid', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE - INTERVAL '1 month'),
  ('cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 3, 20000000, 'pending', CURRENT_DATE, null),
  
  -- Member 4 (chưa hốt)
  ('cccccccc-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1, 20000000, 'paid', CURRENT_DATE - INTERVAL '2 month', CURRENT_DATE - INTERVAL '2 month'),
  ('cccccccc-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2, 20000000, 'pending', CURRENT_DATE - INTERVAL '1 month', null),
  ('cccccccc-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 3, 20000000, 'pending', CURRENT_DATE, null);

-- Insert some transactions
INSERT INTO transactions (type, amount, description, transaction_date, payment_method, category, hui_group_id, member_id) VALUES
  ('income', 1000000, 'Thu hụi ngày - Kỳ 1', CURRENT_DATE - INTERVAL '4 day', 'cash', 'hui_payment', 'aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
  ('income', 5000000, 'Thu hụi tuần - Kỳ 1', CURRENT_DATE - INTERVAL '3 week', 'bank_transfer', 'hui_payment', 'bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
  ('income', 20000000, 'Thu hụi tháng - Kỳ 1', CURRENT_DATE - INTERVAL '2 month', 'bank_transfer', 'hui_payment', 'cccccccc-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333');

-- Update hui groups with total profit
UPDATE hui_groups
SET total_profit = CASE
  WHEN id = 'aaaaaaaa-1111-1111-1111-111111111111' THEN amount * interest_rate * total_slots -- Daily hui
  WHEN id = 'bbbbbbbb-2222-2222-2222-222222222222' THEN amount * interest_rate * total_slots -- Weekly hui
  WHEN id = 'cccccccc-3333-3333-3333-333333333333' THEN amount * interest_rate * total_slots -- Monthly hui
END;
