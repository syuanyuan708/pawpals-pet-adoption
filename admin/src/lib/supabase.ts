/**
 * Supabase 客户端配置（管理员版本）
 * 
 * 注意：浏览器环境不允许使用 service_role key
 * 因此使用 anon key，并通过 RLS 策略控制权限
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 从环境变量读取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 调试：输出配置状态
console.log('Supabase 配置:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
});

// 验证必要的环境变量
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ 缺少 Supabase 配置，请在 .env 文件中设置');
}

/**
 * Supabase 客户端
 * 使用 anon key，权限由 RLS 策略控制
 */
export const supabaseAdmin: SupabaseClient = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
        },
    }
);

export default supabaseAdmin;
