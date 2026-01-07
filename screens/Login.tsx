
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6">
      <header className="pt-8 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight mb-2">欢迎回来！</h1>
          <p className="text-text-muted dark:text-gray-400 font-medium">输入您的账号信息，继续寻找可爱的伙伴。</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">邮箱地址</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted transition-colors group-focus-within:text-primary">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">登录密码</label>
              <button type="button" className="text-[10px] font-bold text-primary">忘记密码？</button>
            </div>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted transition-colors group-focus-within:text-primary">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入您的密码"
                className="w-full h-14 pl-12 pr-14 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-primary-content font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>登录中...</span>
              </>
            ) : (
              '立即登录'
            )}
          </button>
        </form>

        <div className="mt-10">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/5"></div>
            </div>
            <span className="relative px-4 bg-background-light dark:bg-background-dark text-xs font-bold text-text-muted uppercase tracking-widest">或者使用以下方式</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center gap-3 border border-gray-100 dark:border-white/5 shadow-sm hover:bg-gray-50 transition-colors">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale" alt="Google" />
              <span className="text-sm font-bold text-text-main dark:text-white">Google</span>
            </button>
            <button className="h-14 rounded-2xl bg-[#1877F2] flex items-center justify-center gap-3 shadow-md hover:opacity-90 transition-all">
              <img src="https://facebook.com/favicon.ico" className="w-5 h-5 brightness-0 invert" alt="Facebook" />
              <span className="text-sm font-bold text-white">Facebook</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-sm text-text-muted">
          还没有账号？
          <button
            onClick={() => navigate('/register')}
            className="ml-1 text-primary font-bold hover:underline"
          >
            立即注册
          </button>
        </p>
      </footer>
    </div>
  );
};

export default Login;
