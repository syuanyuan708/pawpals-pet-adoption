
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PETS } from '../constants';
import type { Pet } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { getApplicationStatusCount, type ApplicationStatus } from '../src/services/applications.service';
import { getMyFavorites } from '../src/services/favorites.service';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, initializing } = useAuth();
  const [statusCount, setStatusCount] = useState<ApplicationStatus>({ pending: 0, interviewing: 0, approved: 0, rejected: 0 });
  const [favorites, setFavorites] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [status, favs] = await Promise.all([
          getApplicationStatusCount(),
          getMyFavorites()
        ]);
        setStatusCount(status);
        setFavorites(favs.length > 0 ? favs : MOCK_PETS);
      } catch (err) {
        console.error('加载数据失败:', err);
        setFavorites(MOCK_PETS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('登出失败:', err);
    }
  };

  // 未登录状态
  if (!user && !initializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6">
        <span className="material-symbols-outlined text-6xl text-text-muted mb-4">person</span>
        <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">尚未登录</h2>
        <p className="text-text-muted text-center mb-6">登录后可查看个人中心</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-primary text-primary-content font-bold rounded-2xl"
        >
          立即登录
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-24 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200/50 flex items-center px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-main dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight text-text-main flex-1">个人中心</h2>
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors text-text-main">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </div>

      <div className="flex flex-col items-center pt-6 pb-8 px-4">
        <div className="relative group cursor-pointer">
          <div
            className="w-28 h-28 rounded-full bg-cover bg-center border-4 border-white shadow-soft"
            style={{ backgroundImage: `url(${user?.avatar || 'https://via.placeholder.com/150'})` }}
          />
          <div className="absolute bottom-0 right-0 bg-primary text-[#111817] rounded-full p-1.5 border-2 border-white flex items-center justify-center">
            <span className="material-symbols-outlined text-sm font-bold">edit</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-bold text-text-main">{user?.name || '用户'}</h1>
          <p className="text-text-muted text-sm mt-1 font-medium">{user?.joinDate || '新用户'} • 已领养{user?.petsAdoptedCount || 0}只宠物</p>
        </div>
        <button className="mt-6 w-full max-w-[200px] h-10 flex items-center justify-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 text-teal-700 font-bold text-sm transition-all active:scale-95">
          <span>编辑资料</span>
        </button>
      </div>

      <div className="px-4 mb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-main">我的申请</h3>
          <button className="text-primary text-sm font-semibold hover:opacity-80">查看历史</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '待审核', count: statusCount.pending, icon: 'pending_actions', color: 'orange' },
            { label: '面试中', count: statusCount.interviewing, icon: 'forum', color: 'blue' },
            { label: '已通过', count: statusCount.approved, icon: 'check_circle', color: 'primary' }
          ].map(item => (
            <div key={item.label} className={`flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border ${item.label === '已通过' ? 'border-primary/20' : 'border-gray-50'} relative overflow-hidden`}>
              {item.count > 0 && item.label === '待审核' && (
                <div className="absolute top-0 right-0 p-1.5"><span className="flex h-2.5 w-2.5 rounded-full bg-red-500" /></div>
              )}
              <div className={`p-2.5 rounded-full ${item.label === '已通过' ? 'bg-primary/20 text-teal-700' : `bg-${item.color}-50 text-${item.color}-500`}`}>
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-text-main leading-none">{item.count}</p>
                <p className="text-xs font-medium text-text-muted mt-1">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-lg font-bold text-text-main">我的收藏</h3>
          <button className="text-primary text-sm font-semibold hover:opacity-80">查看全部</button>
        </div>
        <div className="flex overflow-x-auto pb-4 px-4 gap-4 no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center w-full py-10">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-10 text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2">favorite_border</span>
              <p className="text-sm">暂无收藏</p>
            </div>
          ) : (
            favorites.map(pet => (
              <div
                key={pet.id}
                onClick={() => navigate(`/details/${pet.id}`)}
                className="min-w-[160px] bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="aspect-[4/3] w-full bg-gray-100 relative bg-cover bg-center" style={{ backgroundImage: `url(${pet.image})` }}>
                  <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-red-500">
                    <span className="material-symbols-outlined text-lg filled">favorite</span>
                  </button>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-text-main text-base">{pet.name}</h4>
                  <p className="text-xs text-text-muted mt-0.5">{pet.breed}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pet.gender === '公' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                      {pet.gender}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{pet.age}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 px-4">
        <h3 className="text-lg font-bold text-text-main mb-3">常用功能</h3>
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { label: '领养偏好', icon: 'pets', color: 'purple' },
            { label: '领养记录', icon: 'history', color: 'teal' },
            { label: '爱心捐赠', icon: 'volunteer_activism', color: 'yellow' },
            { label: '帮助与客服', icon: 'help', color: 'blue' }
          ].map((func, i) => (
            <button key={func.label} className={`w-full flex items-center justify-between p-4 ${i < 3 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-${func.color}-50 text-${func.color}-600 flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-lg">{func.icon}</span>
                </div>
                <span className="font-medium text-text-main">{func.label}</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">chevron_right</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3.5 text-center text-red-500 font-bold bg-white rounded-xl border border-gray-100 hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Profile;
