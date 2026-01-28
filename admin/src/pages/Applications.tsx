/**
 * 领养申请管理页面
 * 显示所有申请，支持审批操作
 */

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
    getAllApplications,
    approveApplication,
    rejectApplication,
} from '../services/applications.admin.service';
import type { ApplicationWithDetails } from '../lib/types';

const Applications: React.FC = () => {
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const data = await getAllApplications();
            setApplications(data);
        } catch (err) {
            console.error('加载申请列表失败:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const filteredApplications = applications.filter((app) => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const handleApprove = async (applicationId: string) => {
        if (!confirm('确定要批准这个领养申请吗？批准后将通知用户，并将宠物从 App 端下线。')) return;

        setProcessingId(applicationId);
        try {
            await approveApplication(applicationId);
            // 更新本地状态
            setApplications((prev) =>
                prev.map((app) =>
                    app.id === applicationId ? { ...app, status: 'approved' as const } : app
                )
            );
            alert('申请已批准！用户将收到通知消息。');
        } catch (err) {
            alert('操作失败：' + (err instanceof Error ? err.message : '未知错误'));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (applicationId: string) => {
        const reason = prompt('请输入拒绝原因（可选）：');
        if (reason === null) return; // 用户取消

        setProcessingId(applicationId);
        try {
            await rejectApplication(applicationId, reason || undefined);
            // 更新本地状态
            setApplications((prev) =>
                prev.map((app) =>
                    app.id === applicationId ? { ...app, status: 'rejected' as const } : app
                )
            );
            alert('申请已拒绝，用户将收到通知消息。');
        } catch (err) {
            alert('操作失败：' + (err instanceof Error ? err.message : '未知错误'));
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-700',
            interviewing: 'bg-blue-100 text-blue-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            pending: '待审批',
            interviewing: '面试中',
            approved: '已批准',
            rejected: '已拒绝',
        };
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title="领养申请"
                subtitle={`共 ${applications.length} 个申请`}
            />

            <main className="flex-1 p-8 bg-gray-50">
                {/* 筛选器 */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${filter === f
                                    ? 'bg-primary text-primary-content shadow-md'
                                    : 'bg-white text-text-muted hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {f === 'all' ? '全部' : f === 'pending' ? '待审批' : f === 'approved' ? '已批准' : '已拒绝'}
                            <span className="ml-2 text-sm opacity-60">
                                ({applications.filter((a) => f === 'all' || a.status === f).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* 申请列表 */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-text-muted mb-4">inbox</span>
                        <p className="text-text-muted">暂无申请记录</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map((app) => (
                            <div
                                key={app.id}
                                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all"
                            >
                                <div className="flex gap-6">
                                    {/* 宠物图片 */}
                                    <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={app.pets?.image || 'https://via.placeholder.com/128'}
                                            alt={app.pets?.name || '宠物'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* 申请信息 */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-text-main mb-1">
                                                    {app.applicant_name} 申请领养 {app.pets?.name || '未知宠物'}
                                                </h3>
                                                <p className="text-sm text-text-muted">
                                                    申请时间：{formatDate(app.created_at)}
                                                </p>
                                            </div>
                                            {getStatusBadge(app.status)}
                                        </div>

                                        {/* 详细信息 */}
                                        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                                            <div>
                                                <span className="text-text-muted">联系电话</span>
                                                <p className="font-medium text-text-main">{app.phone}</p>
                                            </div>
                                            <div>
                                                <span className="text-text-muted">所在城市</span>
                                                <p className="font-medium text-text-main">{app.city || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-text-muted">住房类型</span>
                                                <p className="font-medium text-text-main">
                                                    {app.house_type === 'own' ? '自有住房' : app.house_type === 'rent' ? '租房' : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-text-muted">养宠经历</span>
                                                <p className="font-medium text-text-main">
                                                    {app.has_experience === true ? '有' : app.has_experience === false ? '无' : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 宠物信息 */}
                                        <div className="flex items-center gap-4 text-sm text-text-muted">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">pets</span>
                                                {app.pets?.type} · {app.pets?.breed}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">cake</span>
                                                {app.pets?.age}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className={`material-symbols-outlined text-base ${app.pets?.gender === '公' ? 'text-blue-500' : 'text-pink-500'}`}>
                                                    {app.pets?.gender === '公' ? 'male' : 'female'}
                                                </span>
                                                {app.pets?.gender}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    {(app.status === 'pending' || app.status === 'interviewing') && (
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(app.id)}
                                                disabled={processingId === app.id}
                                                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {processingId === app.id ? (
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <span className="material-symbols-outlined">check</span>
                                                )}
                                                批准
                                            </button>
                                            <button
                                                onClick={() => handleReject(app.id)}
                                                disabled={processingId === app.id}
                                                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                                拒绝
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Applications;
