/**
 * PawPals 后台管理系统主应用
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PetList from './pages/PetList';
import PetCreate from './pages/PetCreate';
import PetEdit from './pages/PetEdit';
import Applications from './pages/Applications';

const App: React.FC = () => {
    return (
        <Router>
            <div className="flex min-h-screen bg-gray-50">
                {/* 侧边栏 */}
                <Sidebar />

                {/* 主内容区 */}
                <main className="flex-1 flex flex-col">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/pets" element={<PetList />} />
                        <Route path="/pets/create" element={<PetCreate />} />
                        <Route path="/pets/edit/:id" element={<PetEdit />} />
                        <Route path="/applications" element={<Applications />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
