/*
  # Create admin user and profile

  1. Changes
    - Creates admin user in auth.users if not exists
    - Creates or updates admin profile in profiles table
    - Sets up proper role and permissions
    
  2. Security
    - Uses secure password hashing
    - Maintains RLS policies
    - Ensures data consistency
*/

-- Create admin user in auth.users if they don't exist
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- First check if user exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'pta.digi@gmail.com';

  -- If user doesn't exist, create them
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'pta.digi@gmail.com',
      crypt('Mm11002299!@#', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      'authenticated'
    )
    RETURNING id INTO admin_user_id;
  END IF;

  -- Now ensure profile exists and is set as admin
  INSERT INTO profiles (id, email, role)
  VALUES (admin_user_id, 'pta.digi@gmail.com', 'admin')
  ON CONFLICT (id, email) DO UPDATE
  SET role = 'admin'
  WHERE profiles.email = 'pta.digi@gmail.com';
END $$;
