import React, { forwardRef, useMemo, useRef, useState } from 'react';
import {
    TagsInput,
    type BaseTagItem,
    type TagsInputProps,
    type Layout as TagsInputLayout,
} from '../TagsInput/TagsInput';
import { mergeRefs } from '../../../utils/mergeRefs';
import { Size } from '../form.tokens';
import { Badge } from '../../Badge/Badge';
import {
    Close as CloseIcon,
    IconWrapper as IconWrapper,
    Upload as UploadIcon,
} from '../../../Icon';
import { classPrefix } from '../../../utils/classPrefix';
import { Card } from '../../Card';
import { Box, BoxProps } from '../../Box/Box';

type FileValidationResult = boolean | string;

type ValidateFile = (file: File) => FileValidationResult;

export type Layout = 'inline' | 'stacked' | 'grid' | 'compact' | 'gallery' | 'masonry';

type Status = 'idle' | 'uploading' | 'success' | 'error';

export type FileUploadTrigger = 'button' | 'tile' | 'both';

type FileKind =
    | 'image'
    | 'pdf'
    | 'document'
    | 'spreadsheet'
    | 'archive'
    | 'audio'
    | 'video'
    | 'generic';

type UploadPseudoTag = BaseTagItem & {
    __upload__: true;
};

type FileUploadTag = BaseTagItem & {
    previewUrl?: string;

    file: File;

    progress?: number;

    status?: Status;
};

type RenderableTag = FileUploadTag | UploadPseudoTag;

type FileUploadItem = {
    id: string;
    file: File;

    previewUrl?: string;

    progress?: number;

    status?: Status;
};

type FileUploadProps = {
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;

    value?: FileUploadItem[];
    defaultValue?: FileUploadItem[];
    onChange?: (files: FileUploadItem[]) => void;

    uploadTrigger?: FileUploadTrigger;
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

    layout?: Layout;
    gridCol?: BoxProps['col'];

    size?: Size;
    loading?: boolean;

    rounded?: TagsInputProps['rounded'];
    itemRounded?: TagsInputProps['rounded'];
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

const tagsInputLayoutMap = {
    compact: 'inline',
    inline: 'inline',
    stacked: 'stacked',
    grid: 'grid',
    gallery: 'grid',
    masonry: 'grid',
} satisfies Record<string, TagsInputLayout>;

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    (
        {
            multiple,
            accept,
            disabled,

            value,
            defaultValue = [],
            onChange,

            uploadTrigger,
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
            gridCol = { base: 12, md: 6, lg: 4 },

            size = 'md',
            loading = false,

            rounded,
            itemRounded,
        },
        ref,
    ) => {
        const tagsInputLayout = tagsInputLayoutMap[layout];

        const defaultUploadTrigger =
            layout === 'grid' || layout === 'gallery' || layout === 'masonry' ? 'tile' : 'button';
        const resolvedUploadTrigger = uploadTrigger ?? defaultUploadTrigger;

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

        const tags = useMemo<RenderableTag[]>(() => {
            const mapped: RenderableTag[] = files.map((item) => ({
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
            }));

            const useUploadTile =
                resolvedUploadTrigger === 'tile' || resolvedUploadTrigger === 'both';

            if (useUploadTile && !disabled && !loading && !isMaxReached) {
                mapped.push({
                    id: '__upload__',
                    value: '__upload__',
                    label: 'Upload',
                    __upload__: true,
                });
            }

            return mapped;
        }, [files, layout, disabled, loading, isMaxReached, resolvedUploadTrigger]);

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

                <TagsInput<RenderableTag>
                    rounded={rounded ?? size ?? 'md'}
                    className={classPrefix('--file-upload')}
                    fullWidth={tagsInputLayout === 'grid' ? undefined : true}
                    gridCol={gridCol}
                    value={tags}
                    inputEnabled={false}
                    layout={tagsInputLayout}
                    // editable={false}
                    disabled={disabled}
                    readOnly={loading}
                    start={start}
                    size={size}
                    inputMode="none"
                    placeholder={files.length ? '' : 'Choose files...'}
                    renderTag={({ tag, focused, remove, selected }) => {
                        if ('__upload__' in tag) {
                            return (
                                <Card
                                    // active={selected}
                                    focused={focused}
                                    rounded={itemRounded ?? size ?? 'md'}
                                    focusable
                                    d="flex"
                                    direction="row"
                                    density="xs"
                                    w="full"
                                    onClick={openFileDialog}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            openFileDialog();
                                        }
                                    }}
                                    cursor="pointer"
                                    className={classPrefix('--upload-card')}
                                >
                                    <Card.Section
                                        w="full"
                                        d="flex"
                                        align="center"
                                        justify="center"
                                        gap="sm"
                                        px={size}
                                    >
                                        <Box
                                            size="1.2em"
                                            className={classPrefix('--upload-card__icon')}
                                        >
                                            {uploadIcon ?? <UploadIcon />}
                                        </Box>
                                        Add more ...
                                    </Card.Section>
                                </Card>
                            );
                        }

                        const kind = getFileKind(tag.file);

                        return (
                            <Card
                                active={selected}
                                focused={focused}
                                rounded={itemRounded ?? size ?? 'md'}
                                // interactive
                                focusable
                                d="flex"
                                direction="row"
                                density="xs"
                                w="full"
                                // pos="relative"
                            >
                                {layout === 'gallery' && (
                                    <Card.Section
                                        w="full"
                                        d="flex"
                                        direction="column"
                                        justify="center"
                                        align="center"
                                        gap="sm"
                                        pos="relative"
                                    >
                                        {showPreview && tag.previewUrl ? (
                                            <Box h="100%">
                                                <Card.Media.Image
                                                    src={tag.previewUrl}
                                                    objFit="contain"
                                                    h="100%"
                                                />
                                            </Box>
                                        ) : (
                                            <>
                                                <Card.Section
                                                    w="full"
                                                    d="flex"
                                                    align="center"
                                                    justify="center"
                                                    gap="sm"
                                                >
                                                    <Card.Media.Icon size="xl">
                                                        {fileKindLabelMap[kind]}
                                                    </Card.Media.Icon>
                                                </Card.Section>
                                                <Card.Section ta="center" w="100%">
                                                    <div className={classPrefix('--file-name')}>
                                                        {tag.label}
                                                    </div>
                                                </Card.Section>
                                            </>
                                        )}
                                        <Box
                                            as="button"
                                            onClick={remove}
                                            className={classPrefix('--clear-button')}
                                        >
                                            <CloseIcon />
                                        </Box>
                                    </Card.Section>
                                )}
                                {(layout === 'inline' ||
                                    layout === 'stacked' ||
                                    layout === 'grid') && (
                                    <Card.Section w="full" d="flex" align="center" gap="sm">
                                        <Card.Section
                                            shrink={0}
                                            d="flex"
                                            align="center"
                                            justify="center"
                                            // h={30}
                                            density="none"
                                        >
                                            <div className={classPrefix('--info-wrapper')}>
                                                {showPreview && tag.previewUrl ? (
                                                    <Card.Media.Image
                                                        className={classPrefix('--file-preview')}
                                                        src={tag.previewUrl}
                                                    />
                                                ) : (
                                                    <Badge size={size} intent="info">
                                                        {fileKindLabelMap[kind]}
                                                    </Badge>
                                                )}
                                            </div>
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
                        if ('__upload__' in tag) return;
                        removeFile(tag);
                    }}
                    actions={
                        <>
                            {actions}
                            {(resolvedUploadTrigger === 'button' ||
                                resolvedUploadTrigger === 'both') &&
                                uploadButton}
                            {clearButton}
                        </>
                    }
                    onClick={
                        !files.length && resolvedUploadTrigger === 'button'
                            ? openFileDialog
                            : undefined
                    }
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
                    data-file-upload-layout={layout}
                    data-upload-trigger={resolvedUploadTrigger}
                />
            </>
        );
    },
);

FileUpload.displayName = 'FileUpload';
