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
    phone?: string | null;
    whatsapp_number?: string | null;
    company_name?: string | null;
    address?: string | null;
    avatar?: string | null;
    status: 'active' | 'suspended';
    admin_notes?: string | null;
    email_verified_at: string | null;
    subscriptions_count?: number;
    invoices_count?: number;
    subscriptions?: SaasSubscription[];
    invoices?: SubscriptionInvoice[];
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
    currency_symbol?: string;
    currency_code?: string;
    bkash_number?: string;
    bkash_instructions?: string;
    bkash_enabled?: string | boolean;
    nagad_number?: string;
    nagad_instructions?: string;
    nagad_enabled?: string | boolean;
    terms_and_conditions?: string;
    privacy_policy?: string;
    faqs_json?: string;
    [key: string]: string | undefined | boolean;
}

export interface FAQItem {
    id?: string | number;
    q: string;
    a: string;
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

export interface Blog {
    id: number;
    category_id?: number | null;
    category?: Category | null;
    title: string;
    slug: string;
    short_description?: string | null;
    content?: string | null;
    thumbnail?: string | null;
    author_name?: string | null;
    author_role?: string | null;
    author_avatar?: string | null;
    tags?: string[] | null;
    reads_count: number;
    is_featured: boolean;
    is_published: boolean;
    published_at?: string | null;
    order: number;
    created_at: string;
    updated_at?: string;
}

export interface SaasPackageTier {
    name: string;
    tagline?: string;
    monthly_price: number;
    yearly_price: number;
    badge?: string;
    is_popular?: boolean;
    features: string[];
}

export interface SaasPackages {
    basic: SaasPackageTier;
    standard: SaasPackageTier;
    premium: SaasPackageTier;
    [key: string]: SaasPackageTier | undefined;
}

export interface SaasProduct {
    id: number;
    name: string;
    slug: string;
    primary_domain?: string | null;
    tagline?: string | null;
    description?: string | null;
    icon?: string | null;
    badge?: string | null;
    thumbnail?: string | null;
    gallery_images?: string[] | null;
    packages?: SaasPackages | null;
    monthly_price: number;
    half_yearly_price: number;
    yearly_price: number;
    currency?: string | null;
    has_monthly: boolean;
    has_half_yearly: boolean;
    has_yearly: boolean;
    features: string[] | null;
    order: number;
    is_featured: boolean;
    is_active: boolean;
    subscriptions_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface SaasSubscription {
    id: number;
    order_number: string;
    user_id: number;
    user?: User | null;
    saas_product_id: number;
    product?: SaasProduct | null;
    package_tier?: 'basic' | 'standard' | 'premium' | string | null;
    billing_cycle: 'monthly' | 'half_yearly' | 'yearly';
    amount: number;
    currency: string;
    status: 'pending' | 'active' | 'expired' | 'rejected' | 'cancelled';
    payment_method: string;
    sender_number?: string | null;
    client_whatsapp?: string | null;
    client_email?: string | null;
    transaction_id?: string | null;
    payment_notes?: string | null;
    requested_domain?: string | null;
    requested_subdomain?: string | null;
    domain?: string | null;
    subdomain?: string | null;
    admin_notes?: string | null;
    starts_at?: string | null;
    expires_at?: string | null;
    approved_at?: string | null;
    approved_by?: number | null;
    approver?: Admin | null;
    rejection_reason?: string | null;
    last_renewed_at?: string | null;
    days_remaining: number;
    is_active_now: boolean;
    is_expired_now: boolean;
    status_badge: {
        label: string;
        color: string;
    };
    has_pending_invoice?: boolean;
    pending_invoices_count?: number;
    pending_invoice?: SubscriptionInvoice | null;
    invoices?: SubscriptionInvoice[];
    created_at: string;
    updated_at?: string;
}

export interface SubscriptionInvoice {
    id: number;
    invoice_number: string;
    subscription_id: number;
    subscription?: SaasSubscription | null;
    user_id: number;
    user?: User | null;
    billing_cycle: 'monthly' | 'half_yearly' | 'yearly';
    amount: number;
    currency: string;
    payment_method: string;
    sender_number?: string | null;
    transaction_id?: string | null;
    type: 'initial' | 'renewal' | 'package_change';
    status: 'pending' | 'paid' | 'rejected';
    period_start?: string | null;
    period_end?: string | null;
    paid_at?: string | null;
    notes?: string | null;
    rejection_reason?: string | null;
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
    user_id?: number | null;
    custom_order_id?: number | null;
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

export interface CustomOrderAttachment {
    name: string;
    path: string;
    size?: number;
    extension?: string;
}

export interface CustomOrderMilestone {
    id: number;
    custom_order_id: number;
    order: number;
    title: string;
    description?: string | null;
    amount: number;
    due_date?: string | null;
    payment_status: 'waiting-client-to-pay' | 'paid-and-bank-processing' | 'collected' | 'refunded';
    payment_method?: string | null;
    payment_details?: string | null;
    payment_instructions?: string | null;
    client_payment_method?: string | null;
    client_trx_id?: string | null;
    client_sender_info?: string | null;
    client_payment_proof?: string | null;
    client_payment_notes?: string | null;
    client_paid_at?: string | null;
    collected_at?: string | null;
    refund_amount?: number | null;
    refund_trx_id?: string | null;
    refund_reason?: string | null;
    refunded_at?: string | null;
    github_repo_url?: string | null;
    drive_link?: string | null;
    live_demo_url?: string | null;
    deliverable_notes?: string | null;
    is_deliverable_unlocked?: boolean;
    status_badge?: {
        label: string;
        short_label: string;
        color: string;
        code: string;
    };
    has_deliverables?: boolean;
    is_late?: boolean;
    days_overdue?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CustomOrder {
    id: number;
    order_number: string;
    user_id: number;
    user?: User | null;
    title: string;
    category?: string | null;
    estimated_budget?: number | null;
    agreed_price?: number | null;
    proposed_budget?: number | null;
    proposed_currency?: string | null;
    proposed_budget_notes?: string | null;
    proposed_budget_at?: string | null;
    budget_update_status?: 'none' | 'pending' | 'approved' | 'rejected';
    currency: string;
    client_whatsapp?: string | null;
    client_email?: string | null;
    target_deadline?: string | null;
    requirements: string;
    reference_links?: string | null;
    attachments?: CustomOrderAttachment[] | null;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'denied' | 'cancelled';
    admin_notes?: string | null;
    rejection_reason?: string | null;
    github_repo_url?: string | null;
    drive_link?: string | null;
    live_demo_url?: string | null;
    accepted_at?: string | null;
    completed_at?: string | null;
    milestones?: CustomOrderMilestone[];
    review?: Review | null;
    total_milestones_amount?: number;
    total_active_milestones_amount?: number;
    unallocated_milestone_amount?: number;
    total_collected_amount?: number;
    total_processing_amount?: number;
    total_pending_amount?: number;
    total_refunded_amount?: number;
    remaining_balance?: number;
    progress_percentage?: number;
    is_late?: boolean;
    days_overdue?: number;
    late_milestones_count?: number;
    has_pending_budget_request?: boolean;
    is_fully_paid?: boolean;
    status_badge?: {
        label: string;
        color: string;
        description: string;
    };
    slug?: string;
    customer_show_url?: string;
    admin_show_url?: string;
    created_at: string;
    updated_at?: string;
}

export interface SharedData {
    name: string;
    app_settings: AppSettings;
    auth: Auth;
    pending_subscriptions_count?: number;
    pending_custom_orders_count?: number;
    customer_active_subscriptions_count?: number;
    customer_custom_orders_count?: number;
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
