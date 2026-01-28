/**
 * 宠物表单组件
 * 用于创建和编辑宠物信息
 */

import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { PetTypes, type PetInsert, type Shelter } from '../lib/types';
import { getShelters } from '../services/pets.admin.service';

interface PetFormProps {
    initialData?: Partial<PetInsert>;
    onSubmit: (data: PetInsert) => Promise<void>;
    isLoading?: boolean;
}

const PetForm: React.FC<PetFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [sheltersLoading, setSheltersLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<PetInsert>>({
        name: '',
        type: PetTypes.DOG,
        breed: '',
        age: '',
        gender: '公',
        weight: '',
        color: '',
        distance: '',
        description: '',
        tags: [],
        image: '',
        health_info: [],
        location: '',
        shelter_id: '',
        ...initialData,
    });
    const [tagInput, setTagInput] = useState('');
    const [healthInput, setHealthInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setSheltersLoading(true);
        getShelters()
            .then((data) => {
                console.log('获取到收容所数据:', data);
                setShelters(data);
            })
            .catch((err) => {
                console.error('获取收容所失败:', err);
            })
            .finally(() => {
                setSheltersLoading(false);
            });
    }, []);

    const updateField = <K extends keyof PetInsert>(key: K, value: PetInsert[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            updateField('tags', [...(formData.tags || []), tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        updateField('tags', formData.tags?.filter((t) => t !== tag) || []);
    };

    const addHealthInfo = () => {
        if (healthInput.trim() && !formData.health_info?.includes(healthInput.trim())) {
            updateField('health_info', [...(formData.health_info || []), healthInput.trim()]);
            setHealthInput('');
        }
    };

    const removeHealthInfo = (info: string) => {
        updateField('health_info', formData.health_info?.filter((h) => h !== info) || []);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) newErrors.name = '请输入宠物名称';
        if (!formData.breed?.trim()) newErrors.breed = '请输入品种';
        if (!formData.age?.trim()) newErrors.age = '请输入年龄';
        if (!formData.image?.trim()) newErrors.image = '请上传宠物图片';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        await onSubmit(formData as PetInsert);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本信息 */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    基本信息
                </h3>

                <div className="grid grid-cols-2 gap-6">
                    {/* 名称 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            宠物名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="例如：巴迪"
                            className={`w-full px-4 py-3 border rounded-xl ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* 类型 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            宠物类型 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type || PetTypes.DOG}
                            onChange={(e) => updateField('type', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        >
                            {Object.values(PetTypes).map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* 品种 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            品种 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.breed || ''}
                            onChange={(e) => updateField('breed', e.target.value)}
                            placeholder="例如：金毛寻回犬"
                            className={`w-full px-4 py-3 border rounded-xl ${errors.breed ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.breed && <p className="mt-1 text-sm text-red-500">{errors.breed}</p>}
                    </div>

                    {/* 年龄 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            年龄 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.age || ''}
                            onChange={(e) => updateField('age', e.target.value)}
                            placeholder="例如：2岁"
                            className={`w-full px-4 py-3 border rounded-xl ${errors.age ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
                    </div>

                    {/* 性别 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">性别</label>
                        <div className="flex gap-4">
                            {['公', '母'].map((g) => (
                                <label key={g} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value={g}
                                        checked={formData.gender === g}
                                        onChange={(e) => updateField('gender', e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-text-main">{g}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 体重 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">体重</label>
                        <input
                            type="text"
                            value={formData.weight || ''}
                            onChange={(e) => updateField('weight', e.target.value)}
                            placeholder="例如：25 公斤"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        />
                    </div>

                    {/* 颜色 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">毛色</label>
                        <input
                            type="text"
                            value={formData.color || ''}
                            onChange={(e) => updateField('color', e.target.value)}
                            placeholder="例如：金色"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        />
                    </div>

                    {/* 位置 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">所在位置</label>
                        <input
                            type="text"
                            value={formData.location || ''}
                            onChange={(e) => updateField('location', e.target.value)}
                            placeholder="例如：上海市"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        />
                    </div>

                    {/* 距离 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">距离（用户显示）</label>
                        <input
                            type="text"
                            value={formData.distance || ''}
                            onChange={(e) => updateField('distance', e.target.value)}
                            placeholder="例如：2.5 公里"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        />
                    </div>

                    {/* 收容所 */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">所属收容所</label>
                        <select
                            value={formData.shelter_id || ''}
                            onChange={(e) => updateField('shelter_id', e.target.value || null)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                            disabled={sheltersLoading}
                        >
                            {sheltersLoading ? (
                                <option value="">加载中...</option>
                            ) : shelters.length === 0 ? (
                                <option value="">暂无收容所数据</option>
                            ) : (
                                <>
                                    <option value="">请选择收容所</option>
                                    {shelters.map((shelter) => (
                                        <option key={shelter.id} value={shelter.id}>
                                            {shelter.name} {shelter.location ? `- ${shelter.location}` : ''}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        {!sheltersLoading && shelters.length === 0 && (
                            <p className="mt-1 text-sm text-text-muted">提示：请先在数据库中添加收容所数据</p>
                        )}
                    </div>
                </div>
            </section>

            {/* 图片上传 */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">image</span>
                    宠物图片 <span className="text-red-500">*</span>
                </h3>
                <ImageUpload
                    value={formData.image}
                    onChange={(url) => updateField('image', url)}
                />
                {errors.image && <p className="mt-2 text-sm text-red-500">{errors.image}</p>}
            </section>

            {/* 详细描述 */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    详细描述
                </h3>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="请详细描述宠物的性格、习惯、喜好等..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none"
                />
            </section>

            {/* 标签 */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">label</span>
                    特点标签
                </h3>
                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="输入标签后按回车添加"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-text-main"
                    >
                        添加
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </span>
                    ))}
                </div>
            </section>

            {/* 健康信息 */}
            <section className="bg-white rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">medical_services</span>
                    健康信息
                </h3>
                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        value={healthInput}
                        onChange={(e) => setHealthInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHealthInfo())}
                        placeholder="例如：已接种疫苗、已绝育"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={addHealthInfo}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-text-main"
                    >
                        添加
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.health_info?.map((info) => (
                        <span
                            key={info}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                            {info}
                            <button type="button" onClick={() => removeHealthInfo(info)} className="hover:bg-green-200 rounded-full p-0.5">
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </span>
                    ))}
                </div>
            </section>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-text-main"
                >
                    取消
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-primary-content rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading && <span className="w-4 h-4 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin" />}
                    {initialData?.id ? '保存修改' : '保存宠物'}
                </button>
            </div>
        </form>
    );
};

export default PetForm;
