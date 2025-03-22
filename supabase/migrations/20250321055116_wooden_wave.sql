/*
  # Add sample data for hui system

  1. Sample Data
    - Add 10 members with personal info and bank accounts
    - Create 10 hui groups with different types and amounts
    - Create member participation and payment data
  
  2. Sample Hui Groups
    - Daily hui: 1-2M VND/day
    - Weekly hui: 3-5M VND/week
    - Monthly hui: 10-20M VND/month
*/

-- Create variables for member and hui group IDs
DO $$
DECLARE
    m1 uuid := gen_random_uuid();
    m2 uuid := gen_random_uuid();
    m3 uuid := gen_random_uuid();
    m4 uuid := gen_random_uuid();
    m5 uuid := gen_random_uuid();
    m6 uuid := gen_random_uuid();
    m7 uuid := gen_random_uuid();
    m8 uuid := gen_random_uuid();
    m9 uuid := gen_random_uuid();
    m10 uuid := gen_random_uuid();
    h1 uuid := gen_random_uuid();
    h2 uuid := gen_random_uuid();
    h3 uuid := gen_random_uuid();
    h4 uuid := gen_random_uuid();
    h5 uuid := gen_random_uuid();
    h6 uuid := gen_random_uuid();
    h7 uuid := gen_random_uuid();
    h8 uuid := gen_random_uuid();
    h9 uuid := gen_random_uuid();
    h10 uuid := gen_random_uuid();
BEGIN
    -- Add sample members
    INSERT INTO members (id, name, phone, type, id_number, address, bank_accounts) VALUES
    (m1, 'Nguyễn Văn An', '0901234567', 'regular', '001301000001', 'Quận 1, TP.HCM', '[{"bank": "Vietcombank", "account_number": "1234567890", "account_name": "NGUYEN VAN AN"}]'),
    (m2, 'Trần Thị Bình', '0901234568', 'vip', '001301000002', 'Quận 2, TP.HCM', '[{"bank": "Techcombank", "account_number": "0987654321", "account_name": "TRAN THI BINH"}]'),
    (m3, 'Lê Văn Cường', '0901234569', 'regular', '001301000003', 'Quận 3, TP.HCM', '[{"bank": "ACB", "account_number": "1122334455", "account_name": "LE VAN CUONG"}]'),
    (m4, 'Phạm Thị Dung', '0901234570', 'vip', '001301000004', 'Quận 4, TP.HCM', '[{"bank": "BIDV", "account_number": "5544332211", "account_name": "PHAM THI DUNG"}]'),
    (m5, 'Hoàng Văn Em', '0901234571', 'regular', '001301000005', 'Quận 5, TP.HCM', '[{"bank": "Vietcombank", "account_number": "6677889900", "account_name": "HOANG VAN EM"}]'),
    (m6, 'Ngô Thị Phương', '0901234572', 'regular', '001301000006', 'Quận 6, TP.HCM', '[{"bank": "Sacombank", "account_number": "0011223344", "account_name": "NGO THI PHUONG"}]'),
    (m7, 'Đặng Văn Giàu', '0901234573', 'vip', '001301000007', 'Quận 7, TP.HCM', '[{"bank": "VPBank", "account_number": "9988776655", "account_name": "DANG VAN GIAU"}]'),
    (m8, 'Bùi Thị Hương', '0901234574', 'regular', '001301000008', 'Quận 8, TP.HCM', '[{"bank": "MBBank", "account_number": "4433221100", "account_name": "BUI THI HUONG"}]'),
    (m9, 'Võ Văn Khang', '0901234575', 'regular', '001301000009', 'Quận 9, TP.HCM', '[{"bank": "TPBank", "account_number": "5566778899", "account_name": "VO VAN KHANG"}]'),
    (m10, 'Mai Thị Lan', '0901234576', 'vip', '001301000010', 'Quận 10, TP.HCM', '[{"bank": "OCB", "account_number": "1234567891", "account_name": "MAI THI LAN"}]');

    -- Add sample hui groups
    INSERT INTO hui_groups (id, name, type, total_slots, start_date, amount, status, interest_rate) VALUES
    (h1, 'Hụi ngày 1tr', 'daily', 30, '2024-03-01', 1000000, 'active', 0.1),
    (h2, 'Hụi ngày 2tr', 'daily', 30, '2024-03-05', 2000000, 'active', 0.1),
    (h3, 'Hụi tuần 3tr', 'weekly', 24, '2024-03-01', 3000000, 'active', 0.15),
    (h4, 'Hụi tuần 5tr', 'weekly', 24, '2024-03-08', 5000000, 'active', 0.15),
    (h5, 'Hụi tháng 10tr', 'monthly', 12, '2024-03-01', 10000000, 'active', 0.2),
    (h6, 'Hụi tháng 15tr', 'monthly', 12, '2024-03-15', 15000000, 'active', 0.2),
    (h7, 'Hụi tháng 20tr', 'monthly', 12, '2024-03-20', 20000000, 'active', 0.2),
    (h8, 'Hụi ngày 1.5tr', 'daily', 30, '2024-03-10', 1500000, 'active', 0.1),
    (h9, 'Hụi tuần 4tr', 'weekly', 24, '2024-03-15', 4000000, 'active', 0.15),
    (h10, 'Hụi tháng 12tr', 'monthly', 12, '2024-03-25', 12000000, 'active', 0.2);

    -- Add members to hui groups
    INSERT INTO hui_members (hui_group_id, member_id, slot_number) VALUES
    (h1, m1, 1), (h1, m2, 2), (h1, m3, 3),
    (h2, m4, 1), (h2, m5, 2), (h2, m6, 3),
    (h3, m7, 1), (h3, m8, 2), (h3, m9, 3),
    (h4, m10, 1), (h4, m1, 2), (h4, m2, 3),
    (h5, m3, 1), (h5, m4, 2), (h5, m5, 3),
    (h6, m6, 1), (h6, m7, 2), (h6, m8, 3),
    (h7, m9, 1), (h7, m10, 2), (h7, m1, 3),
    (h8, m2, 1), (h8, m3, 2), (h8, m4, 3),
    (h9, m5, 1), (h9, m6, 2), (h9, m7, 3),
    (h10, m8, 1), (h10, m9, 2), (h10, m10, 3);

    -- Add sample payment data
    INSERT INTO hui_payments (hui_group_id, member_id, round_number, amount, status, due_date) 
    SELECT 
      hm.hui_group_id,
      hm.member_id,
      round_number.n,
      hg.amount,
      CASE 
        WHEN random() < 0.7 THEN 'paid'
        ELSE 'pending'
      END as status,
      CASE hg.type
        WHEN 'daily' THEN hg.start_date + (round_number.n || ' days')::interval
        WHEN 'weekly' THEN hg.start_date + (round_number.n * 7 || ' days')::interval
        WHEN 'monthly' THEN hg.start_date + (round_number.n || ' months')::interval
      END as due_date
    FROM hui_members hm
    CROSS JOIN generate_series(1, 3) as round_number(n)
    JOIN hui_groups hg ON hg.id = hm.hui_group_id
    WHERE hg.status = 'active';

    -- Update paid_at dates for paid payments
    UPDATE hui_payments
    SET paid_at = due_date - make_interval(days => floor(random() * 3)::integer)
    WHERE status = 'paid';
END $$;
