/**
 * 侧边栏组件
 * PC 端管理后台的主导航
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { path: '/', label: '仪表盘', icon: 'dashboard' },
    { path: '/pets', label: '宠物列表', icon: 'pets' },
    { path: '/pets/create', label: '录入宠物', icon: 'add_circle' },
    { path: '/applications', label: '领养申请', icon: 'assignment' },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-content">pets</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-text-main font-display">PawPals</h1>
                        <p className="text-xs text-text-muted">管理后台</p>
                    </div>
                </div>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 py-6 px-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <button
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                        ? 'bg-primary text-primary-content shadow-md'
                                        : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 底部信息 */}
            <div className="p-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-text-muted">后台管理系统 v1.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
