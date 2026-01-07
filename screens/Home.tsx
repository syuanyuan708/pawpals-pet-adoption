
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetType } from '../types';
import type { Pet } from '../types';
import { getAllPets, searchPets } from '../src/services/pets.service';
import { toggleFavorite, getFavoriteIds } from '../src/services/favorites.service';
import { useAuth } from '../src/contexts/AuthContext';
import { MOCK_PETS } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载宠物列表
  useEffect(() => {
    const loadPets = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllPets({ type: activeTab });
        setPets(data.length > 0 ? data : MOCK_PETS);
      } catch (err) {
        console.error('加载宠物列表失败:', err);
        // 如果加载失败，使用 Mock 数据作为备用
        setPets(MOCK_PETS);
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, [activeTab]);

  // 加载收藏状态
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const ids = await getFavoriteIds();
          setFavoriteIds(ids);
        } catch (err) {
          console.error('加载收藏状态失败:', err);
        }
      }
    };
    loadFavorites();
  }, [user]);

  // 搜索处理
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      try {
        const results = await searchPets(searchQuery);
        setPets(results.length > 0 ? results : MOCK_PETS.filter(pet =>
          pet.name.includes(searchQuery) || pet.breed.includes(searchQuery)
        ));
      } catch (err) {
        // 使用本地过滤作为备用
        const filtered = MOCK_PETS.filter(pet =>
          pet.name.includes(searchQuery) || pet.breed.includes(searchQuery)
        );
        setPets(filtered);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // 处理收藏切换
  const handleFavorite = async (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const isFavorited = await toggleFavorite(petId);
      if (isFavorited) {
        setFavoriteIds(prev => [...prev, petId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== petId));
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
  };

  // 过滤宠物
  const filteredPets = pets.filter(pet => {
    const matchesTab = activeTab === '全部' || pet.type === activeTab;
    const matchesSearch = !searchQuery || pet.name.includes(searchQuery) || pet.breed.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-1 pb-24">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="px-4 pt-12 pb-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">当前位置</span>
              <div className="flex items-center gap-1 text-text-main">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <span className="font-bold text-lg">上海市</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
            <div
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer"
            >
              <img
                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuB1ForfDuotj0gIaP52KqDyWCDzyu4lHRJc9hL7pGXBd-B7IGb5az4t5vXnOgl5xixVbtsVQvah0rU8khZkRLnS-uinef0vmytbeWyY43nLt5TwBbSC0FUc1g4bgO14q1xEny6Nq5oAS3O8MmNb7ES8GTfWA6AnfDqHJiWrJWglKcTDweQKoYhZEGLgmJ_Od2VlX-z1Xl1S0n5-41zLiK-ejRdAQg-O4KPnbb9no2Z6jdm0LIpHKD6dgQ3vY6otJUHet27Z507B-2pA"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-1 items-center bg-white dark:bg-surface-dark rounded-2xl h-12 shadow-sm px-4">
              <span className="material-symbols-outlined text-text-muted">search</span>
              <input
                type="text"
                placeholder="搜索名字或品种..."
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="h-12 w-12 flex items-center justify-center bg-white dark:bg-surface-dark rounded-2xl shadow-sm text-text-main">
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar">
          {['全部', PetType.DOG, PetType.CAT].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex h-10 shrink-0 items-center justify-center px-5 rounded-full text-sm font-bold transition-all ${activeTab === tab
                  ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-text-muted'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">附近的伙伴</h2>
          <button className="text-primary text-sm font-semibold hover:opacity-80">查看全部</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
            <p className="font-medium">没有找到符合条件的宠物</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredPets.map(pet => (
              <div
                key={pet.id}
                onClick={() => navigate(`/details/${pet.id}`)}
                className="group flex flex-col gap-3 bg-white dark:bg-surface-dark p-3 rounded-2xl shadow-card hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => handleFavorite(e, pet.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${favoriteIds.includes(pet.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/30 text-white hover:bg-white hover:text-red-500'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${favoriteIds.includes(pet.id) ? 'filled' : ''}`}>favorite</span>
                  </button>
                  {pet.isLatest && (
                    <div className="absolute bottom-3 left-3 bg-primary text-primary-content px-2 py-1 rounded-lg shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider">最新</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-text-main dark:text-white uppercase tracking-wider">{pet.distance}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-text-main text-lg font-bold leading-tight">{pet.name}</p>
                    <span className={`material-symbols-outlined text-[20px] ${pet.gender === '公' ? 'text-blue-400' : 'text-pink-400'}`}>
                      {pet.gender === '公' ? 'male' : 'female'}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm font-medium leading-normal truncate">{pet.breed}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-xs font-semibold text-text-muted">{pet.age}</span>
                    {pet.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-xs font-semibold text-green-700 dark:text-green-400">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
