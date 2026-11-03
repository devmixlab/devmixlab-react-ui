import React, { useMemo, useRef, useState } from 'react';
import { TagsInput, type TagsInputItem, type TagsInputProps, type TagsInputRef } from '../TagsInput';
import { Dropdown } from '../Dropdown';
import { Text } from '../../Text';
import { mergeRefs } from '../../../utils';

type SuggestionTagsInputProps<TTag extends TagsInputItem> = Omit<
  TagsInputProps<TTag>,
  'onInputValueChange'
> & {
  suggestions: TTag[];
  onlySuggestionsValues?: boolean;

  minChars?: number;
  maxSuggestions?: number;
  showInfo?: boolean;

  onSuggestionSelect?: (tag: TTag) => void;
  renderSuggestion?: (tag: TTag) => React.ReactNode;
  onInputValueChange?: (value: string) => void;
};

const SuggestionTagsInput = <TTag extends TagsInputItem>({
  suggestions,
  onlySuggestionsValues = true,

  minChars = 1,
  maxSuggestions = 8,
  showInfo = true,

  onSuggestionSelect,
  renderSuggestion,
  onInputValueChange,

  value,
  defaultValue = [],
  onValueChange,
  onTagAdd,

  fieldRootRef,
  disabled,
  readOnly,
  maxTags,
  unique,

  ...props
}: SuggestionTagsInputProps<TTag>) => {
  const tagsInputRef = useRef<TagsInputRef>(null);

  const [innerTags, setInnerTags] = useState<TTag[]>(defaultValue);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState(false);

  const isControlled = value !== undefined;
  const tags = isControlled ? value : innerTags;

  const filteredSuggestions = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (search.length < minChars || disabled || readOnly) {
      return [];
    }

    if (maxTags && tags.length >= maxTags) {
      return [];
    }

    return suggestions
      .filter((suggestion) => {
        if (suggestion.disabled) return false;

        const alreadySelected = tags.some((tag) => {
          if (tag.id === suggestion.id) return true;

          return unique && tag.value === suggestion.value;
        });

        if (alreadySelected) return false;

        return (
          suggestion.label.toLowerCase().includes(search) ||
          suggestion.value.toLowerCase().includes(search)
        );
      })
      .slice(0, maxSuggestions);
  }, [suggestions, tags, query, minChars, maxSuggestions, disabled, readOnly, maxTags, unique]);

  const updateTags = (next: TTag[]) => {
    if (!isControlled) {
      setInnerTags(next);
    }

    onValueChange?.(next);
  };

  const handleSuggestionSelect = (index: string) => {
    const suggestion = filteredSuggestions[Number(index)];

    if (!suggestion) return;

    updateTags([...tags, suggestion]);

    onTagAdd?.(suggestion);
    onSuggestionSelect?.(suggestion);

    setQuery('');
    setOpened(false);

    tagsInputRef.current?.clearInput();
    tagsInputRef.current?.focusInput();
  };

  const handleInputValueChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setOpened(Boolean(nextQuery.trim()));

    onInputValueChange?.(nextQuery);
  };

  return (
    <Dropdown
      shouldUnregister
      closeOnEscape
      autoFocusOption={false}
      open={opened && filteredSuggestions.length > 0}
      onOpenChange={setOpened}
      onValueChange={handleSuggestionSelect}
      invokeOnly
      returnFocusOnOptionPick
      typeahead={false}
    >
      <Dropdown.Trigger
        render={({ ref, content }) => {
          const { focusFirst } = content.focusableList;

          return (
            <TagsInput<TTag>
              {...props}
              // inputEnabled={!onlySuggestionsValues}
              ref={tagsInputRef}
              fieldRootRef={mergeRefs(ref, fieldRootRef)}
              value={tags}
              onValueChange={updateTags}
              onTagAdd={onTagAdd}
              disabled={disabled}
              readOnly={readOnly}
              maxTags={maxTags}
              unique={unique}
              onInputValueChange={handleInputValueChange}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  focusFirst(true);
                }
              }}
            />
          );
        }}
      />

      <Dropdown.Content>
        {showInfo && (
          <Text px={3} variant="body-sm" emphasis="muted">
            {filteredSuggestions.length} of {suggestions.length}
          </Text>
        )}

        <Dropdown.List key={filteredSuggestions.map((tag) => String(tag.id)).join('|')}>
          {filteredSuggestions.map((suggestion, index) => (
            <Dropdown.Option key={suggestion.id} value={String(index)}>
              {renderSuggestion ? renderSuggestion(suggestion) : suggestion.label}
            </Dropdown.Option>
          ))}
        </Dropdown.List>
      </Dropdown.Content>
    </Dropdown>
  );
};

export { SuggestionTagsInput };

export type { SuggestionTagsInputProps };