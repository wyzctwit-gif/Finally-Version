import { createClient } from '@supabase/supabase-js';

// Supabase 客户端单例
let supabaseInstance = null;

/**
 * 获取 Supabase 客户端实例
 * 在 Serverless Function 实例级别复用连接
 */
export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 配置缺失：SUPABASE_URL 或 SUPABASE_ANON_KEY 未设置');
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
}

export default getSupabase;
