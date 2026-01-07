/**
 * 宠物服务
 * 处理宠物列表、详情、搜索等操作
 */

import { supabase } from '../lib/supabase';
import type { Pet as DbPet, Shelter } from '../lib/database.types';
import type { Pet, PetType } from '../../types';

// 宠物类型映射
const PetTypeMap: Record<string, PetType> = {
    '狗狗': '狗狗' as PetType,
    '猫咪': '猫咪' as PetType,
    '鸟类': '鸟类' as PetType,
    '兔子': '兔子' as PetType
};

/**
 * 将数据库宠物记录转换为前端 Pet 类型
 */
function transformPet(dbPet: DbPet & { shelters?: Shelter | null }): Pet {
    return {
        id: dbPet.id,
        name: dbPet.name,
        type: PetTypeMap[dbPet.type] || dbPet.type as PetType,
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender as '公' | '母',
        weight: dbPet.weight || '',
        color: dbPet.color || '',
        distance: dbPet.distance || '',
        description: dbPet.description || '',
        tags: dbPet.tags || [],
        image: dbPet.image,
        isLatest: dbPet.is_latest,
        healthInfo: dbPet.health_info || [],
        location: dbPet.location || '',
        shelter: dbPet.shelters ? {
            name: dbPet.shelters.name,
            owner: dbPet.shelters.owner,
            avatar: dbPet.shelters.avatar || '',
            isVerified: dbPet.shelters.is_verified
        } : {
            name: '未知收容所',
            owner: '未知',
            avatar: '',
            isVerified: false
        }
    };
}

export interface PetFilters {
    type?: string;
    location?: string;
    isAvailable?: boolean;
}

/**
 * 获取所有宠物列表
 * @param filters 筛选条件
 */
export async function getAllPets(filters?: PetFilters): Promise<Pet[]> {
    let query = supabase
        .from('pets')
        .select(`
      *,
      shelters (*)
    `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    // 应用类型筛选
    if (filters?.type && filters.type !== '全部') {
        query = query.eq('type', filters.type);
    }

    // 应用位置筛选
    if (filters?.location) {
        query = query.eq('location', filters.location);
    }

    const { data, error } = await query;

    if (error) {
        console.error('获取宠物列表失败:', error);
        throw new Error(error.message);
    }

    return (data || []).map(pet => transformPet(pet as DbPet & { shelters?: Shelter | null }));
}

/**
 * 根据 ID 获取宠物详情
 * @param id 宠物 ID
 */
export async function getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase
        .from('pets')
        .select(`
      *,
      shelters (*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // 未找到
        }
        console.error('获取宠物详情失败:', error);
        throw new Error(error.message);
    }

    return transformPet(data as DbPet & { shelters?: Shelter | null });
}

/**
 * 搜索宠物
 * @param query 搜索关键词
 */
export async function searchPets(query: string): Promise<Pet[]> {
    if (!query.trim()) {
        return getAllPets();
    }

    const { data, error } = await supabase
        .from('pets')
        .select(`
      *,
      shelters (*)
    `)
        .eq('is_available', true)
        .or(`name.ilike.%${query}%,breed.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('搜索宠物失败:', error);
        throw new Error(error.message);
    }

    return (data || []).map(pet => transformPet(pet as DbPet & { shelters?: Shelter | null }));
}

/**
 * 获取最新上架的宠物
 * @param limit 数量限制
 */
export async function getLatestPets(limit: number = 5): Promise<Pet[]> {
    const { data, error } = await supabase
        .from('pets')
        .select(`
      *,
      shelters (*)
    `)
        .eq('is_available', true)
        .eq('is_latest', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('获取最新宠物失败:', error);
        throw new Error(error.message);
    }

    return (data || []).map(pet => transformPet(pet as DbPet & { shelters?: Shelter | null }));
}
