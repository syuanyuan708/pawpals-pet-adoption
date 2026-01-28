/**
 * 数据库类型定义（复用自主应用）
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Pet {
    id: string;
    name: string;
    type: string;
    breed: string;
    age: string;
    gender: string;
    weight: string | null;
    color: string | null;
    distance: string | null;
    description: string | null;
    tags: string[] | null;
    image: string;
    is_latest: boolean;
    health_info: string[] | null;
    location: string | null;
    shelter_id: string | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

export interface PetInsert {
    id?: string;
    name: string;
    type: string;
    breed: string;
    age: string;
    gender: string;
    weight?: string | null;
    color?: string | null;
    distance?: string | null;
    description?: string | null;
    tags?: string[] | null;
    image: string;
    is_latest?: boolean;
    health_info?: string[] | null;
    location?: string | null;
    shelter_id?: string | null;
    is_available?: boolean;
}

export interface Shelter {
    id: string;
    name: string;
    owner: string;
    avatar: string | null;
    is_verified: boolean;
    location: string | null;
    created_at: string;
}

export interface AdoptionApplication {
    id: string;
    user_id: string;
    pet_id: string;
    applicant_name: string;
    phone: string;
    city: string | null;
    house_type: string | null;
    has_experience: boolean | null;
    has_children: boolean | null;
    has_allergies: boolean | null;
    agreed_to_terms: boolean;
    status: 'pending' | 'interviewing' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    join_date: string;
    pets_adopted_count: number;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    recipient_id: string;
    sender_name: string;
    sender_avatar: string | null;
    content: string;
    time: string | null;
    is_unread: boolean;
    type: 'system' | 'user';
    created_at: string;
}

// 带关联数据的申请类型
export interface ApplicationWithDetails extends AdoptionApplication {
    pets: Pet;
    users: User;
}

// 宠物类型枚举
export const PetTypes = {
    DOG: '狗狗',
    CAT: '猫咪',
    BIRD: '鸟类',
    RABBIT: '兔子',
} as const;

export type PetType = (typeof PetTypes)[keyof typeof PetTypes];
