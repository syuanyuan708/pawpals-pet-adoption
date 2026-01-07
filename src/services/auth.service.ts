/**
 * 认证服务
 * 处理用户注册、登录、登出等认证相关操作
 */

import { supabase } from '../lib/supabase';
import type { User } from '../lib/database.types';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    joinDate: string;
    petsAdoptedCount: number;
}

/**
 * 用户注册
 * @param email 邮箱
 * @param password 密码
 * @param name 用户昵称
 */
export async function signUp(email: string, password: string, name: string): Promise<AuthUser> {
    // 使用 Supabase Auth 创建用户
    // NOTE: 数据库触发器会自动在 public.users 表创建对应记录
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            },
            // 跳过邮箱验证，直接登录（开发环境）
            // 生产环境可以移除此选项
            emailRedirectTo: window.location.origin
        }
    });

    if (authError) {
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error('注册失败，请稍后重试');
    }

    // 注册成功，返回用户信息
    // 用户记录由数据库触发器自动创建
    return {
        id: authData.user.id,
        email: email,
        name: name,
        avatar: 'https://via.placeholder.com/150',
        joinDate: new Date().toLocaleDateString('zh-CN', { year: 'numeric' }) + '年加入',
        petsAdoptedCount: 0
    };
}

/**
 * 用户登录
 * @param email 邮箱
 * @param password 密码
 */
export async function signIn(email: string, password: string): Promise<AuthUser> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error('登录失败，请检查邮箱和密码');
    }

    // 获取用户详细信息
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    return {
        id: authData.user.id,
        email: authData.user.email || email,
        name: userData?.name || authData.user.user_metadata?.name || '用户',
        avatar: userData?.avatar || 'https://via.placeholder.com/150',
        joinDate: userData?.join_date
            ? new Date(userData.join_date).toLocaleDateString('zh-CN', { year: 'numeric' }) + '年加入'
            : '新用户',
        petsAdoptedCount: userData?.pets_adopted_count || 0
    };
}

/**
 * 用户登出
 */
export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }
}

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return null;
        }

        // 获取用户详细信息（设置超时，避免卡住）
        let userData = null;
        try {
            const result = await Promise.race([
                supabase.from('users').select('*').eq('id', authUser.id).single(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ]) as { data: any };
            userData = result.data;
        } catch (err) {
            console.warn('获取用户详细信息超时或失败:', err);
        }

        return {
            id: authUser.id,
            email: authUser.email || '',
            name: userData?.name || authUser.user_metadata?.name || '用户',
            avatar: userData?.avatar || 'https://via.placeholder.com/150',
            joinDate: userData?.join_date
                ? new Date(userData.join_date).toLocaleDateString('zh-CN', { year: 'numeric' }) + '年加入'
                : '新用户',
            petsAdoptedCount: userData?.pets_adopted_count || 0
        };
    } catch (error) {
        console.error('获取当前用户失败:', error);
        return null;
    }
}

/**
 * 监听认证状态变化
 * @param callback 状态变化回调函数
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
            // 使用 setTimeout 稍微延迟，让触发器有时间创建用户记录
            setTimeout(async () => {
                try {
                    const user = await getCurrentUser();
                    callback(user);
                } catch (err) {
                    console.error('Auth state change handler error:', err);
                    // 即使获取详细信息失败，也返回基本用户信息
                    callback({
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.name || '用户',
                        avatar: 'https://via.placeholder.com/150',
                        joinDate: '新用户',
                        petsAdoptedCount: 0
                    });
                }
            }, 500);
        } else {
            callback(null);
        }
    });
}

/**
 * 更新用户资料
 * @param userId 用户 ID
 * @param updates 更新内容
 */
export async function updateUserProfile(
    userId: string,
    updates: { name?: string; avatar?: string }
): Promise<void> {
    const { error } = await supabase
        .from('users')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        throw new Error(error.message);
    }
}
