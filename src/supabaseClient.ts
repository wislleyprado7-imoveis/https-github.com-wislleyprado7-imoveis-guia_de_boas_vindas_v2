import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || "https://fkjqpuqyxkvbhlagvfvo.supabase.co";
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZranFwdXF5eGt2YmhsYWd2ZnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTUwOTMsImV4cCI6MjA5ODEzMTA5M30.WObxMXRy2UEPllzv6S7CEYRzoA_wWVDEGJM3yumt1xo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

