DROP POLICY IF EXISTS "seed admin can repair own role" ON public.user_roles;

CREATE POLICY "seed admin can repair own role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'admin'
    AND lower(auth.jwt() ->> 'email') IN (
      'jayszrs@admin.local',
      'jaelanisuryasaputra@gmail.com',
      'jaelanisurya.akademicrypto@gmail.com'
    )
  );
