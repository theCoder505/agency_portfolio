import { LucideIcon } from 'lucide-react';

export interface Admin {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Auth {
    user: User | null;
    admin: Admin | null;
}

export interface AppSettings {
    brand_name?: string;
    tagline?: string;
    logo?: string;
    logo_dark?: string;
    favicon?: string;
    footer_text?: string;
    copyright_text?: string;
    contact_email?: string;
    contact_phone?: string;
    address_line1?: string;
    address_line2?: string;
    google_map_embed_url?: string;
    whatsapp_number?: string;
    whatsapp_message_prompt?: string;
    whatsapp_enabled?: string | boolean;
    social_facebook?: string;
    social_twitter?: string;
    social_linkedin?: string;
    social_github?: string;
    social_instagram?: string;
    social_youtube?: string;
    trustpilot_enabled?: string | boolean;
    trustpilot_url?: string;
    trustpilot_score?: string;
    trustpilot_reviews_count?: string;
    featured_youtube_video?: string;
    terms_and_conditions?: string;
    privacy_policy?: string;
    [key: string]: string | undefined | boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    order: number;
    is_active: boolean;
    portfolios_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Portfolio {
    id: number;
    category_id?: number | null;
    category?: Category | null;
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    thumbnail?: string | null;
    gallery_images?: string[] | null;
    item_type: 'direct_link' | 'in_app_link';
    direct_url?: string | null;
    youtube_video_url?: string | null;
    client_name?: string | null;
    completion_date?: string | null;
    tech_stacks?: string[] | null;
    views_count: number;
    is_featured: boolean;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    service_interested?: string | null;
    subject: string;
    message: string;
    ip_address?: string | null;
    user_agent?: string | null;
    is_read: boolean;
    replied_at?: string | null;
    reply_subject?: string | null;
    reply_message?: string | null;
    created_at: string;
    updated_at?: string;
}

export interface VisitorLog {
    id: number;
    ip_address?: string | null;
    url?: string | null;
    method: string;
    user_agent?: string | null;
    device_type: string;
    browser: string;
    platform: string;
    referer?: string | null;
    portfolio_id?: number | null;
    portfolio?: Portfolio | null;
    created_at: string;
}

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    bio?: string | null;
    avatar?: string | null;
    social_linkedin?: string | null;
    social_github?: string | null;
    social_twitter?: string | null;
    order: number;
    is_active: boolean;
    created_at?: string;
}

export interface Review {
    id: number;
    author_name: string;
    author_avatar?: string | null;
    author_role?: string | null;
    company?: string | null;
    rating: number;
    review_title: string;
    review_text: string;
    source: 'trustpilot' | 'clutch' | 'direct';
    review_date?: string | null;
    verified_purchase: boolean;
    is_featured: boolean;
    created_at?: string;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
}

export interface SharedData {
    name: string;
    app_settings: AppSettings;
    auth: Auth;
    flash: FlashMessages;
    [key: string]: unknown;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
