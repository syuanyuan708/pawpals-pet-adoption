/**
 * 收藏服务
 * 处理宠物收藏的添加、删除、查询等操作
 */

import { supabase } from '../lib/supabase';
import type { Pet } from '../../types';
import { getAllPets } from './pets.service';

/**
 * 添加收藏
 * @param petId 宠物 ID
 */
export async function addFavorite(petId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('请先登录后再收藏');
    }

    const { error } = await supabase
        .from('favorites')
        .insert({
            user_id: user.id,
            pet_id: petId
        });

    if (error) {
        // 忽略重复收藏错误
        if (error.code === '23505') {
            return;
        }
        console.error('添加收藏失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 取消收藏
 * @param petId 宠物 ID
 */
export async function removeFavorite(petId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('请先登录');
    }

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('pet_id', petId);

    if (error) {
        console.error('取消收藏失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 检查是否已收藏
 * @param petId 宠物 ID
 */
export async function isFavorite(petId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('pet_id', petId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('检查收藏状态失败:', error);
        return false;
    }

    return !!data;
}

/**
 * 获取当前用户收藏的宠物 ID 列表
 */
export async function getFavoriteIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('favorites')
        .select('pet_id')
        .eq('user_id', user.id);

    if (error) {
        console.error('获取收藏列表失败:', error);
        return [];
    }

    return (data || []).map(f => f.pet_id);
}

/**
 * 获取当前用户收藏的宠物列表
 */
export async function getMyFavorites(): Promise<Pet[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
      pet_id,
      pets (
        *,
        shelters (*)
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取收藏宠物失败:', error);
        return [];
    }

    // 导入转换函数来处理数据
    // NOTE: 这里简化处理，直接返回宠物数据
    return (favorites || [])
        .filter(f => f.pets)
        .map(f => {
            const pet = f.pets as any;
            return {
                id: pet.id,
                name: pet.name,
                type: pet.type,
                breed: pet.breed,
                age: pet.age,
                gender: pet.gender,
                weight: pet.weight || '',
                color: pet.color || '',
                distance: pet.distance || '',
                description: pet.description || '',
                tags: pet.tags || [],
                image: pet.image,
                isLatest: pet.is_latest,
                healthInfo: pet.health_info || [],
                location: pet.location || '',
                shelter: pet.shelters ? {
                    name: pet.shelters.name,
                    owner: pet.shelters.owner,
                    avatar: pet.shelters.avatar || '',
                    isVerified: pet.shelters.is_verified
                } : {
                    name: '未知',
                    owner: '未知',
                    avatar: '',
                    isVerified: false
                }
            };
        });
}

/**
 * 切换收藏状态
 * @param petId 宠物 ID
 * @returns 切换后的收藏状态
 */
export async function toggleFavorite(petId: string): Promise<boolean> {
    const isFav = await isFavorite(petId);

    if (isFav) {
        await removeFavorite(petId);
        return false;
    } else {
        await addFavorite(petId);
        return true;
    }
}
