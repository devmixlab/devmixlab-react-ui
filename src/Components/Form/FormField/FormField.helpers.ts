import { classPrefix } from '../../../utils/classPrefix';

export const prefix = (name: string = '') => {
    return classPrefix(`--form-field${name}`);
};
