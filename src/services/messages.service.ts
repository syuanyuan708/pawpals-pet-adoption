/**
 * 消息服务
 * 处理消息的获取、已读标记等操作
 */

import { supabase } from '../lib/supabase';
import type { Message as DbMessage } from '../lib/database.types';
import type { Message } from '../../types';

/**
 * 将数据库消息记录转换为前端 Message 类型
 */
function transformMessage(dbMessage: DbMessage): Message {
    return {
        id: dbMessage.id,
        senderName: dbMessage.sender_name,
        senderAvatar: dbMessage.sender_avatar || '',
        content: dbMessage.content,
        time: dbMessage.time || formatTime(dbMessage.created_at),
        isUnread: dbMessage.is_unread,
        type: dbMessage.type as 'system' | 'user'
    };
}

/**
 * 格式化时间显示
 */
function formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN');
}

/**
 * 获取当前用户的所有消息
 */
export async function getMessages(): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取消息列表失败:', error);
        throw new Error(error.message);
    }

    return (data || []).map(transformMessage);
}

/**
 * 标记消息为已读
 * @param messageId 消息 ID
 */
export async function markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .update({ is_unread: false })
        .eq('id', messageId);

    if (error) {
        console.error('标记已读失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 标记所有消息为已读
 */
export async function markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
        .from('messages')
        .update({ is_unread: false })
        .eq('recipient_id', user.id)
        .eq('is_unread', true);

    if (error) {
        console.error('标记全部已读失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 获取未读消息数量
 */
export async function getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_unread', true);

    if (error) {
        console.error('获取未读数量失败:', error);
        return 0;
    }

    return count || 0;
}

/**
 * 发送系统消息
 * @param recipientId 接收者 ID
 * @param content 消息内容
 */
export async function sendSystemMessage(
    recipientId: string,
    content: string
): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .insert({
            recipient_id: recipientId,
            sender_name: '系统通知',
            sender_avatar: 'https://img.icons8.com/fluency/96/appointment-reminders.png',
            content,
            type: 'system',
            is_unread: true
        });

    if (error) {
        console.error('发送系统消息失败:', error);
        throw new Error(error.message);
    }
}

/**
 * 发送用户消息（来自收容所等）
 */
export async function sendUserMessage(
    recipientId: string,
    senderName: string,
    senderAvatar: string,
    content: string
): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .insert({
            recipient_id: recipientId,
            sender_name: senderName,
            sender_avatar: senderAvatar,
            content,
            type: 'user',
            is_unread: true
        });

    if (error) {
        console.error('发送消息失败:', error);
        throw new Error(error.message);
    }
}
