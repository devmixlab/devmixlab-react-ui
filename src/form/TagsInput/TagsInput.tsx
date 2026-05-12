/**
 * @see tagsInputDocumentation.md
 */
import React, { forwardRef, useRef, useState, useEffect, useLayoutEffect } from 'react';
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

type RenderTagParams = {
    tag: TagItem;
    index: number;
    remove: () => void;
    disabled?: boolean;
};

type TagItem = {
    id?: string | number;
    label: string; // UI
    value: string; // normalized / unique
    disabled?: boolean;
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

export type TagsInputProps = Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange'> & {
    value?: TagItem[];
    defaultValue?: TagItem[];
    onValueChange?: (tags: TagItem[]) => void;

    editable?: boolean | ((tag: TagItem, index: number) => boolean);

    normalizeTag?: (label: string) => string;
    renderTag?: (params: RenderTagParams) => React.ReactNode;

    invalid?: boolean;
    rounded?: BoxProps['rounded'];
    variant?: Variant;
    size?: Size;
    start?: React.ReactNode;
    actions?: React.ReactNode; // 👈 NEW
    unique?: boolean;
    onDuplicate?: (tag: TagItem, existing: TagItem) => void;

    onTagAdd?: (tag: TagItem) => void;
    onTagRemove?: (tag: TagItem, index: number) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClearAll?: (tags: TagItem[]) => boolean | void | Promise<boolean | void>;

    separator?: RegExp; // default: /[,\n]/
    maxTags?: number;
    maxLength?: number;
    onInvalidTag?: (tag: string, reason: 'maxLength' | 'empty') => void;
};

const DEFAULT_SEPARATOR = /[,\n]/;

const defaultNormalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' '); // collapse spaces only

const normalizeTags = (tags: TagItem[]): TagItem[] =>
    tags.map((tag) => ({
        ...tag,
        id: tag.id ?? crypto.randomUUID(),
    }));

const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
    (
        {
            className,

            value,
            defaultValue = [],
            onValueChange,

            editable = false,

            normalizeTag,
            renderTag,

            invalid,
            disabled,
            rounded = 'md',
            variant = 'outlined',
            size = 'md',
            start,
            actions,
            unique = false, // 👈 default
            onDuplicate,

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
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const mirrorRef = useRef<HTMLSpanElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const isCancellingRef = useRef(false);
        const originalValueRef = useRef<string>('');

        const tagRefs = useRef<Record<string | number, HTMLDivElement | null>>({});
        const [activeId, setActiveId] = useState<string | number | null>(null);

        // Selection
        const [selectionStart, setSelectionStart] = useState<number | null>(null);
        const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

        const getSelectedRange = () => {
            if (selectionStart === null || selectionEnd === null) return null;

            const start = Math.min(selectionStart, selectionEnd);
            const end = Math.max(selectionStart, selectionEnd);

            return { start, end };
        };

        const isSelected = (index: number) => {
            const range = getSelectedRange();
            if (!range) return false;
            return index >= range.start && index <= range.end;
        };

        const isEditable = (tag: TagItem, index: number) => {
            if (disabled || tag.disabled) return false;

            if (typeof editable === 'function') {
                return editable(tag, index);
            }

            return editable !== false;
        };

        // Edit refs
        const editInputRef = useRef<HTMLInputElement>(null);
        const editMirrorRef = useRef<HTMLSpanElement>(null);

        const [editingIndex, setEditingIndex] = useState<number | null>(null);
        const [editingValue, setEditingValue] = useState('');

        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const isControlled = value !== undefined;

        const [innerTags, setInnerTags] = useState<TagItem[]>(normalizeTags(defaultValue));
        const [inputValue, setInputValue] = useState('');

        const tags = isControlled ? value! : innerTags;

        const getId = (i: number) => tags[i]?.id ?? tags[i]?.value;
        const getIndexById = (id: string | number | null) => {
            return tags.findIndex((t) => (t.id ?? t.value) === id);
        };

        const findNextEnabled = (arr: TagItem[], start: number, direction: -1 | 1) => {
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
            setSelectionStart(null);
            setSelectionEnd(null);
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

            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        };

        const cancelEdit = () => {
            isCancellingRef.current = true;

            if (editingIndex !== null) {
                setEditingValue(originalValueRef.current); // 👈 RESTORE
            }

            setEditingIndex(null);
            setActiveId(null);

            requestAnimationFrame(() => {
                inputRef.current?.focus();
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
            if (disabled) return;

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
                >
                    {finalClearIcon}
                </button>
            ) : null;

        const setTags = (next: TagItem[]) => {
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

            const newTag: TagItem = {
                id: crypto.randomUUID(),
                label: trimmed,
                value,
            };

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
            if (disabled) return;

            const removed = tags[index];
            if (removed.disabled) return;

            const next = tags.filter((_, i) => i !== index);

            setTags(next);
            onTagRemove?.(removed, index);
        };
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // ⬅️ move to last tag
            if (e.key === 'ArrowLeft' && !inputValue && tags.length) {
                e.preventDefault();

                const nextIndex = findNextEnabled(tags, tags.length - 1, -1);
                if (nextIndex !== null) {
                    const nextId = getId(nextIndex);

                    setActiveId(nextId);

                    requestAnimationFrame(() => {
                        tagRefs.current[nextId]?.focus();
                    });
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

                requestAnimationFrame(() => {
                    tagRefs.current[nextId]?.focus();
                });
            }

            props.onKeyDown?.(e);
        };

        const clamp = (value: number) => Math.max(0, Math.min(tags.length - 1, value));
        const handleTagKeyDown = (e: React.KeyboardEvent) => {
            const index = getIndexById(activeId);

            if (index === -1) return;

            const tag = tags[index];

            if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setSelectionStart(0);
                setSelectionEnd(tags.length - 1);
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();

                if (e.shiftKey) {
                    if (selectionStart === null) {
                        setSelectionStart(index);
                        setSelectionEnd(index - 1);
                    } else {
                        setSelectionEnd((prev) => clamp(prev !== null ? prev - 1 : index - 1));
                    }
                } else {
                    const nextIndex = findNextEnabled(tags, index - 1, -1);

                    if (nextIndex !== null) {
                        const nextId = getId(nextIndex);

                        setActiveId(nextId);

                        requestAnimationFrame(() => {
                            tagRefs.current[nextId]?.focus();
                        });
                    } else {
                        setActiveId(null);
                        inputRef.current?.focus();
                    }

                    setSelectionStart(null);
                    setSelectionEnd(null);
                }
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();

                if (e.shiftKey) {
                    if (selectionStart === null) {
                        setSelectionStart(index);
                        setSelectionEnd(index + 1);
                    } else {
                        setSelectionEnd((prev) => clamp(prev !== null ? prev + 1 : index + 1));
                    }
                } else {
                    if (index < tags.length - 1) {
                        const nextIndex = findNextEnabled(tags, index + 1, 1);

                        if (nextIndex !== null) {
                            const nextId = getId(nextIndex);

                            setActiveId(nextId);

                            requestAnimationFrame(() => {
                                tagRefs.current[nextId]?.focus();
                            });
                        } else {
                            setActiveId(null);
                            inputRef.current?.focus();
                        }
                    } else {
                        setActiveId(null);
                        inputRef.current?.focus();
                    }

                    setSelectionStart(null);
                    setSelectionEnd(null);
                }
            }

            if (e.key === 'Backspace' || e.key === 'Delete') {
                const range = getSelectedRange();

                if (range) {
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
                    requestAnimationFrame(() => {
                        inputRef.current?.focus();
                    });
                    return;
                }

                const nextIndex = nextIndexTemp;

                const nextTag = next[nextIndex];
                const nextId = nextTag.id ?? nextTag.value;

                setActiveId(nextId);

                requestAnimationFrame(() => {
                    tagRefs.current[nextId]?.focus();
                });
            }

            if (e.key === 'Enter') {
                if (isEditable(tags[index], index)) {
                    startEdit(index);
                }
            }
        };
        const removeSelected = () => {
            const range = getSelectedRange();
            if (!range) return;

            const next = tags.filter((tag, i) => {
                const inRange = i >= range.start && i <= range.end;
                return !inRange || tag.disabled;
            });

            setTags(next);

            // 👇 NEW: compute next focus
            const nextIndex =
                range.start < next.length
                    ? range.start // next item shifts into this position
                    : next.length - 1; // fallback to last item

            setSelectionStart(null);
            setSelectionEnd(null);

            if (next.length === 0) {
                setActiveId(null);
                requestAnimationFrame(() => inputRef.current?.focus());
            } else {
                const nextTag = next[nextIndex];

                const nextId = nextTag.id ?? nextTag.value;

                setActiveId(nextId);

                requestAnimationFrame(() => {
                    tagRefs.current[nextId]?.focus();
                });
            }
        };
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let raw = e.target.value;

            if (maxLength && raw.length > maxLength) {
                onInvalidTag?.(raw, 'maxLength');
                raw = raw.slice(0, maxLength);
            }

            // handle split typing (e.g. "a,b")
            if (separator.test(raw)) {
                const parts = raw.split(separator);

                parts.slice(0, -1).forEach(addTag);
                setInputValue(parts[parts.length - 1] ?? '');

                return;
            }

            setInputValue(raw);
        };

        const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
            const text = e.clipboardData.getData('text');

            if (!separator.test(text)) return;

            e.preventDefault();

            const parts = text
                .split(separator)
                .map((t) => t.trim())
                .filter(Boolean);

            if (!parts.length) return;

            let next = [...tags];

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

                const newTag: TagItem = {
                    id: crypto.randomUUID(),
                    label: trimmed,
                    value,
                };

                if (unique) {
                    const existing = next.find(
                        (t) =>
                            t.value.localeCompare(value, undefined, { sensitivity: 'base' }) === 0,
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
            tag: TagItem,
            i: number,
            id: string | number,
            tagNode: React.ReactNode,
        ) => {
            return (
                <div
                    ref={(el) => {
                        if (tag.id != null) {
                            tagRefs.current[tag.id] = el;
                        }
                    }}
                    key={id}
                    tabIndex={!tag.disabled && activeId === id ? 0 : -1}
                    onFocus={() => {
                        if (tag.disabled) return;
                        setActiveId(id);
                        setSelectionStart(null);
                        setSelectionEnd(null);
                    }}
                    onBlur={(e) => {
                        const next = e.relatedTarget as Node | null;

                        // still inside current tag wrapper
                        if (e.currentTarget.contains(next)) return;

                        setActiveId(null);
                    }}
                    onKeyDown={(e) => handleTagKeyDown(e)}
                    onDoubleClick={isEditable(tag, i) ? () => startEdit(i) : undefined}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (tag.disabled) return;

                        setActiveId(id);

                        requestAnimationFrame(() => {
                            tagRefs.current[id]?.focus();
                        });
                    }}
                    style={{ display: 'inline-flex' }}
                    className={classPrefix('--tag')}
                    data-active={activeId === id || undefined}
                    data-selected={isSelected(i) || undefined}
                    data-disabled={tag.disabled || disabled || undefined}
                    data-prevent-focus
                >
                    {tagNode}
                </div>
            );
        };

        return (
            <FieldRoot
                className={clsx(className, classPrefix('--tags-input'))}
                invalid={invalid}
                disabled={disabled}
                rounded={rounded}
                focusTargetRef={inputRef}
                variant={variant}
                size={size}
                start={start} // optional
                actions={
                    <>
                        {actions}
                        {clearButton}
                    </>
                }
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
                            selected={isSelected(i)}
                            focused={!tag.disabled && !disabled && activeId === id}
                        >
                            {tag.label}
                        </Chip>,
                    );
                })}
                <span ref={mirrorRef} className={classPrefix(`--mirror`)} aria-hidden />
                <input
                    ref={combinedRef}
                    disabled={disabled}
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className={classPrefix(`--field`)}
                />
            </FieldRoot>
            // </div>
        );
    },
);

TagsInput.displayName = 'TagsInput';

export { TagsInput };
