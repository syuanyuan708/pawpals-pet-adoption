/**
 * 宠物录入页面
 * 创建新的宠物记录
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PetForm from '../components/PetForm';
import { createPet } from '../services/pets.admin.service';
import type { PetInsert } from '../lib/types';

const PetCreate: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: PetInsert) => {
        setIsLoading(true);
        try {
            await createPet(data);
            alert('宠物信息已保存！');
            navigate('/pets');
        } catch (err) {
            alert('保存失败：' + (err instanceof Error ? err.message : '未知错误'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title="录入宠物"
                subtitle="添加新的可领养宠物信息"
            />

            <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                <div className="max-w-4xl">
                    <PetForm onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
            </main>
        </div>
    );
};

export default PetCreate;
