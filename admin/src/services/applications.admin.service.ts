/**
 * 领养申请管理服务（管理员版本）
 * 处理申请的查询和审批操作
 */

import { supabaseAdmin } from '../lib/supabase';
import type { AdoptionApplication, ApplicationWithDetails, Pet, User } from '../lib/types';
import { sendSystemMessage } from './messages.admin.service';
import { setPetAvailability } from './pets.admin.service';

/**
 * 获取所有领养申请（包含宠物和用户信息）
 */
export async function getAllApplications(): Promise<ApplicationWithDetails[]> {
    const { data, error } = await supabaseAdmin
        .from('adoption_applications')
        .select(`
      *,
      pets (*),
      users (*)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取申请列表失败:', error);
        throw new Error(error.message);
    }

    return (data || []) as ApplicationWithDetails[];
}

/**
 * 根据状态筛选申请
 */
export async function getApplicationsByStatus(
    status: 'pending' | 'interviewing' | 'approved' | 'rejected'
): Promise<ApplicationWithDetails[]> {
    const { data, error } = await supabaseAdmin
        .from('adoption_applications')
        .select(`
      *,
      pets (*),
      users (*)
    `)
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取申请列表失败:', error);
        throw new Error(error.message);
    }

    return (data || []) as ApplicationWithDetails[];
}

/**
 * 获取申请详情
 */
export async function getApplicationById(id: string): Promise<ApplicationWithDetails | null> {
    const { data, error } = await supabaseAdmin
        .from('adoption_applications')
        .select(`
      *,
      pets (*),
      users (*)
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

    return data as ApplicationWithDetails;
}

/**
 * 批准领养申请
 * 1. 更新申请状态为 approved
 * 2. 发送系统消息通知用户
 * 3. 设置宠物为不可领养状态（App 端下线）
 * 4. 更新用户的领养计数
 */
export async function approveApplication(applicationId: string): Promise<void> {
    // 获取申请详情
    const application = await getApplicationById(applicationId);
    if (!application) {
        throw new Error('申请不存在');
    }

    if (application.status !== 'pending' && application.status !== 'interviewing') {
        throw new Error('该申请已被处理');
    }

    const petName = application.pets?.name || '未知宠物';

    // 1. 更新申请状态
    const { error: updateError } = await supabaseAdmin
        .from('adoption_applications')
        .update({
            status: 'approved',
            updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

    if (updateError) {
        throw new Error(`更新申请状态失败: ${updateError.message}`);
    }

    // 2. 发送系统消息通知用户
    await sendSystemMessage(
        application.user_id,
        `🎉 恭喜！您对 ${petName} 的领养申请已通过审核。请尽快联系收容所完成领养手续。感谢您给小动物一个温暖的家！`
    );

    // 3. 设置宠物为不可领养状态（仅 App 端下线，后台仍可见）
    await setPetAvailability(application.pet_id, false);

    // 4. 更新用户领养计数
    const { error: userError } = await supabaseAdmin.rpc('increment_adoption_count', {
        user_id: application.user_id,
    });

    // NOTE: 如果 RPC 不存在，可以忽略这个错误
    if (userError) {
        console.warn('更新用户领养计数失败（可忽略）:', userError.message);
    }
}

/**
 * 拒绝领养申请
 * @param applicationId 申请 ID
 * @param reason 拒绝原因（可选）
 */
export async function rejectApplication(applicationId: string, reason?: string): Promise<void> {
    // 获取申请详情
    const application = await getApplicationById(applicationId);
    if (!application) {
        throw new Error('申请不存在');
    }

    if (application.status !== 'pending' && application.status !== 'interviewing') {
        throw new Error('该申请已被处理');
    }

    const petName = application.pets?.name || '未知宠物';

    // 1. 更新申请状态
    const { error: updateError } = await supabaseAdmin
        .from('adoption_applications')
        .update({
            status: 'rejected',
            updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

    if (updateError) {
        throw new Error(`更新申请状态失败: ${updateError.message}`);
    }

    // 2. 发送系统消息通知用户
    const reasonText = reason ? `原因：${reason}` : '如有疑问，请联系收容所了解详情。';
    await sendSystemMessage(
        application.user_id,
        `您对 ${petName} 的领养申请未通过审核。${reasonText} 您可以继续浏览其他可爱的小伙伴，祝您找到心仪的宠物！`
    );
}

/**
 * 获取申请统计数据
 */
export async function getApplicationStats(): Promise<{
    total: number;
    pending: number;
    interviewing: number;
    approved: number;
    rejected: number;
}> {
    const { data, error } = await supabaseAdmin
        .from('adoption_applications')
        .select('status');

    if (error) {
        console.error('获取统计数据失败:', error);
        throw new Error(error.message);
    }

    const stats = {
        total: data?.length || 0,
        pending: 0,
        interviewing: 0,
        approved: 0,
        rejected: 0,
    };

    data?.forEach((app) => {
        const status = app.status as keyof typeof stats;
        if (status in stats && status !== 'total') {
            stats[status]++;
        }
    });

    return stats;
}
