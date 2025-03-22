/*
  # Fix admin user setup

  1. Changes
    - Updates existing admin profile with correct role
    - Handles case where profile already exists
    
  2. Security
    - Maintains existing user ID and profile
    - Only updates role if needed
*/

-- Update admin profile if it exists
UPDATE profiles 
SET role = 'admin'
WHERE email = 'pta.digi@gmail.com';

-- If no profile exists, create it from auth user
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users
WHERE email = 'pta.digi@gmail.com'
  AND NOT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE email = 'pta.digi@gmail.com'
  );
