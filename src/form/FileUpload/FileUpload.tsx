import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { TagsInput, type BaseTagItem } from '../TagsInput/TagsInput';
import { mergeRefs } from '../../utils/mergeRefs';
import { Size } from '../form.tokens';
import { Badge } from '../../Badge/Badge';
import { Close as CloseIcon, IconWrapper as IconWrapper, Upload as UploadIcon } from '../../Icon';
import { classPrefix } from '../../utils/classPrefix';
import { Card } from '../../Card';
// import { Close as CloseIcon } from '../../Icon';

type FileValidationResult = boolean | string;

type ValidateFile = (file: File) => FileValidationResult;

type FileKind =
    | 'image'
    | 'pdf'
    | 'document'
    | 'spreadsheet'
    | 'archive'
    | 'audio'
    | 'video'
    | 'generic';

type FileUploadTag = BaseTagItem & {
    previewUrl?: string;

    file: File;

    progress?: number;

    status?: 'idle' | 'uploading' | 'success' | 'error';
};

type FileUploadItem = {
    id: string;
    file: File;

    previewUrl?: string;

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

    maxFiles?: number;
    onMaxFilesExceeded?: (attempted: File[], current: FileUploadItem[]) => void;
    onMaxFilesReached?: (current: FileUploadItem[]) => void;
    showPreview?: boolean;

    validateFile?: ValidateFile;
    onFileReject?: (file: File, reason?: string) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    uploadIcon?: React.ReactNode;

    start?: React.ReactNode;
    actions?: React.ReactNode;

    layout?: 'stacked' | 'grid'; // 'compact' gallery masonry;

    size?: Size;
    loading?: boolean;
};

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const fileKindLabelMap: Record<FileKind, string> = {
    image: 'IMG',
    pdf: 'PDF',
    document: 'DOC',
    spreadsheet: 'XLS',
    archive: 'ZIP',
    audio: 'AUD',
    video: 'VID',
    generic: 'FILE',
};

const getFileKind = (file: File): FileKind => {
    const type = file.type.toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return 'image';

    if (type.includes('pdf') || ext === 'pdf') {
        return 'pdf';
    }

    if (type.includes('word') || ['doc', 'docx', 'rtf', 'txt'].includes(ext ?? '')) {
        return 'document';
    }

    if (type.includes('sheet') || ['xls', 'xlsx', 'csv'].includes(ext ?? '')) {
        return 'spreadsheet';
    }

    if (type.includes('zip') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext ?? '')) {
        return 'archive';
    }

    if (type.startsWith('audio/')) return 'audio';

    if (type.startsWith('video/')) return 'video';

    return 'generic';
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

            maxFiles,
            onMaxFilesExceeded,
            onMaxFilesReached,
            showPreview = false,

            validateFile,
            onFileReject,

            clearable = true,
            clearIcon,
            uploadIcon,

            start,
            actions,

            layout = 'stacked',

            size = 'md',
            loading = false,
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const dragCounterRef = useRef(0);
        const [isDragging, setIsDragging] = useState(false);

        const [maxExceeded, setMaxExceeded] = useState(false);
        const maxExceededTimeoutRef = useRef<number>();

        const isControlled = value !== undefined;

        const [filesState, setFilesState] = useState<FileUploadItem[]>(defaultValue);

        const files = isControlled ? value! : filesState;

        const isMaxReached = maxFiles != null && files.length >= maxFiles;

        // const setFiles = (next: FileUploadItem[]) => {
        //     if (!isControlled) {
        //         setFilesState(next);
        //     }
        //
        //     onChange?.(next);
        // };

        const setFiles = (
            next: FileUploadItem[] | ((prev: FileUploadItem[]) => FileUploadItem[]),
        ) => {
            if (isControlled) {
                const resolved = typeof next === 'function' ? next(files) : next;

                onChange?.(resolved);

                return;
            }

            setFilesState((prev) => {
                const resolved = typeof next === 'function' ? next(prev) : next;

                onChange?.(resolved);

                return resolved;
            });
        };

        const openFileDialog = () => {
            if (disabled || loading) return;

            if (isMaxReached) {
                onMaxFilesReached?.(files);
                return;
            }

            inputRef.current?.click();
        };

        const processFiles = (
            selected: File[],
            options?: {
                fromDrop?: boolean;
            },
        ) => {
            const validFiles: File[] = [];

            selected.forEach((file) => {
                const result = validateFile?.(file);

                const rejected = result === false || typeof result === 'string';

                if (rejected) {
                    onFileReject?.(file, typeof result === 'string' ? result : undefined);

                    return;
                }

                validFiles.push(file);
            });

            const selectedItems: FileUploadItem[] = validFiles.map((file) => ({
                id: crypto.randomUUID(),
                file,

                previewUrl:
                    showPreview && file.type.startsWith('image/')
                        ? URL.createObjectURL(file)
                        : undefined,

                progress: 0,
                status: 'idle',
            }));

            const merged = multiple
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

            const exceeded = maxFiles != null && merged.length > maxFiles;

            const shouldFlashExceeded = exceeded && !(options?.fromDrop && isMaxReached);

            if (shouldFlashExceeded) {
                setMaxExceeded(true);

                onMaxFilesExceeded?.(selected, files);

                window.clearTimeout(maxExceededTimeoutRef.current);

                maxExceededTimeoutRef.current = window.setTimeout(() => {
                    setMaxExceeded(false);
                }, 1200);
            }

            const next = maxFiles != null ? merged.slice(0, maxFiles) : merged;

            setFiles(next);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            processFiles(Array.from(e.target.files ?? []));

            // allow re-select same file
            e.target.value = '';
        };

        const handleDragEnter = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (disabled || loading) return;

            dragCounterRef.current += 1;
            setIsDragging(true);
        };

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (disabled || loading) return;

            dragCounterRef.current -= 1;

            if (dragCounterRef.current <= 0) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (disabled || loading) return;

            dragCounterRef.current = 0;
            setIsDragging(false);

            const dropped = Array.from(e.dataTransfer.files ?? []);

            if (!dropped.length) return;

            processFiles(dropped, { fromDrop: true });
        };

        const removeFile = (tag: FileUploadTag) => {
            setFiles((prev) => {
                const removed = prev.find((f) => f.id === tag.id);

                if (removed?.previewUrl) {
                    URL.revokeObjectURL(removed.previewUrl);
                }

                return prev.filter((f) => f.id !== tag.id);
            });
        };

        const clearFiles = () => {
            files.forEach((item) => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });

            setFiles([]);

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        };

        const tags = useMemo<FileUploadTag[]>(
            () =>
                files.map((item) => ({
                    id: item.id,
                    label:
                        item.status === 'uploading'
                            ? `${item.file.name} ${item.progress ?? 0}%`
                            : item.file.name,
                    value: item.file.name,

                    previewUrl: item.previewUrl,
                    file: item.file,
                    status: item.status,
                    progress: item.progress,
                })),
            [files],
        );

        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <CloseIcon />;

        const uploadButton = (
            <button
                type="button"
                disabled={disabled || loading}
                // onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                    if (disabled || loading) return;

                    e.stopPropagation();
                    openFileDialog();
                }}
                className={classPrefix('--upload-button')}
                data-disabled={disabled || loading || undefined}
            >
                {uploadIcon ?? <UploadIcon />}
            </button>
        );

        const clearButton =
            clearable && files.length > 0 ? (
                <button
                    type="button"
                    aria-label="Clear files"
                    // onMouseDown={(e) => e.preventDefault()}
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

                <TagsInput<FileUploadTag>
                    className={classPrefix('--file-upload')}
                    fullWidth
                    value={tags}
                    inputEnabled={false}
                    layout={layout === 'stacked' ? 'stacked' : undefined}
                    // editable={false}
                    disabled={disabled}
                    readOnly={loading}
                    start={start}
                    size={size}
                    inputMode="none"
                    placeholder={files.length ? '' : 'Choose files...'}
                    renderTag={({ tag, focused, remove, selected }) => {
                        const kind = getFileKind(tag.file);

                        return (
                            <Card
                                active={selected}
                                focused={focused}
                                // interactive
                                focusable
                                d="flex"
                                // d={layout === 'stacked' ? 'flex' : undefined}
                                // grid={layout === 'grid' ? true : undefined}
                                direction="row"
                                density="xs"
                                w="full"
                            >
                                {layout === 'stacked' && (
                                    <Card.Section w="full" d="flex" align="center" gap="sm">
                                        <Card.Section
                                            shrink={0}
                                            d="flex"
                                            align="center"
                                            justify="center"
                                            w={50}
                                        >
                                            {showPreview && tag.previewUrl ? (
                                                <Card.Media.Image
                                                    objFit="contain"
                                                    // h="full"
                                                    w={60}
                                                    src={tag.previewUrl}
                                                />
                                            ) : (
                                                <Badge intent="info">
                                                    {fileKindLabelMap[kind]}
                                                </Badge>
                                            )}
                                        </Card.Section>
                                        <Card.Section grow>
                                            <div className={classPrefix('--file-name')}>
                                                {tag.label}
                                            </div>
                                        </Card.Section>
                                        <Card.Section
                                            shrink={0}
                                            d="flex"
                                            align="center"
                                            justify="center"
                                            w={32}
                                        >
                                            <button
                                                onClick={remove}
                                                className={classPrefix('--clear-button')}
                                            >
                                                <CloseIcon />
                                            </button>
                                        </Card.Section>
                                    </Card.Section>
                                )}
                                {layout === 'grid' && (
                                    <Card.Section w="full" d="flex" align="center" gap="sm">
                                        <Card.Section
                                            shrink={0}
                                            d="flex"
                                            align="center"
                                            justify="center"
                                            w={50}
                                        >
                                            {showPreview && tag.previewUrl ? (
                                                <Card.Media.Image
                                                    objFit="contain"
                                                    // h="full"
                                                    w={60}
                                                    src={tag.previewUrl}
                                                />
                                            ) : (
                                                <Badge intent="info">
                                                    {fileKindLabelMap[kind]}
                                                </Badge>
                                            )}
                                        </Card.Section>
                                        <Card.Section grow>
                                            <div className={classPrefix('--file-name')}>
                                                {tag.label}
                                            </div>
                                        </Card.Section>
                                        <Card.Section
                                            shrink={0}
                                            d="flex"
                                            align="center"
                                            justify="center"
                                            w={32}
                                        >
                                            <button
                                                onClick={remove}
                                                className={classPrefix('--clear-button')}
                                            >
                                                <CloseIcon />
                                            </button>
                                        </Card.Section>
                                    </Card.Section>
                                )}
                            </Card>
                        );
                    }}
                    onTagRemove={(tag, index) => {
                        removeFile(tag);
                    }}
                    actions={
                        <>
                            {actions}
                            {uploadButton}
                            {clearButton}
                        </>
                    }
                    onClick={!files.length ? openFileDialog : undefined}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-not-empty={!!files.length || undefined}
                    data-loading={loading || undefined}
                    data-actions-vertical={files.length > 1 || undefined}
                    data-dragging={isDragging || undefined}
                    data-max-exceeded={maxExceeded || undefined}
                    data-drag-rejected={isDragging && isMaxReached ? true : undefined}
                />
            </>
        );
    },
);

FileUpload.displayName = 'FileUpload';
