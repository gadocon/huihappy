/*
  # Add sample members data

  1. New Data
    - Add sample members with different types (regular and VIP)
    - Include realistic Vietnamese names and information
    - Add sample bank account information

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency
*/

-- Insert sample members
INSERT INTO members (name, id_number, phone, address, type, bank_accounts)
VALUES
  ('Nguyễn Văn An', '001099123456', '0901234567', '123 Lê Lợi, Quận 1, TP.HCM', 'vip', 
   '[{"bank": "Vietcombank", "account_number": "1234567890", "account_name": "NGUYEN VAN AN"}]'::jsonb),
  
  ('Trần Thị Bình', '001099123457', '0902345678', '456 Nguyễn Huệ, Quận 1, TP.HCM', 'regular',
   '[{"bank": "Techcombank", "account_number": "0987654321", "account_name": "TRAN THI BINH"}]'::jsonb),
  
  ('Lê Hoàng Cường', '001099123458', '0903456789', '789 Hai Bà Trưng, Quận 3, TP.HCM', 'vip',
   '[{"bank": "ACB", "account_number": "2468135790", "account_name": "LE HOANG CUONG"}]'::jsonb),
  
  ('Phạm Minh Đức', '001099123459', '0904567890', '321 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'regular',
   '[{"bank": "BIDV", "account_number": "1357924680", "account_name": "PHAM MINH DUC"}]'::jsonb),
  
  ('Hoàng Thị Em', '001099123460', '0905678901', '654 Nguyễn Đình Chiểu, Quận 3, TP.HCM', 'regular',
   '[{"bank": "Sacombank", "account_number": "9876543210", "account_name": "HOANG THI EM"}]'::jsonb)
ON CONFLICT (id_number) DO NOTHING;
