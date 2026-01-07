/**
 * Supabase 数据库类型定义
 * 用于提供类型安全的数据库操作
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    avatar: string | null;
                    join_date: string;
                    pets_adopted_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    avatar?: string | null;
                    join_date?: string;
                    pets_adopted_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    avatar?: string | null;
                    join_date?: string;
                    pets_adopted_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            shelters: {
                Row: {
                    id: string;
                    name: string;
                    owner: string;
                    avatar: string | null;
                    is_verified: boolean;
                    location: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    owner: string;
                    avatar?: string | null;
                    is_verified?: boolean;
                    location?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    owner?: string;
                    avatar?: string | null;
                    is_verified?: boolean;
                    location?: string | null;
                    created_at?: string;
                };
            };
            pets: {
                Row: {
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
                };
                Insert: {
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
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    type?: string;
                    breed?: string;
                    age?: string;
                    gender?: string;
                    weight?: string | null;
                    color?: string | null;
                    distance?: string | null;
                    description?: string | null;
                    tags?: string[] | null;
                    image?: string;
                    is_latest?: boolean;
                    health_info?: string[] | null;
                    location?: string | null;
                    shelter_id?: string | null;
                    is_available?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            adoption_applications: {
                Row: {
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
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    pet_id: string;
                    applicant_name: string;
                    phone: string;
                    city?: string | null;
                    house_type?: string | null;
                    has_experience?: boolean | null;
                    has_children?: boolean | null;
                    has_allergies?: boolean | null;
                    agreed_to_terms?: boolean;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    pet_id?: string;
                    applicant_name?: string;
                    phone?: string;
                    city?: string | null;
                    house_type?: string | null;
                    has_experience?: boolean | null;
                    has_children?: boolean | null;
                    has_allergies?: boolean | null;
                    agreed_to_terms?: boolean;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    recipient_id: string;
                    sender_name: string;
                    sender_avatar: string | null;
                    content: string;
                    time: string | null;
                    is_unread: boolean;
                    type: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    recipient_id: string;
                    sender_name: string;
                    sender_avatar?: string | null;
                    content: string;
                    time?: string | null;
                    is_unread?: boolean;
                    type?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    recipient_id?: string;
                    sender_name?: string;
                    sender_avatar?: string | null;
                    content?: string;
                    time?: string | null;
                    is_unread?: boolean;
                    type?: string;
                    created_at?: string;
                };
            };
            favorites: {
                Row: {
                    id: string;
                    user_id: string;
                    pet_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    pet_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    pet_id?: string;
                    created_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// 便捷类型别名
export type User = Database['public']['Tables']['users']['Row'];
export type Shelter = Database['public']['Tables']['shelters']['Row'];
export type Pet = Database['public']['Tables']['pets']['Row'];
export type AdoptionApplication = Database['public']['Tables']['adoption_applications']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
