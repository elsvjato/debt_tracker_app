-- Створення таблиці для контактів
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Створення таблиці для подій
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Створення таблиці для учасників подій (many-to-many зв'язок)
CREATE TABLE event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, contact_id)
);

-- Створення таблиці для витрат
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  image_uri TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Створення таблиці для тих, хто заплатив за витрату
CREATE TABLE expense_paid_by (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (contact_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Створення таблиці для розподілу витрати між учасниками
CREATE TABLE expense_split_between (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (contact_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Створення таблиці для налаштувань користувача
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme_mode TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'USD',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profile table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Створення RLS (Row Level Security) політик
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_paid_by ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_split_between ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Політики для контактів
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Політики для подій
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Політики для учасників подій
CREATE POLICY "Users can view event participants" ON event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = event_participants.event_id AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert event participants" ON event_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = event_participants.event_id AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete event participants" ON event_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = event_participants.event_id AND events.user_id = auth.uid()
    )
  );

-- Політики для витрат
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Політики для тих, хто заплатив
CREATE POLICY "Users can view expense paid by" ON expense_paid_by
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expense paid by" ON expense_paid_by
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expense paid by" ON expense_paid_by
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_paid_by.expense_id AND expenses.user_id = auth.uid()
    )
  );

-- Політики для розподілу витрат
CREATE POLICY "Users can view expense split between" ON expense_split_between
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expense split between" ON expense_split_between
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expense split between" ON expense_split_between
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM expenses WHERE expenses.id = expense_split_between.expense_id AND expenses.user_id = auth.uid()
    )
  );

-- Політики для налаштувань
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Function for automatic creation of settings on registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user settings
  INSERT INTO user_settings (user_id)
  VALUES (new.id);
  
  -- Create user profile with name from metadata
  INSERT INTO user_profiles (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''));
  
  -- Log user creation for diagnostics
  RAISE NOTICE 'New user created: % with name: %', new.id, COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Unknown');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic creation of settings
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user(); 