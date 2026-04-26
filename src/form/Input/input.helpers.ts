import { CLASS_PREFIX } from '../../constants';

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--input${name}`;
};
