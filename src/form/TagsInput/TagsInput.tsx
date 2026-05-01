import React, { forwardRef, useRef, useState } from 'react';
import { Input, type InputProps } from '../Input/Input';
import { FieldRoot } from '../FieldRoot/FieldRoot';
import { renderGroupItem } from '../Input/input.helpers';
import { prefix } from '../Input/input.helpers';
import clsx from 'clsx';
import { Chip } from '../../Chip/Chip';
import { mergeRefs } from '../../utils/mergeRefs';
import type { BoxProps } from '../../Box/Box';
import { Size, Variant } from '../Input/input.tokens';
import { Close } from '../../Icon/Close';
import { IconWrapper } from '../../Icon';

type RenderTagParams = {
    value: string;
    index: number;
    remove: () => void;
    disabled?: boolean;
};

// type TagsInputProps = {
//     value: string[];
//     onChange: (tags: string[]) => void;
//     renderTag?: (params: RenderTagParams) => React.ReactNode;
// };

export type TagsInputProps = Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> & {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (tags: string[]) => void;

    renderTag?: (params: RenderTagParams) => React.ReactNode;

    invalid?: boolean;
    rounded?: BoxProps['rounded'];
    variant?: Variant;
    size?: Size;
    start?: React.ReactNode;
    actions?: React.ReactNode; // 👈 NEW
    unique?: boolean;
    onDuplicate?: (tag: string, existing: string) => void;

    onTagAdd?: (tag: string) => void;
    onTagRemove?: (tag: string, index: number) => void;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClearAll?: (tags: string[]) => boolean | void | Promise<boolean | void>;

    separator?: RegExp; // default: /[,\n]/
    maxTags?: number;
    maxLength?: number;
    onInvalidTag?: (tag: string, reason: 'maxLength' | 'empty') => void;
};

const DEFAULT_SEPARATOR = /[,\n]/;

const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
    (
        {
            className,

            value,
            defaultValue = [],
            onValueChange,

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

        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const isControlled = value !== undefined;

        const [innerTags, setInnerTags] = useState<string[]>(defaultValue);
        const [inputValue, setInputValue] = useState('');

        const tags = isControlled ? value! : innerTags;

        React.useEffect(() => {
            if (!inputRef.current || !mirrorRef.current) return;

            const text = inputValue || ' '; // 👈 avoid 0 width
            mirrorRef.current.textContent = text;

            const width = mirrorRef.current.offsetWidth;

            // inputRef.current.style.width = `${width + 2}px`; // small buffer
            inputRef.current.style.width = `${Math.min(width + 2, 300)}px`;
        }, [inputValue]);

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

        const setTags = (next: string[]) => {
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

            if (unique) {
                const existing = tags.find((t) => t.toLowerCase() === trimmed.toLowerCase());

                if (existing) {
                    onDuplicate?.(trimmed, existing);
                    return;
                }
            }

            setTags([...tags, trimmed]);
            onTagAdd?.(trimmed);
            setInputValue('');
        };

        const removeTag = (index: number) => {
            const removed = tags[index];
            const next = tags.filter((_, i) => i !== index);

            setTags(next);
            onTagRemove?.(removed, index);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

                if (unique) {
                    const existing = next.find((t) => t.toLowerCase() === trimmed.toLowerCase());

                    if (existing) {
                        onDuplicate?.(trimmed, existing);
                        continue;
                    }
                }

                next.push(trimmed);
                onTagAdd?.(trimmed);

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

                    if (renderTag) {
                        return (
                            <React.Fragment key={tag + i}>
                                {renderTag({
                                    value: tag,
                                    index: i,
                                    remove,
                                    disabled,
                                })}
                            </React.Fragment>
                        );
                    }

                    return (
                        <Chip key={tag + i} size={size} removable onRemove={remove}>
                            {tag}
                        </Chip>
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
