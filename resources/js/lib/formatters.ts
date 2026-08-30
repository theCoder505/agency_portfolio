/**
 * Format utility for human-readable 'en-US' presentation across frontend.
 */

export interface CurrencyOption {
    code: 'BDT' | 'USD' | 'EUR';
    symbol: string;
    label: string;
    description: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
    { code: 'BDT', symbol: '৳', label: 'BDT (৳)', description: 'Bangladeshi Taka (Default)' },
    { code: 'USD', symbol: '$', label: 'USD ($)', description: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)', description: 'Euro' },
];

/**
 * Get visual currency symbol from currency code or symbol string.
 */
export function getCurrencySymbol(codeOrSymbol: string = 'BDT'): string {
    if (!codeOrSymbol) return '৳';
    const clean = codeOrSymbol.trim().toUpperCase();

    const map: Record<string, string> = {
        BDT: '৳',
        '৳': '৳',
        TK: '৳',
        TAKA: '৳',
        USD: '$',
        '$': '$',
        DOLLAR: '$',
        EUR: '€',
        '€': '€',
        EURO: '€',
        GBP: '£',
        '£': '£',
    };

    return map[clean] || map[codeOrSymbol.trim()] || codeOrSymbol || '৳';
}

/**
 * Format currency amount with en-US locale rules.
 * Examples:
 * formatCurrency(2999, 'BDT') -> "৳ 2,999"
 * formatCurrency(49.99, 'USD', 2) -> "$49.99"
 * formatCurrency(120, 'EUR') -> "€120"
 */
export function formatCurrency(
    amount: number | string | null | undefined,
    symbolOrCode: string = 'BDT',
    decimals: number = 0
): string {
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
    const symbol = getCurrencySymbol(symbolOrCode);

    if (isNaN(num)) return `${symbol}0`;

    const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);

    if (symbol === '$' || symbol === '€' || symbol === '£') {
        return `${symbol}${formattedNumber}`;
    }

    return `${symbol} ${formattedNumber}`;
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
