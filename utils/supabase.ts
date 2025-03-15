/* Polyfill import removed – not required in this environment */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://umqwvvlpjwemkqkkqjde.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcXd2dmxwandlbWtxa2txamRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMxODcyMDAsImV4cCI6MjAxODc2MzIwMH0.N-N5qHdW4CezGYvWGR-J-R8YNRT6G1sIQc2TSaOu0Sg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});