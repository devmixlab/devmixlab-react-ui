import React, { forwardRef, useRef, useState } from 'react';
import { FieldRoot } from '../FieldRoot/FieldRoot';
import { Box } from '../../Box/Box';
import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';
import clsx from 'clsx';
import { Size } from '../form.tokens';
import { Close, IconWrapper } from '../../Icon';

type FileUploadProps = {
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;

    value?: File[];
    defaultValue?: File[];
    onChange?: (files: File[]) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;

    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode;

    size?: Size;
};

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    (
        {
            multiple,
            accept,
            disabled,

            value,
            defaultValue = [],
            onChange,

            clearable = true,
            clearIcon,

            start,
            end,
            actions,

            size = 'md',
        },
        ref,
    ) => {
        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const isControlled = value !== undefined;
        const [filesState, setFilesState] = useState<File[]>(defaultValue);

        const files = isControlled ? value! : filesState;
        const hasFiles = files.length > 0;

        const openFileDialog = () => {
            if (!disabled) {
                inputRef.current?.click();
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selected = Array.from(e.target.files ?? []);

            if (!isControlled) {
                setFilesState(selected);
            }

            onChange?.(selected);
        };

        const clearFiles = () => {
            if (!isControlled) {
                setFilesState([]);
            }

            if (inputRef.current) {
                inputRef.current.value = '';
            }

            onChange?.([]);
        };

        // const cl = clsx(classPrefix('--file-upload'), {
        //     [classPrefix('--has-value')]: hasFiles,
        // });

        const clearButton = (
            <button
                type="button"
                aria-label="Clear input"
                onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={classPrefix(`--clear-button`)}
            >
                {finalClearIcon}
            </button>
        );

        const hasActions = Boolean(actions || (clearable && hasFiles));

        const finalActions = hasActions ? (
            <>
                {actions}
                {clearable && hasFiles && clearButton}
            </>
        ) : undefined;

        return (
            <FieldRoot
                className={classPrefix('--file-upload')}
                disabled={disabled}
                start={start}
                end={end}
                size={size}
                actions={finalActions}
                onClick={openFileDialog}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openFileDialog();
                    }
                }}
                data-has-value={hasFiles || undefined}
            >
                {/* Hidden native input */}
                <input
                    className={classPrefix('--input-file')}
                    ref={combinedRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    disabled={disabled}
                    onChange={handleChange}
                />

                {/* Visible UI */}
                <Box as="div" className={classPrefix('--value')}>
                    {hasFiles ? files.map((f) => f.name).join(', ') : 'Choose file...'}
                </Box>
            </FieldRoot>
        );
    },
);

FileUpload.displayName = 'FileUpload';
