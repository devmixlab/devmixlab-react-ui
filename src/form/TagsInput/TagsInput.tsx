/**
 * @see tagsInputDocumentation.md
 */
import React, { forwardRef, useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { type TextInputProps } from '../TextInput/TextInput';
import { FieldRoot } from '../FieldRoot/FieldRoot';
// import { prefix } from '../Input/input.helpers';
import clsx from 'clsx';
import { Chip } from '../../Chip/Chip';
import { mergeRefs } from '../../utils/mergeRefs';
import type { BoxProps } from '../../Box/Box';
// import { Size, Variant } from '../Input/input.tokens';
import { Size } from '../form.tokens';
import { Variant } from '../FieldRoot/FieldRoot';
import { Close } from '../../Icon/Close';
import { IconWrapper } from '../../Icon';
import { classPrefix } from '../../utils/classPrefix';

export type BaseTagItem = {
    id?: string | number;
    label: string;
    value: string;
    disabled?: boolean;
};

type RenderTagParams<TTag extends BaseTagItem> = {
    tag: TTag;
    index: number;
    remove: () => void;
    disabled?: boolean;
    selected?: boolean;
    focused?: boolean;
};

export const slugify = (str: string) =>
    str
        .toLowerCase()
        .trim()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^\w\s-]/g, '') // remove symbols
        .replace(/\s+/g, '-') // spaces → dash
        .replace(/-+/g, '-');

export type TagsInputProps<TTag extends BaseTagItem = BaseTagItem> = Omit<
    TextInputProps,
    'value' | 'defaultValue' | 'onChange'
> & {
    value?: TTag[];
    defaultValue?: TTag[];
    onValueChange?: (tags: TTag[]) => void;

    inputEnabled?: boolean;
    placeholder?: string;
    fullWidth?: boolean;

    editable?: boolean | ((tag: TTag, index: number) => boolean);
    removable?: boolean | ((tag: TTag, index: number) => boolean);

    normalizeTag?: (label: string) => string;
    renderTag?: (params: RenderTagParams<TTag>) => React.ReactNode;

    layout?: 'inline' | 'stacked';

    invalid?: boolean;
    readOnly?: boolean;
    rounded?: BoxProps['rounded'];
    variant?: Variant;
    size?: Size;
    start?: React.ReactNode;
    actions?: React.ReactNode; // 👈 NEW
    unique?: boolean;
    onDuplicate?: (tag: TTag, existing: TTag) => void;

    onTagAdd?: (tag: TTag) => void;
    onTagRemove?: (tag: TTag, index: number) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClearAll?: (tags: TTag[]) => boolean | void | Promise<boolean | void>;

    separator?: RegExp; // default: /[,\n]/
    maxTags?: number;
    maxLength?: number;
    onInvalidTag?: (tag: string, reason: 'maxLength' | 'empty') => void;
};

const DEFAULT_SEPARATOR = /[,\n]/;

const defaultNormalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' '); // collapse spaces only

const normalizeTags = <TTag extends BaseTagItem>(tags: TTag[]): TTag[] =>
    tags.map((tag) => ({
        ...tag,
        id: tag.id ?? crypto.randomUUID(),
    }));

const TagsInputInner = <TTag extends BaseTagItem>(
    {
        className,

        inputEnabled = true,
        placeholder,
        fullWidth = false,

        value,
        defaultValue = [],
        onValueChange,

        editable = false,

        normalizeTag,
        renderTag,

        layout = 'inline',

        invalid,
        readOnly = false,
        disabled,
        rounded = 'md',
        variant = 'outlined',
        size = 'md',
        start,
        actions,
        unique = false, // 👈 default
        onDuplicate,

        removable = true,
        onTagAdd,
        onTagRemove,

        clearable,
        clearIcon,
        onClearAll,

        separator = DEFAULT_SEPARATOR,
        maxTags,
        maxLength,
        onInvalidTag,
        ...props
    }: TagsInputProps<TTag>,
    ref: React.Ref<HTMLInputElement>,
) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const mirrorRef = useRef<HTMLSpanElement>(null);
    const combinedRef = mergeRefs(inputRef, ref);

    const isCancellingRef = useRef(false);
    const originalValueRef = useRef<string>('');

    const tagRefs = useRef<Record<string | number, HTMLDivElement | null>>({});
    const [activeId, setActiveId] = useState<string | number | null>(null);

    const focusTag = (id: string | number | null) => {
        if (id == null) return;

        requestAnimationFrame(() => {
            tagRefs.current[id]?.focus();
        });
    };

    const focusInput = (callback?: () => void) => {
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            callback?.();
        });
    };

    const separatorRegex = useMemo(() => {
        return new RegExp(separator.source, separator.flags.replace(/g/g, ''));
    }, [separator]);

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [selectionAnchor, setSelectionAnchor] = useState<string | number | null>(null);

    const isSelected = (id: string | number) => {
        return selectedIds.has(id);
    };

    const selectRange = (fromId: string | number, toId: string | number) => {
        const from = getIndexById(fromId);
        const to = getIndexById(toId);

        if (from === -1 || to === -1) return;

        const start = Math.min(from, to);
        const end = Math.max(from, to);

        const next = new Set<string | number>();

        for (let i = start; i <= end; i++) {
            const tag = tags[i];

            if (tag?.disabled) continue;

            const id = getId(i);

            if (id != null) {
                next.add(id);
            }
        }

        setSelectedIds(next);
    };

    const isEditable = (tag: TTag, index: number) => {
        // if (disabled || tag.disabled) return false;
        if (disabled || readOnly || tag.disabled) return false;

        if (typeof editable === 'function') {
            return editable(tag, index);
        }

        return editable !== false;
    };

    const isRemovable = (tag: TTag, index: number) => {
        // if (disabled || tag.disabled) return false;
        if (disabled || readOnly || tag.disabled) return false;

        if (typeof removable === 'function') {
            return removable(tag, index);
        }

        return removable !== false;
    };

    // Edit refs
    const editInputRef = useRef<HTMLInputElement>(null);
    const editMirrorRef = useRef<HTMLSpanElement>(null);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

    const isControlled = value !== undefined;

    const [innerTags, setInnerTags] = useState<TTag[]>(normalizeTags(defaultValue));
    const [inputValue, setInputValue] = useState('');

    const tags = isControlled ? value! : innerTags;

    const getId = (i: number) => tags[i]?.id ?? tags[i]?.value;
    const getIndexById = (id: string | number | null) => {
        return tags.findIndex((t) => (t.id ?? t.value) === id);
    };

    const findNextEnabled = (arr: TTag[], start: number, direction: -1 | 1) => {
        let i = start;

        while (i >= 0 && i < arr.length) {
            if (!arr[i].disabled) return i;
            i += direction;
        }

        return null;
    };

    const startEdit = (index: number) => {
        const tag = tags[index];

        if (!isEditable(tag, index)) return;

        originalValueRef.current = tag.label; // 👈 SAVE ORIGINAL

        setEditingIndex(index);
        setSelectedIds(new Set());
        setSelectionAnchor(null);
        setEditingValue(tag.label);
    };

    const commitEdit = () => {
        if (isCancellingRef.current) return;

        if (editingIndex === null) return;

        let trimmed = editingValue.trim();
        if (!trimmed) {
            setEditingIndex(null);
            return;
        }

        const normalizeFn = normalizeTag ?? defaultNormalize;
        const value = normalizeFn(trimmed);

        const updated = [...tags];
        updated[editingIndex] = {
            ...updated[editingIndex],
            label: trimmed,
            value,
        };

        if (unique) {
            const exists = tags.find(
                (t, idx) =>
                    idx !== editingIndex &&
                    t.value.localeCompare(value, undefined, { sensitivity: 'base' }) === 0,
            );

            if (exists) {
                onDuplicate?.(updated[editingIndex], exists);
                return;
            }
        }

        setTags(updated);
        setEditingIndex(null);
        setActiveId(null);
        focusInput();
    };

    const cancelEdit = () => {
        isCancellingRef.current = true;

        if (editingIndex !== null) {
            setEditingValue(originalValueRef.current); // 👈 RESTORE
        }

        setEditingIndex(null);
        setActiveId(null);
        focusInput(() => {
            isCancellingRef.current = false;
        });
    };

    useLayoutEffect(() => {
        if (editingIndex !== null) {
            requestAnimationFrame(() => {
                const el = editInputRef.current;
                if (!el) return;

                el.focus();
                el.setSelectionRange(0, el.value.length);
            });
        }
    }, [editingIndex]);

    useEffect(() => {
        if (!inputRef.current || !mirrorRef.current) return;

        const text = inputValue || ' '; // 👈 avoid 0 width
        mirrorRef.current.textContent = text;

        const width = mirrorRef.current.offsetWidth;

        // inputRef.current.style.width = `${width + 2}px`; // small buffer
        inputRef.current.style.width = `${Math.min(width + 2, 300)}px`;
    }, [inputValue]);

    useLayoutEffect(() => {
        if (!editInputRef.current || !editMirrorRef.current) return;

        const text = editingValue || ' ';
        editMirrorRef.current.textContent = text;

        const mirrorWidth = editMirrorRef.current.scrollWidth;

        const style = getComputedStyle(editInputRef.current);
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

        const width = mirrorWidth + padding + 2;

        editInputRef.current.style.width = `${Math.min(width, 300)}px`;
    }, [editingValue, editingIndex]);

    const handleClearAll = async () => {
        if (disabled || readOnly) return;

        const shouldClear = await onClearAll?.(tags);

        if (shouldClear === false) return;

        setInputValue('');

        if (!isControlled) {
            setInnerTags([]);
        }

        onValueChange?.([]);
    };

    const clearButton =
        clearable && tags.length > 0 ? (
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // 👈 keep focus
                onClick={handleClearAll}
                className={classPrefix('--clear-button')}
                disabled={disabled || readOnly}
            >
                {finalClearIcon}
            </button>
        ) : null;

    const setTags = (next: TTag[]) => {
        if (!isControlled) setInnerTags(next);
        onValueChange?.(next);
    };
    const addTag = (raw: string) => {
        let trimmed = raw.trim();

        if (!trimmed) {
            onInvalidTag?.(raw, 'empty');
            return;
        }

        if (maxLength && trimmed.length > maxLength) {
            onInvalidTag?.(trimmed, 'maxLength');
            trimmed = trimmed.slice(0, maxLength);
        }

        if (!trimmed) return;
        if (maxTags && tags.length >= maxTags) return;

        const normalizeFn = normalizeTag ?? defaultNormalize;
        const value = normalizeFn(trimmed);

        const newTag: TTag = {
            id: crypto.randomUUID(),
            label: trimmed,
            value,
        } as TTag;

        if (unique) {
            const existing = tags.find(
                (t) => t.value.localeCompare(value, undefined, { sensitivity: 'base' }) === 0,
            );

            if (existing) {
                onDuplicate?.(newTag, existing);
                return;
            }
        }

        const next = [...tags, newTag];

        setTags(next);
        onTagAdd?.(newTag);
        setInputValue('');
    };
    const removeTag = (index: number) => {
        if (disabled || readOnly) return;

        const removed = tags[index];
        if (!isRemovable(removed, index)) return;

        const next = tags.filter((_, i) => i !== index);

        setTags(next);
        onTagRemove?.(removed, index);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!inputEnabled) {
            props.onKeyDown?.(e);
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !inputValue && tags.length) {
            e.preventDefault();

            setSelectedIds(new Set(tags.map((t) => t.id ?? t.value)));

            const firstIndex = findNextEnabled(tags, 0, 1);

            if (firstIndex != null) {
                const firstId = getId(firstIndex);

                setSelectionAnchor(firstId);
                setActiveId(firstId);
                focusTag(firstId);
            }

            return;
        }

        if (e.key === 'ArrowLeft' && !inputValue && tags.length) {
            e.preventDefault();

            const nextIndex = findNextEnabled(tags, tags.length - 1, -1);

            if (nextIndex !== null) {
                const nextId = getId(nextIndex);

                if (e.shiftKey) {
                    setSelectedIds(new Set([nextId]));
                    setSelectionAnchor(nextId);
                } else {
                    setSelectedIds(new Set());
                    setSelectionAnchor(nextId);
                }

                setActiveId(nextId);
                focusTag(nextId);

                return;
            }
        }

        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
            return;
        }

        if (e.key === 'Backspace' && !inputValue && tags.length) {
            e.preventDefault();

            // 1. find deletable
            const targetIndex = findNextEnabled(tags, tags.length - 1, -1);
            if (targetIndex === null) return;

            const next = tags.filter((_, i) => i !== targetIndex);

            setTags(next);

            if (next.length === 0) {
                requestAnimationFrame(() => inputRef.current?.focus());
                return;
            }

            // 2. find focus target (LEFT of deleted)
            const focusIndex = findNextEnabled(next, targetIndex - 1, -1);

            if (focusIndex === null) {
                requestAnimationFrame(() => inputRef.current?.focus());
                return;
            }

            const nextId = next[focusIndex].id ?? next[focusIndex].value;

            setActiveId(nextId);
            focusTag(nextId);
        }

        props.onKeyDown?.(e);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        const index = getIndexById(activeId);
        const anchor = selectionAnchor ?? activeId ?? getId(index);

        if (index === -1) return;

        const tag = tags[index];

        if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            setSelectedIds(new Set(tags.map((t) => t.id ?? t.value)));
        }

        const moveSelection = (
            direction: -1 | 1,
            withSelection: boolean,
            explicitIndex?: number | null,
        ) => {
            const nextIndex = explicitIndex ?? findNextEnabled(tags, index + direction, direction);

            if (nextIndex == null) {
                if (withSelection) return;

                if (inputEnabled) {
                    setActiveId(null);
                    setSelectedIds(new Set());
                    setSelectionAnchor(null);
                    focusInput();
                    return;
                }

                // token-only mode → circular navigation
                const wrappedIndex = findNextEnabled(
                    tags,
                    direction < 0 ? tags.length - 1 : 0,
                    direction,
                );

                if (wrappedIndex == null) return;

                const wrappedId = getId(wrappedIndex);

                setSelectedIds(new Set());
                setSelectionAnchor(wrappedId);
                setActiveId(wrappedId);
                focusTag(wrappedId);

                return;
            }

            const nextId = getId(nextIndex);

            if (withSelection) {
                setSelectionAnchor(anchor);
                selectRange(anchor, nextId);
            } else {
                setSelectedIds(new Set());
                setSelectionAnchor(nextId);
            }

            setActiveId(nextId);
            focusTag(nextId);
        };

        if (e.key === 'Home') {
            e.preventDefault();
            moveSelection(-1, e.shiftKey, findNextEnabled(tags, 0, 1));
            return;
        }

        if (e.key === 'End') {
            e.preventDefault();
            moveSelection(1, e.shiftKey, findNextEnabled(tags, tags.length - 1, -1));
            return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            moveSelection(-1, e.shiftKey);
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            moveSelection(1, e.shiftKey);
            return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            if (selectedIds.size > 0) {
                e.preventDefault();
                removeSelected();
                return;
            }

            // 👇 find nearest enabled tag to delete
            let targetIndex: number | null = null;

            // prefer previous for Backspace
            if (e.key === 'Backspace') {
                targetIndex = findNextEnabled(tags, index - 1, -1);

                // 👇 nothing to delete on the left
                if (targetIndex === null) {
                    setActiveId(null);
                    requestAnimationFrame(() => inputRef.current?.focus());
                    return;
                }
            } else {
                targetIndex = findNextEnabled(tags, index, 1);
            }

            // fallback: try opposite direction
            if (targetIndex === null) {
                targetIndex =
                    e.key === 'Backspace'
                        ? findNextEnabled(tags, index, 1)
                        : findNextEnabled(tags, index, -1);
            }

            if (targetIndex === null) return; // nothing to delete

            const next = tags.filter((_, i) => i !== targetIndex);

            const removed = tags[targetIndex];
            onTagRemove?.(removed, targetIndex);
            setTags(next);

            if (next.length === 0) {
                setActiveId(null);
                requestAnimationFrame(() => inputRef.current?.focus());
                return;
            }

            let nextIndexTemp: number | null;
            if (e.key === 'Backspace') {
                nextIndexTemp = findNextEnabled(next, index - 1, 1);
            } else {
                nextIndexTemp = findNextEnabled(next, index, 1);
            }

            if (nextIndexTemp == null) {
                // token-only mode (e.g. FileUpload)
                if (!inputEnabled) {
                    const fallbackIndex = findNextEnabled(next, next.length - 1, -1);

                    if (fallbackIndex != null) {
                        nextIndexTemp = fallbackIndex;
                    } else {
                        setActiveId(null);
                        return;
                    }
                } else {
                    focusInput();
                    return;
                }
            }

            const nextIndex = nextIndexTemp;

            const nextTag = next[nextIndex];
            const nextId = nextTag.id ?? nextTag.value;

            setActiveId(nextId);
            focusTag(nextId);
        }

        if (e.key === 'Enter') {
            if (isEditable(tags[index], index)) {
                startEdit(index);
            }
        }
    };
    const removeSelected = () => {
        if (!selectedIds.size) return;

        const next = tags.filter((tag, i) => {
            const id = getId(i);

            if (selectedIds.has(id) && !tag.disabled) {
                onTagRemove?.(tag, i);
                return false;
            }

            return true;
        });

        setTags(next);

        setSelectedIds(new Set());
        setSelectionAnchor(null);

        if (next.length === 0) {
            setActiveId(null);
            focusInput();
            return;
        }

        // active tag survived
        const survivingActive = next.find((t) => (t.id ?? t.value) === activeId);

        if (survivingActive && !survivingActive.disabled) {
            const id = survivingActive.id ?? survivingActive.value;

            setActiveId(id);
            setSelectionAnchor(id);
            focusTag(id);

            return;
        }

        // fallback: nearest enabled tag
        const previousIndex = findNextEnabled(
            next,
            Math.min(getIndexById(activeId), next.length - 1),
            -1,
        );

        const nextIndex =
            previousIndex ??
            findNextEnabled(next, Math.min(getIndexById(activeId), next.length - 1), 1);

        if (nextIndex == null) {
            setActiveId(null);
            focusInput();
            return;
        }

        const nextTag = next[nextIndex];
        const nextId = nextTag.id ?? nextTag.value;

        setActiveId(nextId);
        setSelectionAnchor(nextId);
        focusTag(nextId);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!inputEnabled) return;

        let raw = e.target.value;

        if (maxLength && raw.length > maxLength) {
            onInvalidTag?.(raw, 'maxLength');
            raw = raw.slice(0, maxLength);
        }

        // handle split typing (e.g. "a,b")
        if (separatorRegex.test(raw)) {
            const parts = raw.split(separatorRegex);

            parts.slice(0, -1).forEach(addTag);
            setInputValue(parts[parts.length - 1] ?? '');

            return;
        }

        setInputValue(raw);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (!inputEnabled) return;

        const text = e.clipboardData.getData('text');

        if (!separatorRegex.test(text)) return;

        e.preventDefault();

        const parts = text
            .split(separatorRegex)
            .map((t) => t.trim())
            .filter(Boolean);

        if (!parts.length) return;

        let next: TTag[] = [...tags];

        for (const part of parts) {
            let trimmed = part.trim();
            if (!trimmed) {
                onInvalidTag?.(part, 'empty');
                continue;
            }

            if (maxLength && trimmed.length > maxLength) {
                onInvalidTag?.(trimmed, 'maxLength');
                trimmed = trimmed.slice(0, maxLength);
            }

            if (!trimmed) continue;

            const normalizeFn = normalizeTag ?? defaultNormalize;
            const value = normalizeFn(trimmed);

            const newTag = {
                id: crypto.randomUUID(),
                label: trimmed,
                value,
            } as TTag;

            if (unique) {
                const existing = next.find(
                    (t) => t.value.localeCompare(value, undefined, { sensitivity: 'base' }) === 0,
                );
                if (existing) {
                    onDuplicate?.(newTag, existing);
                    continue;
                }
            }

            next.push(newTag);
            onTagAdd?.(newTag);

            if (maxTags && next.length >= maxTags) break;
        }

        setTags(next);
        setInputValue('');
    };

    const tagNodeWrapper = (
        tag: TTag,
        i: number,
        id: string | number,
        tagNode: React.ReactNode,
    ) => {
        return (
            <div
                ref={(el) => {
                    if (tag.id != null) {
                        // tagRefs.current[tag.id] = el;
                        if (el) {
                            tagRefs.current[tag.id] = el;
                        } else {
                            delete tagRefs.current[tag.id];
                        }
                    }
                }}
                key={id}
                tabIndex={!readOnly && !tag.disabled && activeId === id ? 0 : -1}
                onFocus={() => {
                    if (readOnly || tag.disabled) return;
                    setActiveId(id);
                }}
                onBlur={(e) => {
                    const next = e.relatedTarget as Node | null;

                    // still inside current tag wrapper
                    if (e.currentTarget.contains(next)) return;

                    setActiveId(null);

                    // optional:
                    if (
                        !next ||
                        !(next instanceof HTMLElement) ||
                        !next.closest(`.${classPrefix('--tags-input')}`)
                    ) {
                        setSelectedIds(new Set());
                        setSelectionAnchor(null);
                    }
                }}
                onKeyDown={(e) => handleTagKeyDown(e)}
                onDoubleClick={isEditable(tag, i) ? () => startEdit(i) : undefined}
                onClick={(e) => {
                    e.stopPropagation();

                    if (readOnly || tag.disabled) return;

                    // CTRL / CMD toggle
                    if (e.ctrlKey || e.metaKey) {
                        setSelectedIds((prev) => {
                            const next = new Set(prev);

                            if (next.has(id)) {
                                next.delete(id);
                            } else {
                                next.add(id);
                            }

                            return next;
                        });

                        // setSelectionAnchor(id);
                        if (selectionAnchor == null) {
                            setSelectionAnchor(id);
                        }
                    }

                    // SHIFT range
                    else if (e.shiftKey && selectionAnchor != null) {
                        selectRange(selectionAnchor, id);
                    }

                    // NORMAL
                    else {
                        setSelectedIds(new Set([id]));
                        setSelectionAnchor(id);
                    }

                    setActiveId(id);
                    focusTag(id);
                }}
                className={classPrefix('--tag')}
                data-active={activeId === id || undefined}
                data-selected={isSelected(id) || undefined}
                data-disabled={tag.disabled || disabled || undefined}
                data-prevent-focus
            >
                {tagNode}
            </div>
        );
    };

    return (
        <FieldRoot
            {...props}
            className={clsx(className, classPrefix('--tags-input'))}
            invalid={invalid}
            disabled={disabled}
            readOnly={readOnly}
            rounded={rounded}
            focusTargetRef={!readOnly ? inputRef : undefined}
            variant={variant}
            size={size}
            start={start} // optional
            actions={
                <>
                    {actions}
                    {clearButton}
                </>
            }
            onBlur={(e) => {
                const next = e.relatedTarget as Node | null;

                // still inside TagsInput
                if (e.currentTarget.contains(next)) return;

                setActiveId(null);
                setSelectedIds(new Set());
                setSelectionAnchor(null);
            }}
            data-full-width={fullWidth || undefined}
            data-layout={layout}
        >
            {tags.map((tag, i) => {
                const remove = () => removeTag(i);
                const id = tag.id ?? tag.value;

                // 🔥 EDIT MODE
                if (editingIndex === i && isEditable(tag, i)) {
                    return (
                        <React.Fragment key={tag.id ?? tag.value}>
                            <span
                                ref={editMirrorRef}
                                className={classPrefix('--mirror')}
                                aria-hidden
                            />
                            <input
                                ref={editInputRef}
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => {
                                    // commit (normal Enter)
                                    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
                                        e.preventDefault();
                                        commitEdit();
                                    }

                                    // cancel (Ctrl+Enter / Cmd+Enter)
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        cancelEdit();
                                    }
                                }}
                                className={classPrefix('--tag-edit')}
                            />
                        </React.Fragment>
                    );
                }

                // 🔥 CUSTOM RENDER
                if (renderTag) {
                    const node = renderTag({
                        tag,
                        index: i,
                        remove,
                        disabled: disabled || tag.disabled,
                        selected: isSelected(id),
                        focused: !tag.disabled && !disabled && activeId === id,
                    });
                    return React.isValidElement(node) ? tagNodeWrapper(tag, i, id, node) : node;
                }

                // DEFAULT CHIP
                return tagNodeWrapper(
                    tag,
                    i,
                    id,
                    <Chip
                        size={size}
                        removable={!tag.disabled}
                        disabled={tag.disabled || disabled}
                        onRemove={remove}
                        intent="primary"
                        selected={isSelected(id)}
                        focused={!tag.disabled && !disabled && activeId === id}
                    >
                        {tag.label}
                    </Chip>,
                );
            })}
            {!tags.length && placeholder && (
                <span
                    className={classPrefix('--placeholder')}
                    data-disabled={disabled || undefined}
                >
                    {placeholder}
                </span>
            )}
            {inputEnabled && (
                <>
                    <span ref={mirrorRef} className={classPrefix(`--mirror`)} aria-hidden />
                    <input
                        ref={combinedRef}
                        disabled={disabled || readOnly}
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        className={classPrefix(`--field`)}
                    />
                </>
            )}
        </FieldRoot>
        // </div>
    );
};

const TagsInput = forwardRef(TagsInputInner) as <TTag extends BaseTagItem = BaseTagItem>(
    props: TagsInputProps<TTag> & {
        ref?: React.Ref<HTMLInputElement>;
    },
) => React.ReactElement;

(TagsInput as React.FC).displayName = 'TagsInput';

export { TagsInput };
