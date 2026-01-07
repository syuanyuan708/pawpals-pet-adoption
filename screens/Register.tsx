
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('请完整填写信息');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (!agreed) {
      setError('请先同意服务协议和隐私政策');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      navigate('/home');
    } catch (err) {
      // 翻译常见的 Supabase 错误信息
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      if (errorMessage.includes('User already registered') || errorMessage.includes('user_already_exists')) {
        setError('该邮箱已被注册，请直接登录或使用其他邮箱');
      } else if (errorMessage.includes('Invalid email')) {
        setError('邮箱格式不正确');
      } else if (errorMessage.includes('Password')) {
        setError('密码不符合要求（至少6位）');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6">
      <header className="pt-8 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight mb-2">加入 PawPals</h1>
          <p className="text-text-muted dark:text-gray-400 font-medium">创建一个账号，开始您的领养之旅。</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">您的昵称</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted transition-colors group-focus-within:text-primary">person</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如何称呼您？"
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white transition-all outline-none"
              />
            </div>
          </div>

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
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">设置密码</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted transition-colors group-focus-within:text-primary">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位字符"
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 p-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-xs font-medium text-text-muted leading-relaxed">
                我同意 <button type="button" className="text-primary font-bold">服务协议</button> 与 <button type="button" className="text-primary font-bold">隐私政策</button>，并承诺爱护每一只领养的生命。
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-primary-content font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>注册中...</span>
              </>
            ) : (
              '注册并开始探索'
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/5"></div>
            </div>
            <span className="relative px-4 bg-background-light dark:bg-background-dark text-xs font-bold text-text-muted uppercase tracking-widest">快速注册</span>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 flex items-center justify-center">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale" alt="Google" />
            </button>
            <button className="flex-1 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-text-main">apple</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-sm text-text-muted">
          已有账号？
          <button
            onClick={() => navigate('/login')}
            className="ml-1 text-primary font-bold hover:underline"
          >
            立即登录
          </button>
        </p>
      </footer>
    </div>
  );
};

export default Register;
