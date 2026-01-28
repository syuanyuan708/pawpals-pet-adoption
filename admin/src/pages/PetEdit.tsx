/**
 * 宠物编辑页面
 * 编辑已有的宠物记录
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import PetForm from '../components/PetForm';
import { getPetById, updatePet } from '../services/pets.admin.service';
import type { Pet, PetInsert } from '../lib/types';

const PetEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadPet = async () => {
            if (!id) return;
            try {
                const data = await getPetById(id);
                if (data) {
                    setPet(data);
                } else {
                    alert('宠物不存在');
                    navigate('/pets');
                }
            } catch (err) {
                console.error('加载宠物信息失败:', err);
                alert('加载失败');
                navigate('/pets');
            } finally {
                setLoading(false);
            }
        };

        loadPet();
    }, [id, navigate]);

    const handleSubmit = async (data: PetInsert) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await updatePet(id, data);
            alert('宠物信息已更新！');
            navigate('/pets');
        } catch (err) {
            alert('更新失败：' + (err instanceof Error ? err.message : '未知错误'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <Header
                title="编辑宠物"
                subtitle={pet ? `编辑「${pet.name}」的信息` : ''}
            />

            <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                <div className="max-w-4xl">
                    {pet && (
                        <PetForm
                            initialData={{
                                ...pet,
                                id: pet.id,
                            }}
                            onSubmit={handleSubmit}
                            isLoading={isSubmitting}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default PetEdit;
