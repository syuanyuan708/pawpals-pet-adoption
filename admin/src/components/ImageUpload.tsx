/**
 * 图片上传组件
 * 支持拖拽上传和点击上传
 */

import React, { useState, useRef, useCallback } from 'react';
import { uploadImage } from '../lib/upload';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, className = '' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError('');
        setIsUploading(true);

        try {
            const url = await uploadImage(file);
            onChange(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : '上传失败');
        } finally {
            setIsUploading(false);
        }
    }, [onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        } else {
            setError('请上传图片文件');
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative border-2 border-dashed rounded-2xl transition-all cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
          ${value ? 'p-2' : 'p-8'}
        `}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-sm text-text-muted">正在上传...</p>
                    </div>
                ) : value ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden group">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                onClick={handleClick}
                                className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-text-main hover:bg-gray-100"
                            >
                                更换图片
                            </button>
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-text-muted">cloud_upload</span>
                        </div>
                        <p className="text-text-main font-medium mb-1">点击或拖拽上传图片</p>
                        <p className="text-sm text-text-muted">支持 JPG、PNG、GIF、WebP，最大 10MB</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </p>
            )}
        </div>
    );
};

export default ImageUpload;
