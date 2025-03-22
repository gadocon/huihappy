/*
  # Create admin user profile

  1. Changes
    - Insert admin user profile with email pta.digi@gmail.com
    - Set role as 'admin'
    - Use auth.uid() to get the user's ID
  
  Note: The user must first be created through Supabase Authentication
  with email pta.digi@gmail.com before running this migration
*/

-- Insert admin profile if it doesn't exist
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users
WHERE email = 'pta.digi@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin'
WHERE profiles.email = 'pta.digi@gmail.com';
