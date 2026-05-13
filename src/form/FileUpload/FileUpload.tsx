import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { TagsInput } from '../TagsInput/TagsInput';
import { mergeRefs } from '../../utils/mergeRefs';
import { Size } from '../form.tokens';
import { Close, IconWrapper, Upload } from '../../Icon';
import { classPrefix } from '../../utils/classPrefix';

type FileUploadItem = {
    id: string;
    file: File;

    progress?: number;

    status?: 'idle' | 'uploading' | 'success' | 'error';
};

type FileUploadProps = {
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;

    value?: FileUploadItem[];
    defaultValue?: FileUploadItem[];
    onChange?: (files: FileUploadItem[]) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    uploadIcon?: React.ReactNode;

    start?: React.ReactNode;
    actions?: React.ReactNode;

    size?: Size;
    loading?: boolean;
};

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

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
            loading = false,
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const isControlled = value !== undefined;

        const [filesState, setFilesState] = useState<FileUploadItem[]>(defaultValue);

        const files = isControlled ? value! : filesState;

        const setFiles = (next: FileUploadItem[]) => {
            if (!isControlled) {
                setFilesState(next);
            }

            onChange?.(next);
        };

        const openFileDialog = () => {
            if (!disabled && !loading) {
                inputRef.current?.click();
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selected = Array.from(e.target.files ?? []);

            const selectedItems: FileUploadItem[] = selected.map((file) => ({
                id: crypto.randomUUID(),
                file,
                progress: 0,
                status: 'idle',
            }));

            const next = multiple
                ? [
                      ...files,
                      ...selectedItems.filter(
                          (item) =>
                              !files.some(
                                  (existing) => getFileKey(existing.file) === getFileKey(item.file),
                              ),
                      ),
                  ]
                : selectedItems;

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

        // const tags = useMemo(
        //     () =>
        //         files.map((file) => ({
        //             id: getFileKey(file),
        //             label: file.name,
        //             value: file.name,
        //         })),
        //     [files],
        // );

        const tags = useMemo(
            () =>
                files.map((item) => ({
                    id: item.id,
                    label:
                        item.status === 'uploading'
                            ? `${item.file.name} ${item.progress ?? 0}%`
                            : item.file.name,
                    value: item.file.name,
                })),
            [files],
        );

        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const uploadButton = (
            <button
                type="button"
                disabled={disabled || loading}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                    if (disabled || loading) return;

                    e.stopPropagation();
                    openFileDialog();
                }}
                className={classPrefix('--upload-button')}
                data-disabled={disabled || loading || undefined}
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
                        if (disabled || loading) return;

                        e.stopPropagation();
                        clearFiles();
                    }}
                    className={classPrefix('--clear-button')}
                    disabled={disabled || loading}
                    data-disabled={disabled || loading || undefined}
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
                    disabled={disabled || loading}
                    onChange={handleChange}
                />

                <TagsInput
                    className={classPrefix('--file-upload')}
                    // fullWidth
                    value={tags}
                    inputEnabled={false}
                    // editable={false}
                    disabled={disabled}
                    readOnly={loading}
                    start={start}
                    size={size}
                    inputMode="none"
                    placeholder={files.length ? '' : 'Choose files...'}
                    onTagRemove={(_, index) => {
                        removeFile(index);
                    }}
                    actions={
                        <>
                            {actions}
                            {uploadButton}
                            {clearButton}
                        </>
                    }
                    onClick={!files.length ? openFileDialog : undefined}
                    data-not-empty={!!files.length || undefined}
                    data-loading={loading || undefined}
                />
            </>
        );
    },
);

FileUpload.displayName = 'FileUpload';
