/**
 * 宠物列表页面
 * 显示所有宠物，支持搜索和筛选
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getAllPets, deletePet, setPetAvailability } from '../services/pets.admin.service';
import type { Pet } from '../lib/types';

const PetList: React.FC = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

    const loadPets = async () => {
        setLoading(true);
        try {
            console.log('开始加载宠物列表...');
            const data = await getAllPets();
            console.log('获取到宠物数据:', data);
            setPets(data);
        } catch (err) {
            console.error('加载宠物列表失败:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPets();
    }, []);

    const filteredPets = pets.filter((pet) => {
        const matchesSearch =
            pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'available' && pet.is_available) ||
            (filter === 'unavailable' && !pet.is_available);
        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (pet: Pet) => {
        if (!confirm(`确定要删除宠物「${pet.name}」吗？此操作不可恢复。`)) return;

        try {
            await deletePet(pet.id);
            setPets((prev) => prev.filter((p) => p.id !== pet.id));
        } catch (err) {
            alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'));
        }
    };

    const handleToggleAvailability = async (pet: Pet) => {
        try {
            await setPetAvailability(pet.id, !pet.is_available);
            setPets((prev) =>
                prev.map((p) => (p.id === pet.id ? { ...p, is_available: !p.is_available } : p))
            );
        } catch (err) {
            alert('操作失败：' + (err instanceof Error ? err.message : '未知错误'));
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title="宠物列表"
                subtitle={`共 ${pets.length} 只宠物`}
                actions={
                    <button
                        onClick={() => navigate('/pets/create')}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-content rounded-xl font-bold shadow-md shadow-primary/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        录入宠物
                    </button>
                }
            />

            <main className="flex-1 p-8 bg-gray-50">
                {/* 搜索和筛选 */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜索宠物名称或品种..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white"
                        />
                    </div>
                    <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {(['all', 'available', 'unavailable'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-3 font-medium transition-colors ${filter === f
                                    ? 'bg-primary text-primary-content'
                                    : 'text-text-muted hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'all' ? '全部' : f === 'available' ? '可领养' : '已下线'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 宠物表格 */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : filteredPets.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-text-muted mb-4">pets</span>
                        <p className="text-text-muted">暂无宠物数据</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-text-main">宠物信息</th>
                                    <th className="text-left px-6 py-4 font-semibold text-text-main">类型</th>
                                    <th className="text-left px-6 py-4 font-semibold text-text-main">年龄</th>
                                    <th className="text-left px-6 py-4 font-semibold text-text-main">位置</th>
                                    <th className="text-center px-6 py-4 font-semibold text-text-main">状态</th>
                                    <th className="text-center px-6 py-4 font-semibold text-text-main">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPets.map((pet) => (
                                    <tr key={pet.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={pet.image}
                                                    alt={pet.name}
                                                    className="w-14 h-14 rounded-xl object-cover"
                                                />
                                                <div>
                                                    <p className="font-bold text-text-main">{pet.name}</p>
                                                    <p className="text-sm text-text-muted">{pet.breed}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-main">{pet.type}</td>
                                        <td className="px-6 py-4 text-text-main">{pet.age}</td>
                                        <td className="px-6 py-4 text-text-muted">{pet.location || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${pet.is_available
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {pet.is_available ? 'check_circle' : 'block'}
                                                </span>
                                                {pet.is_available ? '可领养' : '已下线'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/pets/edit/${pet.id}`)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-text-muted hover:text-text-main"
                                                    title="编辑"
                                                >
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleAvailability(pet)}
                                                    className={`p-2 hover:bg-gray-100 rounded-lg ${pet.is_available ? 'text-orange-500' : 'text-green-500'
                                                        }`}
                                                    title={pet.is_available ? '下线' : '上线'}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        {pet.is_available ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pet)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                                    title="删除"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PetList;
