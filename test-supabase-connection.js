// Тестовий скрипт для перевірки підключення до Supabase
// Запустіть цей скрипт в Node.js для перевірки підключення

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gpafgqkrdkjocsbkmpue.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYWZncWtyZGtqb2NzYmttcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk5MjAsImV4cCI6MjA2NjQ1NTkyMH0.Y5fdXdRhq4IbzrK_kuMUeowjSnz1w9w0Ob82J4ThQtY';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Тест 1: Перевірка підключення
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('user_settings').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Тест 2: Перевірка таблиці user_profiles
    console.log('2. Testing user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ user_profiles table error:', profilesError);
    } else {
      console.log('✅ user_profiles table accessible');
    }
    
    // Тест 3: Перевірка функції handle_new_user
    console.log('3. Testing handle_new_user function...');
    const { data: funcTest, error: funcError } = await supabase.rpc('handle_new_user_test');
    
    if (funcError) {
      console.log('⚠️ handle_new_user function test failed (this is normal if function doesn\'t exist):', funcError.message);
    } else {
      console.log('✅ handle_new_user function accessible');
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Запуск тесту
testConnection(); 