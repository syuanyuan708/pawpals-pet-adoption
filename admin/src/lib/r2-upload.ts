/**
 * Cloudflare R2 图片上传服务
 * 使用 S3 兼容 API 上传图片到 R2
 */

// R2 配置
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

/**
 * 生成唯一的文件名
 */
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `pets/${timestamp}-${random}.${extension}`;
}

/**
 * 计算 HMAC-SHA256
 */
async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

/**
 * 计算 SHA256 哈希
 */
async function sha256(message: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', message);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 数组缓冲区转十六进制字符串
 */
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 生成 AWS Signature V4 签名
 */
async function generateSignature(
    method: string,
    url: URL,
    headers: Record<string, string>,
    body: ArrayBuffer,
    date: Date
): Promise<{ authorization: string; signedHeaders: string }> {
    const region = 'auto';
    const service = 's3';

    // 格式化日期
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    // 计算有效载荷哈希
    const payloadHash = await sha256(body);

    // 准备规范请求
    const signedHeaders = Object.keys(headers)
        .map((k) => k.toLowerCase())
        .sort()
        .join(';');

    const canonicalHeaders = Object.keys(headers)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((k) => `${k.toLowerCase()}:${headers[k].trim()}`)
        .join('\n');

    const canonicalRequest = [
        method,
        url.pathname,
        url.search.substring(1),
        canonicalHeaders + '\n',
        signedHeaders,
        payloadHash,
    ].join('\n');

    // 计算规范请求哈希
    const canonicalRequestHash = await sha256(new TextEncoder().encode(canonicalRequest));

    // 创建 StringToSign
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
        'AWS4-HMAC-SHA256',
        amzDate,
        credentialScope,
        canonicalRequestHash,
    ].join('\n');

    // 计算签名
    const kDate = await hmacSha256(
        new TextEncoder().encode('AWS4' + R2_SECRET_ACCESS_KEY),
        dateStamp
    );
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    const signature = bufferToHex(await hmacSha256(kSigning, stringToSign));

    const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return { authorization, signedHeaders };
}

/**
 * 上传图片到 Cloudflare R2
 * @param file 要上传的文件
 * @returns 上传后的公开访问 URL
 */
export async function uploadImageToR2(file: File): Promise<string> {
    // 验证配置
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        throw new Error('缺少 Cloudflare R2 配置，请检查环境变量');
    }

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
    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = new URL(`/${R2_BUCKET_NAME}/${fileName}`, endpoint);

    // 读取文件内容
    const fileBuffer = await file.arrayBuffer();
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');

    // 准备请求头
    const headers: Record<string, string> = {
        'Content-Type': file.type,
        'Host': url.host,
        'x-amz-content-sha256': await sha256(fileBuffer),
        'x-amz-date': amzDate,
    };

    // 生成签名
    const { authorization } = await generateSignature('PUT', url, headers, fileBuffer, date);

    // 发送请求
    const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
            ...headers,
            'Authorization': authorization,
        },
        body: fileBuffer,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('R2 上传失败:', errorText);
        throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    // 返回公开访问 URL
    const publicUrl = R2_PUBLIC_URL
        ? `${R2_PUBLIC_URL}/${fileName}`
        : `${endpoint}/${R2_BUCKET_NAME}/${fileName}`;

    return publicUrl;
}

/**
 * 删除 R2 中的图片
 * @param imageUrl 图片 URL
 */
export async function deleteImageFromR2(imageUrl: string): Promise<void> {
    // 从 URL 中提取文件名
    const urlObj = new URL(imageUrl);
    const fileName = urlObj.pathname.replace(`/${R2_BUCKET_NAME}/`, '');

    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = new URL(`/${R2_BUCKET_NAME}/${fileName}`, endpoint);

    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');

    const headers: Record<string, string> = {
        'Host': url.host,
        'x-amz-content-sha256': await sha256(new ArrayBuffer(0)),
        'x-amz-date': amzDate,
    };

    const { authorization } = await generateSignature('DELETE', url, headers, new ArrayBuffer(0), date);

    const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
            ...headers,
            'Authorization': authorization,
        },
    });

    if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        console.error('R2 删除失败:', errorText);
        throw new Error(`删除失败: ${response.status} ${response.statusText}`);
    }
}
