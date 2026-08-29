/**
 * Format utility for human-readable 'en-US' presentation across frontend.
 */

/**
 * Format currency amount with en-US locale rules.
 * Examples:
 * formatCurrency(2999, '৳') -> "৳ 2,999"
 * formatCurrency(49.99, '$', 2) -> "$49.99"
 */
export function formatCurrency(
    amount: number | string | null | undefined,
    symbolOrCode: string = '৳',
    decimals: number = 0
): string {
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
    if (isNaN(num)) return `${symbolOrCode}0`;

    const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);

    if (symbolOrCode === '$' || symbolOrCode === '€' || symbolOrCode === '£') {
        return `${symbolOrCode}${formattedNumber}`;
    }

    return `${symbolOrCode}${formattedNumber}`;
}

/**
 * Format standard number in en-US (e.g. 10000 -> "10,000")
 */
export function formatNumberEnUs(value: number | string | null | undefined): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value || 0));
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format date into human-readable en-US format (e.g. "Aug 28, 2026")
 */
export function formatDateEnUs(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
}

/**
 * Format date with time into en-US format (e.g. "Aug 28, 2026 at 10:15 PM")
 */
export function formatDateTimeEnUs(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(d);
}
