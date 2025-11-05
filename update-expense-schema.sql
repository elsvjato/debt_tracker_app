-- Update expense schema to support user_id for expenses
-- This allows the user profile to be used in expenses without being a contact

-- Add user_id column to expense_paid_by table
ALTER TABLE expense_paid_by 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to expense_split_between table
ALTER TABLE expense_split_between 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add check constraint to ensure either contact_id or user_id is provided
ALTER TABLE expense_paid_by 
ADD CONSTRAINT check_contact_or_user 
CHECK (contact_id IS NOT NULL OR user_id IS NOT NULL);

ALTER TABLE expense_split_between 
ADD CONSTRAINT check_contact_or_user 
CHECK (contact_id IS NOT NULL OR user_id IS NOT NULL);

-- Update RLS policies for expense_paid_by
DROP POLICY IF EXISTS "Users can view their own expense paid by" ON expense_paid_by;
CREATE POLICY "Users can view their own expense paid by" ON expense_paid_by
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own expense paid by" ON expense_paid_by;
CREATE POLICY "Users can insert their own expense paid by" ON expense_paid_by
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own expense paid by" ON expense_paid_by;
CREATE POLICY "Users can update their own expense paid by" ON expense_paid_by
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own expense paid by" ON expense_paid_by;
CREATE POLICY "Users can delete their own expense paid by" ON expense_paid_by
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

-- Update RLS policies for expense_split_between
DROP POLICY IF EXISTS "Users can view their own expense split between" ON expense_split_between;
CREATE POLICY "Users can view their own expense split between" ON expense_split_between
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own expense split between" ON expense_split_between;
CREATE POLICY "Users can insert their own expense split between" ON expense_split_between
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own expense split between" ON expense_split_between;
CREATE POLICY "Users can update their own expense split between" ON expense_split_between
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own expense split between" ON expense_split_between;
CREATE POLICY "Users can delete their own expense split between" ON expense_split_between
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  ); 