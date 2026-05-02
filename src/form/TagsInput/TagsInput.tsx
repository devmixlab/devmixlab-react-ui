import React, { forwardRef, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { type InputProps } from '../Input/Input';
import { FieldRoot } from '../FieldRoot/FieldRoot';
import { prefix } from '../Input/input.helpers';
import clsx from 'clsx';
import { Chip } from '../../Chip/Chip';
import { mergeRefs } from '../../utils/mergeRefs';
import type { BoxProps } from '../../Box/Box';
import { Size, Variant } from '../Input/input.tokens';
import { Close } from '../../Icon/Close';
import { IconWrapper } from '../../Icon';

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

export type TagsInputProps = Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> & {
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

        const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
        const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

        const [innerTags, setInnerTags] = useState<TagItem[]>(defaultValue);
        const [inputValue, setInputValue] = useState('');

        const tags = isControlled ? value! : innerTags;

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
            setActiveIndex(null);

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
            setActiveIndex(null);

            requestAnimationFrame(() => {
                inputRef.current?.focus();
                isCancellingRef.current = false;
            });
        };

        useEffect(() => {
            if (activeIndex !== null) {
                tagRefs.current[activeIndex]?.focus();
            }
        }, [activeIndex]);

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
                    className={prefix('__clear')}
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
                setActiveIndex(tags.length - 1);
                return;
            }

            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(inputValue);
                return;
            }

            if (e.key === 'Backspace' && !inputValue && tags.length) {
                removeTag(tags.length - 1);
                return;
            }

            props.onKeyDown?.(e);
        };

        const clamp = (value: number) => Math.max(0, Math.min(tags.length - 1, value));
        const handleTagKeyDown = (e: React.KeyboardEvent, index: number) => {
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
                    setActiveIndex(index > 0 ? index - 1 : null);
                    setSelectionStart(null);
                    setSelectionEnd(null);

                    if (index === 0) inputRef.current?.focus();
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
                        setActiveIndex(index + 1);
                    } else {
                        setActiveIndex(null);
                        inputRef.current?.focus();
                    }

                    setSelectionStart(null);
                    setSelectionEnd(null);
                }
            }

            // if (e.key === 'Backspace') {
            //     e.preventDefault();
            //
            //     if (!tags[index].disabled) {
            //         removeTag(index);
            //         setActiveIndex(index > 0 ? index - 1 : null);
            //     }
            // }

            if (e.key === 'Backspace' || e.key === 'Delete') {
                const range = getSelectedRange();

                if (range) {
                    e.preventDefault();
                    removeSelected();
                    return;
                }

                // fallback: single delete
                if (!tags[index].disabled) {
                    removeTag(index);
                    setActiveIndex(index > 0 ? index - 1 : null);
                }
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
                setActiveIndex(null);
                requestAnimationFrame(() => inputRef.current?.focus());
            } else {
                setActiveIndex(nextIndex);
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

        const cl = clsx(className, prefix(), prefix('--tags-input'));

        return (
            <FieldRoot
                className={cl}
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

                    // 🔥 EDIT MODE
                    if (editingIndex === i && isEditable(tag, i)) {
                        return (
                            <React.Fragment key={tag.id ?? tag.value}>
                                <span
                                    ref={editMirrorRef}
                                    className={prefix('__mirror')}
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
                                    className={prefix('__tag-edit')}
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

                        return React.isValidElement(node) ? (
                            <div
                                ref={(el) => (tagRefs.current[i] = el)}
                                key={tag.id ?? tag.value}
                                tabIndex={activeIndex === i ? 0 : -1}
                                onFocus={() => {
                                    setActiveIndex(i);
                                    setSelectionStart(null);
                                    setSelectionEnd(null);
                                }}
                                onKeyDown={(e) => handleTagKeyDown(e, i)}
                                onDoubleClick={isEditable(tag, i) ? () => startEdit(i) : undefined}
                                style={{ display: 'inline-flex' }}
                                // className={clsx(prefix('__tag'), {
                                //     [prefix('__tag--active')]: activeIndex === i,
                                // })}
                                className={clsx(prefix('__tag'), {
                                    [prefix('__tag--active')]: activeIndex === i,
                                    [prefix('__tag--selected')]: isSelected(i),
                                })}
                            >
                                {node}
                            </div>
                        ) : (
                            node
                        );
                    }

                    // 🔥 DEFAULT CHIP
                    return (
                        <div
                            ref={(el) => (tagRefs.current[i] = el)}
                            key={tag.id ?? tag.value}
                            tabIndex={activeIndex === i ? 0 : -1}
                            onFocus={() => {
                                setActiveIndex(i);
                                setSelectionStart(null);
                                setSelectionEnd(null);
                            }}
                            onKeyDown={(e) => handleTagKeyDown(e, i)}
                            onDoubleClick={isEditable(tag, i) ? () => startEdit(i) : undefined}
                            style={{ display: 'inline-flex' }}
                            // className={clsx(prefix('__tag'), {
                            //     [prefix('__tag--active')]: activeIndex === i,
                            // })}
                            className={clsx(prefix('__tag'), {
                                [prefix('__tag--active')]: activeIndex === i,
                                [prefix('__tag--selected')]: isSelected(i),
                            })}
                        >
                            <Chip
                                size={size}
                                removable={!tag.disabled}
                                disabled={tag.disabled}
                                onRemove={remove}
                            >
                                {tag.label}
                            </Chip>
                        </div>
                    );
                })}
                <span ref={mirrorRef} className={prefix(`__mirror`)} aria-hidden />
                <input
                    ref={combinedRef}
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className={prefix(`__field`)}
                />
            </FieldRoot>
            // </div>
        );
    },
);

TagsInput.displayName = 'TagsInput';

export { TagsInput };
