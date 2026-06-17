import React from 'react';
import { Icon } from './Icon';

export const Spreadsheet = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />

            <path d="M14 3v5h5" />

            <path d="M8 12h8" />
            <path d="M8 16h8" />

            <path d="M12 10v8" />
            <path d="M16 10v8" />
        </Icon>
    );
};
