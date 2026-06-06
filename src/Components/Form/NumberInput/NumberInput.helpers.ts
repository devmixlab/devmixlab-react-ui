import Decimal from 'decimal.js';

export const isAtBound = (value: Decimal, bound: number | undefined, cmp: 'lte' | 'gte') => {
    if (bound === undefined) return false;
    return value[cmp](bound);
};

export const toDecimal = (val: number | string | undefined) => {
    if (val === '' || val === '-' || val === '.' || val === '-.') {
        return null;
    }

    try {
        return new Decimal(val ?? 0);
    } catch {
        return null;
    }
};

export const snapToStep = (value: Decimal, step: number) => {
    const s = new Decimal(step);

    return value.div(s).round().mul(s);
};

export const toNumber = (val: number | string | undefined) => {
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) ? n : null;
};

export const formatWithSeparator = (val: string) => {
    if (!val) return val;

    const [int, dec] = val.split('.');

    const formattedInt = int
        .replace('-', '') // handle negative separately
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const sign = int.startsWith('-') ? '-' : '';

    return dec != null ? `${sign}${formattedInt}.${dec}` : `${sign}${formattedInt}`;
};

export const formatDisplay = (d: Decimal, fixed?: number, thousandSeparator?: boolean) => {
    let str = fixed != null ? d.toFixed(fixed) : d.toString();

    if (thousandSeparator) {
        str = formatWithSeparator(str);
    }

    return str;
};

export const sanitizeInput = (val: string) => {
    if (!val) return val;

    return (
        val
            // remove group separators (IMPORTANT: add comma)
            .replace(/[,\s_]/g, '') // ✅ comma added
            // remove currency symbols
            .replace(/[$€£¥]/g, '')
    );
};

export const countDigits = (str: string) => {
    return str.replace(/\D/g, '').length;
};

export const findCursorFromDigits = (formatted: string, digitIndex: number) => {
    let count = 0;

    for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
            count++;
        }

        if (count >= digitIndex) {
            return i + 1;
        }
    }

    return formatted.length;
};
