/**
 * 消息管理服务（管理员版本）
 * 处理系统消息的发送
 */

import { supabaseAdmin } from '../lib/supabase';

/**
 * 发送系统消息给用户
 * @param recipientId 接收者用户 ID
 * @param content 消息内容
 */
export async function sendSystemMessage(
    recipientId: string,
    content: string
): Promise<void> {
    const { error } = await supabaseAdmin
        .from('messages')
        .insert({
            recipient_id: recipientId,
            sender_name: '系统通知',
            sender_avatar: 'https://img.icons8.com/fluency/96/appointment-reminders.png',
            content,
            type: 'system',
            is_unread: true,
        });

    if (error) {
        console.error('发送系统消息失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 发送收容所消息给用户
 */
export async function sendShelterMessage(
    recipientId: string,
    shelterName: string,
    shelterAvatar: string,
    content: string
): Promise<void> {
    const { error } = await supabaseAdmin
        .from('messages')
        .insert({
            recipient_id: recipientId,
            sender_name: shelterName,
            sender_avatar: shelterAvatar,
            content,
            type: 'user',
            is_unread: true,
        });

    if (error) {
        console.error('发送消息失败:', error);
        throw new Error(error.message);
    }
}
