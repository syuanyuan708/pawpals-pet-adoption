/**
 * 图片上传服务
 * 使用 Supabase Storage 存储图片
 * 
 * 注意：需要先在 Supabase Dashboard 中手动创建存储桶 "pet-images" 并设为 Public
 */

import { supabaseAdmin } from './supabase';

// 存储桶名称 - 需要在 Supabase Dashboard 中手动创建
const BUCKET_NAME = 'pet-images';

/**
 * 生成唯一的文件名
 */
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
}

/**
 * 上传图片到 Supabase Storage
 * @param file 要上传的文件
 * @returns 上传后的公开访问 URL
 */
export async function uploadImage(file: File): Promise<string> {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式');
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('图片大小不能超过 10MB');
    }

    const fileName = generateFileName(file.name);
    const filePath = `pets/${fileName}`;

    // 上传文件
    const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        console.error('上传失败:', uploadError);

        // 提供更友好的错误提示
        if (uploadError.message.includes('Bucket not found')) {
            throw new Error('存储桶不存在，请在 Supabase Dashboard 中创建名为 "pet-images" 的公开存储桶');
        }
        if (uploadError.message.includes('row-level security')) {
            throw new Error('权限不足，请检查 Supabase service_role key 配置，或在 Storage 中设置公开上传权限');
        }

        throw new Error(`上传失败: ${uploadError.message}`);
    }

    // 获取公开 URL
    const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

/**
 * 删除图片
 * @param imageUrl 图片 URL
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // 从 URL 中提取文件路径
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
        if (pathParts.length < 2) return;

        const filePath = pathParts[1];

        const { error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('删除图片失败:', error);
        }
    } catch (err) {
        console.error('删除图片时出错:', err);
    }
}
