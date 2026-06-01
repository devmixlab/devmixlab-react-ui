import { CLASS_PREFIX } from '../constants';

export const isLongNumber = (value?: number, length = 2) => {
    // if (value === undefined || isNaN(value)) return false;
    // return value.toString().length > length; // true if 3 or more digits

    if (value === undefined || value === null) return false;

    // Convert to string for length check
    const str = value.toString();

    // Check if it contains only digits
    if (!/^\d+$/.test(str)) return false;

    // Return true if length exceeds threshold
    return str.length > length;
};

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--button${name}`;
};
