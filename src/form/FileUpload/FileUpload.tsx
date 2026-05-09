import React, { forwardRef, useRef, useState } from 'react';
import { FieldRoot } from '../FieldRoot/FieldRoot';
import { Box } from '../../Box/Box';
import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';
import clsx from 'clsx';

type FileUploadProps = {
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;

    value?: File[];
    defaultValue?: File[];
    onChange?: (files: File[]) => void;

    clearable?: boolean;

    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode;
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

            start,
            end,
            actions,
        },
        ref,
    ) => {
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

        const cl = clsx(classPrefix('--file-upload'), {
            [classPrefix('--has-value')]: hasFiles,
        });

        return (
            <FieldRoot
                className={cl}
                disabled={disabled}
                start={start}
                end={end}
                actions={
                    <>
                        {actions}
                        {clearable && hasFiles && (
                            <button type="button" onClick={clearFiles}>
                                Clear
                            </button>
                        )}
                    </>
                }
                onClick={openFileDialog}
            >
                {/* Hidden native input */}
                <input
                    ref={combinedRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    disabled={disabled}
                    onChange={handleChange}
                    style={{ display: 'none' }}
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
