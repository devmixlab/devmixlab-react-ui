import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { TagsInput } from '../TagsInput/TagsInput';
import { mergeRefs } from '../../utils/mergeRefs';
import { Size } from '../form.tokens';
import { Close, IconWrapper, Upload } from '../../Icon';
import { classPrefix } from '../../utils/classPrefix';

type FileUploadProps = {
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;

    value?: File[];
    defaultValue?: File[];
    onChange?: (files: File[]) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    uploadIcon?: React.ReactNode;

    start?: React.ReactNode;
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
            uploadIcon,

            start,
            actions,

            size = 'md',
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const isControlled = value !== undefined;

        const [filesState, setFilesState] = useState<File[]>(defaultValue);

        const files = isControlled ? value! : filesState;

        const setFiles = (next: File[]) => {
            if (!isControlled) {
                setFilesState(next);
            }

            onChange?.(next);
        };

        const openFileDialog = () => {
            if (!disabled) {
                inputRef.current?.click();
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selected = Array.from(e.target.files ?? []);

            const next = multiple ? [...files, ...selected] : selected;

            setFiles(next);

            // allow re-select same file
            e.target.value = '';
        };

        const removeFile = (index: number) => {
            const next = files.filter((_, i) => i !== index);
            setFiles(next);
        };

        const clearFiles = () => {
            setFiles([]);

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        };

        const tags = useMemo(
            () =>
                files.map((file) => ({
                    id: `${file.name}-${file.lastModified}`,
                    label: file.name,
                    value: file.name,
                })),
            [files],
        );

        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const uploadButton = (
            <button
                type="button"
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                }}
                className={classPrefix('--upload-button')}
            >
                {uploadIcon ?? <Upload />}
            </button>
        );

        const clearButton =
            clearable && files.length > 0 ? (
                <button
                    type="button"
                    aria-label="Clear files"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                        e.stopPropagation();
                        clearFiles();
                    }}
                    className={classPrefix('--clear-button')}
                >
                    {finalClearIcon}
                </button>
            ) : null;

        return (
            <>
                <input
                    hidden
                    ref={combinedRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    disabled={disabled}
                    onChange={handleChange}
                />

                <TagsInput
                    // className={classPrefix('--file-upload')}
                    value={tags}
                    inputEnabled={false}
                    editable={false}
                    disabled={disabled}
                    start={start}
                    size={size}
                    inputMode="none"
                    placeholder={files.length ? '' : 'Choose files...'}
                    onTagRemove={(_, index) => removeFile(index)}
                    actions={
                        <>
                            {actions}
                            {uploadButton}
                            {clearButton}
                        </>
                    }
                    onClick={openFileDialog}
                />
            </>
        );
    },
);

FileUpload.displayName = 'FileUpload';
