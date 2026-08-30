import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function getCustomOrderUrl(
    order: { id: number; order_number?: string; title?: string; slug?: string; customer_show_url?: string; admin_show_url?: string },
    prefix: 'customer' | 'admin' = 'customer'
): string {
    if (prefix === 'customer' && order.customer_show_url) {
        return order.customer_show_url;
    }
    if (prefix === 'admin' && order.admin_show_url) {
        return order.admin_show_url;
    }
    const ref = order.order_number || order.id;
    const titleSlug = order.slug || slugify(order.title || 'custom-order') || 'order';
    return `/${prefix}/custom-orders/${ref}/${titleSlug}`;
}
