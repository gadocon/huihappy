/*
  # Optimize RLS policies for better performance

  1. Changes
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies
    - Maintain same security rules but with better performance
    
  2. Security
    - Same access control rules are maintained
    - Only the policy implementation is optimized
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Recreate policies with optimized performance
CREATE POLICY "Admin can manage all profiles"
  ON profiles
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (role = 'admin')
  WITH CHECK (role = 'admin');

CREATE POLICY "Users can read own profile"
  ON profiles
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profiles"
  ON profiles
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
