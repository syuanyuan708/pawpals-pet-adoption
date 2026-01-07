
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PETS } from '../constants';
import type { Pet } from '../types';
import { getPetById } from '../src/services/pets.service';
import { toggleFavorite, isFavorite } from '../src/services/favorites.service';
import { useAuth } from '../src/contexts/AuthContext';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const loadPet = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getPetById(id);
        if (data) {
          setPet(data);
        } else {
          // 使用 Mock 数据作为备用
          const mockPet = MOCK_PETS.find(p => p.id === id);
          setPet(mockPet || null);
        }
      } catch (err) {
        console.error('加载宠物详情失败:', err);
        // 使用 Mock 数据作为备用
        const mockPet = MOCK_PETS.find(p => p.id === id);
        setPet(mockPet || null);
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [id]);

  // 加载收藏状态
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (user && id) {
        try {
          const fav = await isFavorite(id);
          setIsFav(fav);
        } catch (err) {
          console.error('加载收藏状态失败:', err);
        }
      }
    };
    loadFavoriteStatus();
  }, [user, id]);

  // 处理收藏切换
  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) return;

    try {
      const result = await toggleFavorite(id);
      setIsFav(result);
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6">
        <span className="material-symbols-outlined text-6xl text-text-muted mb-4">pets</span>
        <p className="text-text-muted font-medium mb-6">未找到该宠物信息</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 bg-primary text-primary-content font-bold rounded-2xl"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-32 bg-background-light dark:bg-background-dark">
      {/* 顶部英雄图区域 */}
      <div className="relative h-[48vh] w-full shrink-0">
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-10">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate('/home')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all active:scale-90"
              aria-label="返回首页"
            >
              <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
            </button>
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all active:scale-90">
            <span className="material-symbols-outlined text-white text-[24px]">share</span>
          </button>
        </div>

        <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" />

        {/* 指示点 */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5">
          <div className="h-1.5 w-6 rounded-full bg-primary shadow-sm"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-white/70"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-white/70"></div>
        </div>
      </div>

      {/* 内容卡片区 */}
      <div className="relative -mt-10 flex flex-col gap-6 rounded-t-[40px] bg-white dark:bg-background-dark px-6 py-8 shadow-2xl z-10">
        {/* 标题与收藏 */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-4xl font-black tracking-tight text-text-main dark:text-white">
              {pet.name}
            </h1>
            <div className="flex items-center gap-1 text-text-muted">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="text-sm font-bold">{pet.location} ({pet.distance})</span>
            </div>
          </div>
          <button
            onClick={handleFavorite}
            className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-soft transition-colors bg-white dark:bg-surface-dark ${isFav
                ? 'border-red-200 text-red-500'
                : 'border-gray-100 dark:border-white/10 text-text-muted hover:text-red-500'
              }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${isFav ? 'filled' : ''}`}>favorite</span>
          </button>
        </div>

        {/* 快速标签 */}
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
            {pet.breed}
          </span>
          <span className="px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 text-text-muted text-xs font-bold">
            {pet.age}
          </span>
          <span className="px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 text-text-muted text-xs font-bold">
            已接种疫苗
          </span>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '性别', value: pet.gender, icon: pet.gender === '公' ? 'male' : 'female', color: 'blue' },
            { label: '体重', value: pet.weight, icon: 'monitor_weight', color: 'orange' },
            { label: '毛色', value: pet.color, icon: 'palette', color: 'green' }
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center justify-center gap-1 rounded-3xl border border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 p-4 transition-transform hover:scale-[1.02]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm mb-1 text-${stat.color}-500`}>
                <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
              </div>
              <p className="text-base font-black text-text-main dark:text-white leading-none">{stat.value}</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 详情介绍 */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-black text-text-main dark:text-white">关于{pet.name}</h2>
          <p className="text-text-muted dark:text-gray-400 text-base leading-relaxed font-medium">
            {pet.description}
          </p>
        </div>

        {/* 健康与需求 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-black text-text-main dark:text-white">健康与需求</h2>
          <div className="flex flex-col gap-3">
            {pet.healthInfo.map((info) => (
              <div key={info} className="flex items-start gap-3 group">
                <div className="mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 text-green-500">
                  <span className="material-symbols-outlined text-[18px] font-bold">check_circle</span>
                </div>
                <span className="text-text-main dark:text-gray-300 text-sm font-bold">{info}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 发布者卡片 */}
        <div className="flex items-center justify-between rounded-[32px] bg-gray-50 dark:bg-white/5 p-5 border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={pet.shelter.avatar} alt={pet.shelter.owner} className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm" />
              {pet.shelter.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-content ring-2 ring-white">
                  <span className="material-symbols-outlined text-[14px] font-bold">verified</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-base font-black text-text-main dark:text-white">{pet.shelter.owner}</p>
              <p className="text-xs text-text-muted font-bold">{pet.shelter.name}</p>
            </div>
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-surface-dark text-text-main dark:text-white shadow-sm hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">chat</span>
          </button>
        </div>
      </div>

      {/* 底部悬浮按钮 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-background-dark dark:via-background-dark/95">
        <button
          onClick={() => navigate(`/apply/${pet.id}`)}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-[24px] bg-primary px-8 font-black text-[#111817] shadow-[0_12px_24px_rgba(250,198,56,0.4)] hover:shadow-[0_12px_32px_rgba(250,198,56,0.6)] active:scale-[0.97] transition-all"
        >
          <span className="material-symbols-outlined text-[24px] font-bold">pets</span>
          <span className="text-lg">申请领养</span>
        </button>
      </div>
    </div>
  );
};

export default Details;
