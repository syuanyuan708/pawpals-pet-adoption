/**
 * 领养申请服务
 * 处理领养申请的提交、查询等操作
 */

import { supabase } from '../lib/supabase';
import type { AdoptionApplication } from '../lib/database.types';

export interface ApplicationFormData {
    petId: string;
    applicantName: string;
    phone: string;
    city?: string;
    houseType?: 'own' | 'rent' | '';
    hasExperience?: boolean | null;
    hasChildren?: boolean | null;
    hasAllergies?: boolean | null;
    agreedToTerms: boolean;
}

export interface ApplicationStatus {
    pending: number;
    interviewing: number;
    approved: number;
    rejected: number;
}

/**
 * 提交领养申请
 * @param data 申请表单数据
 */
export async function submitApplication(data: ApplicationFormData): Promise<AdoptionApplication> {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('请先登录后再提交申请');
    }

    const { data: application, error } = await supabase
        .from('adoption_applications')
        .insert({
            user_id: user.id,
            pet_id: data.petId,
            applicant_name: data.applicantName,
            phone: data.phone,
            city: data.city || null,
            house_type: data.houseType || null,
            has_experience: data.hasExperience,
            has_children: data.hasChildren,
            has_allergies: data.hasAllergies,
            agreed_to_terms: data.agreedToTerms,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('提交申请失败:', error);
        throw new Error(error.message);
    }

    return application;
}

/**
 * 获取当前用户的所有申请
 */
export async function getMyApplications(): Promise<AdoptionApplication[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('adoption_applications')
        .select(`
      *,
      pets (*)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取申请列表失败:', error);
        throw new Error(error.message);
    }

    return data || [];
}

/**
 * 获取申请状态统计
 */
export async function getApplicationStatusCount(): Promise<ApplicationStatus> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { pending: 0, interviewing: 0, approved: 0, rejected: 0 };
    }

    const { data, error } = await supabase
        .from('adoption_applications')
        .select('status')
        .eq('user_id', user.id);

    if (error) {
        console.error('获取申请统计失败:', error);
        return { pending: 0, interviewing: 0, approved: 0, rejected: 0 };
    }

    const statusCount: ApplicationStatus = {
        pending: 0,
        interviewing: 0,
        approved: 0,
        rejected: 0
    };

    (data || []).forEach(app => {
        const status = app.status as keyof ApplicationStatus;
        if (status in statusCount) {
            statusCount[status]++;
        }
    });

    return statusCount;
}

/**
 * 根据 ID 获取申请详情
 * @param id 申请 ID
 */
export async function getApplicationById(id: string): Promise<AdoptionApplication | null> {
    const { data, error } = await supabase
        .from('adoption_applications')
        .select(`
      *,
      pets (*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('获取申请详情失败:', error);
        throw new Error(error.message);
    }

    return data;
}
