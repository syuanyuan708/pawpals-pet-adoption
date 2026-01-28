/**
 * 仪表盘页面
 * 显示系统概览和统计数据
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getAllPets } from '../services/pets.admin.service';
import { getApplicationStats } from '../services/applications.admin.service';

interface Stats {
    totalPets: number;
    availablePets: number;
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({
        totalPets: 0,
        availablePets: 0,
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [pets, appStats] = await Promise.all([
                    getAllPets(),
                    getApplicationStats(),
                ]);

                setStats({
                    totalPets: pets.length,
                    availablePets: pets.filter((p) => p.is_available).length,
                    totalApplications: appStats.total,
                    pendingApplications: appStats.pending,
                    approvedApplications: appStats.approved,
                });
            } catch (err) {
                console.error('加载统计数据失败:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const statCards = [
        {
            label: '宠物总数',
            value: stats.totalPets,
            icon: 'pets',
            color: 'bg-blue-500',
            onClick: () => navigate('/pets'),
        },
        {
            label: '可领养宠物',
            value: stats.availablePets,
            icon: 'check_circle',
            color: 'bg-green-500',
            onClick: () => navigate('/pets'),
        },
        {
            label: '待处理申请',
            value: stats.pendingApplications,
            icon: 'pending_actions',
            color: 'bg-orange-500',
            onClick: () => navigate('/applications'),
        },
        {
            label: '已批准领养',
            value: stats.approvedApplications,
            icon: 'thumb_up',
            color: 'bg-primary',
            onClick: () => navigate('/applications'),
        },
    ];

    return (
        <div className="flex-1 flex flex-col">
            <Header title="仪表盘" subtitle="欢迎使用 PawPals 后台管理系统" />

            <main className="flex-1 p-8 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* 统计卡片 */}
                        <div className="grid grid-cols-4 gap-6 mb-8">
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    onClick={card.onClick}
                                    className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all cursor-pointer card-hover"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                                            <span className="material-symbols-outlined text-white text-2xl">{card.icon}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-text-muted">arrow_forward</span>
                                    </div>
                                    <p className="text-3xl font-bold text-text-main mb-1">{card.value}</p>
                                    <p className="text-sm text-text-muted">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* 快捷操作 */}
                        <h2 className="text-lg font-bold text-text-main mb-4">快捷操作</h2>
                        <div className="grid grid-cols-3 gap-6">
                            <button
                                onClick={() => navigate('/pets/create')}
                                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left card-hover flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">录入新宠物</p>
                                    <p className="text-sm text-text-muted">添加新的可领养宠物</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/applications')}
                                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left card-hover flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-500 text-3xl">assignment</span>
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">处理申请</p>
                                    <p className="text-sm text-text-muted">审批领养申请</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/pets')}
                                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left card-hover flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">pets</span>
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">管理宠物</p>
                                    <p className="text-sm text-text-muted">查看和编辑宠物信息</p>
                                </div>
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
