/**
 * 宠物管理服务（管理员版本）
 * 处理宠物的增删改查操作
 */

import { supabaseAdmin } from '../lib/supabase';
import type { Pet, PetInsert, Shelter } from '../lib/types';

/**
 * 获取所有宠物列表（包括已下线的）
 */
export async function getAllPets(): Promise<Pet[]> {
    console.log('pets.admin.service: 开始查询宠物...');

    const { data, error } = await supabaseAdmin
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

    console.log('pets.admin.service: 查询结果', { data, error });

    if (error) {
        console.error('获取宠物列表失败:', error);
        throw new Error(error.message);
    }

    return data || [];
}

/**
 * 根据 ID 获取宠物详情
 */
export async function getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabaseAdmin
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('获取宠物详情失败:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * 创建新宠物
 */
export async function createPet(petData: PetInsert): Promise<Pet> {
    const { data, error } = await supabaseAdmin
        .from('pets')
        .insert({
            ...petData,
            is_available: true,
            is_latest: true,
        })
        .select()
        .single();

    if (error) {
        console.error('创建宠物失败:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * 更新宠物信息
 */
export async function updatePet(id: string, updates: Partial<PetInsert>): Promise<Pet> {
    const { data, error } = await supabaseAdmin
        .from('pets')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('更新宠物失败:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * 删除宠物
 */
export async function deletePet(id: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from('pets')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('删除宠物失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 设置宠物下线状态（仅在 App 端生效）
 */
export async function setPetAvailability(id: string, isAvailable: boolean): Promise<void> {
    const { error } = await supabaseAdmin
        .from('pets')
        .update({
            is_available: isAvailable,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('更新宠物状态失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 获取所有收容所
 */
export async function getShelters(): Promise<Shelter[]> {
    const { data, error } = await supabaseAdmin
        .from('shelters')
        .select('*')
        .order('name');

    if (error) {
        console.error('获取收容所列表失败:', error);
        throw new Error(error.message);
    }

    return data || [];
}
