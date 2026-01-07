/**
 * Supabase 客户端配置
 * 提供与 Supabase 后端服务的连接
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// 从环境变量读取 Supabase 配置
// NOTE: 这些变量需要在 .env.local 文件中配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 验证必要的环境变量
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('缺少 Supabase 配置。请在 .env.local 文件中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
}

/**
 * Supabase 客户端实例
 * 用于与 Supabase 数据库和认证服务交互
 */
export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            // 自动刷新 session
            autoRefreshToken: true,
            // 在页面加载时自动检测 session
            persistSession: true,
            // 检测 URL 中的 session（用于 OAuth 回调）
            detectSessionInUrl: true
        }
    }
);

export default supabase;
