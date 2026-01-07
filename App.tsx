
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Welcome from './screens/Welcome';
import Home from './screens/Home';
import Details from './screens/Details';
import Apply from './screens/Apply';
import Profile from './screens/Profile';
import Messages from './screens/Messages';
import Login from './screens/Login';
import Register from './screens/Register';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(true);

  // 隐藏全局导航的页面
  const hideNav = 
    location.pathname === '/' || 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname.startsWith('/details') || 
    location.pathname.startsWith('/apply');

  useEffect(() => {
    if (location.pathname === '/messages') {
      setHasUnread(false);
    }
  }, [location.pathname]);

  return (
    <div className="relative w-full max-w-[480px] min-h-screen bg-background-light dark:bg-background-dark shadow-2xl flex flex-col mx-auto overflow-x-hidden">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/apply/:id" element={<Apply />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>

      {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 pb-safe pt-2">
          <div className="flex justify-around items-end h-16 pb-2">
            <button 
              onClick={() => navigate('/home')}
              className={`flex flex-col items-center gap-1 group w-16 transition-colors ${location.pathname === '/home' ? 'text-primary' : 'text-text-muted'}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${location.pathname === '/home' ? 'filled' : ''}`}>home</span>
              <span className="text-[10px] font-bold">首页</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 group w-16 text-text-muted hover:text-text-main"
            >
              <span className="material-symbols-outlined text-[26px]">favorite</span>
              <span className="text-[10px] font-medium">收藏</span>
            </button>
            <button 
              onClick={() => navigate('/messages')}
              className={`flex flex-col items-center gap-1 group w-16 transition-colors relative ${location.pathname === '/messages' ? 'text-primary' : 'text-text-muted'}`}
            >
              {hasUnread && (
                <div className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark animate-pulse"></div>
              )}
              <span className={`material-symbols-outlined text-[26px] ${location.pathname === '/messages' ? 'filled' : ''}`}>chat_bubble</span>
              <span className="text-[10px] font-bold">消息</span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className={`flex flex-col items-center gap-1 group w-16 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-text-muted'}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${location.pathname === '/profile' ? 'filled' : ''}`}>person</span>
              <span className="text-[10px] font-bold">我的</span>
            </button>
          </div>
        </nav>
      )}
      
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
