/**
 * 认证上下文
 * 提供全局认证状态管理
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    signIn as authSignIn,
    signUp as authSignUp,
    signOut as authSignOut,
    getCurrentUser,
    onAuthStateChange,
    type AuthUser
} from '../services/auth.service';

interface AuthContextType {
    /** 当前用户 */
    user: AuthUser | null;
    /** 是否正在初始化 */
    initializing: boolean;
    /** 登录 */
    signIn: (email: string, password: string) => Promise<void>;
    /** 注册 */
    signUp: (email: string, password: string, name: string) => Promise<void>;
    /** 登出 */
    signOut: () => Promise<void>;
    /** 是否已登录 */
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * 认证 Provider 组件
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        let mounted = true;

        // 初始化时检查当前用户状态
        const initAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (mounted) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('初始化认证状态失败:', error);
            } finally {
                if (mounted) {
                    setInitializing(false);
                }
            }
        };

        // 设置超时，防止 Supabase 未配置时无限等待
        const timeout = setTimeout(() => {
            if (mounted && initializing) {
                setInitializing(false);
            }
        }, 3000);

        initAuth();

        // 监听认证状态变化
        try {
            const { data: { subscription } } = onAuthStateChange((authUser) => {
                if (mounted) {
                    setUser(authUser);
                    setInitializing(false);
                }
            });

            return () => {
                mounted = false;
                clearTimeout(timeout);
                subscription.unsubscribe();
            };
        } catch (error) {
            console.error('设置认证监听失败:', error);
            setInitializing(false);
            return () => {
                mounted = false;
                clearTimeout(timeout);
            };
        }
    }, []);

    /**
     * 登录
     */
    const signIn = async (email: string, password: string) => {
        const authUser = await authSignIn(email, password);
        setUser(authUser);
    };

    /**
     * 注册
     */
    const signUp = async (email: string, password: string, name: string) => {
        const authUser = await authSignUp(email, password, name);
        setUser(authUser);
    };

    /**
     * 登出
     */
    const signOut = async () => {
        await authSignOut();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        initializing,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * 获取认证上下文的 Hook
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth 必须在 AuthProvider 内部使用');
    }
    return context;
}

export default AuthContext;
