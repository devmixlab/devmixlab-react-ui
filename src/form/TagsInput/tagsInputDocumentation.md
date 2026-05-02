# TagsInput

Advanced token/tag input component with keyboard navigation, editing, selection, and controlled/uncontrolled support.

---

## 🧠 Mental Model

This component behaves like a **text editor for tokens**.

* Tags act like characters
* Cursor position is logical, not tied directly to array index
* All operations are based on:

    * **targetIndex** → what gets deleted
    * **index (activeId)** → where the cursor is
    * **nextIndex** → where the cursor resolves after mutation

---

## ✨ Features

* Add / remove / edit tags
* Keyboard navigation (← →)
* Backspace / Delete behavior
* Multi-select (Shift + arrows)
* Select all (Ctrl/Cmd + A)
* Editable tags (double click / Enter)
* Disabled tags support
* Controlled and uncontrolled modes
* Custom rendering via `renderTag`
* Validation hooks (length, duplicates)
* Paste parsing (multi-tag input)

---

## ⚙️ Props

### Value Control

| Prop            | Type             | Description                 |
| --------------- | ---------------- | --------------------------- |
| `value`         | `TagItem[]`      | Controlled tags             |
| `defaultValue`  | `TagItem[]`      | Initial tags (uncontrolled) |
| `onValueChange` | `(tags) => void` | Fired on any change         |

---

### Tag Behavior

| Prop           | Type                                 | Description        |
| -------------- | ------------------------------------ | ------------------ |
| `editable`     | `boolean \| (tag, index) => boolean` | Enable editing     |
| `unique`       | `boolean`                            | Prevent duplicates |
| `normalizeTag` | `(label) => string`                  | Normalize value    |
| `renderTag`    | `(params) => ReactNode`              | Custom tag render  |

---

### Events

| Prop           | Description                    |
| -------------- | ------------------------------ |
| `onTagAdd`     | Called when tag is added       |
| `onTagRemove`  | Called when tag is removed     |
| `onDuplicate`  | Called when duplicate detected |
| `onInvalidTag` | Called when invalid input      |

---

### UI / Layout

| Prop                         | Description       |
| ---------------------------- | ----------------- |
| `start`                      | Start slot        |
| `actions`                    | End actions slot  |
| `clearable`                  | Show clear button |
| `onClearAll`                 | Clear all handler |
| `size`, `variant`, `rounded` | Visual props      |

---

### Limits

| Prop        | Description            |
| ----------- | ---------------------- |
| `maxTags`   | Maximum number of tags |
| `maxLength` | Max label length       |
| `separator` | Input split regex      |

---

## 🧱 TagItem

```ts
type TagItem = {
  id?: string | number;
  label: string;
  value: string;
  disabled?: boolean;
};
```

---

## ⌨️ Keyboard Behavior

### Navigation

| Key            | Behavior                     |
| -------------- | ---------------------------- |
| ←              | Move to previous enabled tag |
| →              | Move to next enabled tag     |
| ← (from input) | Focus last enabled tag       |

* Disabled tags are **skipped**
* If no tag exists → focus returns to input

---

### Deletion

#### Backspace

* Deletes nearest enabled tag to the **left**
* Does NOT delete current tag if nothing exists on the left
* Cursor remains in same logical position

#### Delete

* Deletes nearest enabled tag to the **right**
* Cursor remains in same logical position

---

### Selection

| Key           | Behavior         |
| ------------- | ---------------- |
| Shift + ← / → | Expand selection |
| Ctrl/Cmd + A  | Select all       |

* Disabled tags are preserved during deletion

---

### Editing

| Key              | Behavior    |
| ---------------- | ----------- |
| Enter            | Commit edit |
| Ctrl/Cmd + Enter | Cancel edit |
| Blur             | Commit edit |

---

## 🚫 Disabled Tags

Disabled tags:

* Cannot be focused
* Cannot be deleted
* Are skipped during navigation
* Are preserved during selection delete

---

## 🔁 Controlled vs Uncontrolled

### Uncontrolled

* Internal state is used
* IDs are automatically generated

### Controlled ⚠️

You **must provide stable IDs**

```ts
type TagItem = {
  id: string | number; // required for controlled mode
}
```

❗ If IDs are not stable:

* focus will break
* keyboard navigation will break
* refs will desync

---

## 🧠 State & Behavior Rules

* Always compute updates from **next state**, not current state
* Component does NOT sort tags
* Parent controls ordering in controlled mode
* IDs are the source of truth (never rely on index)

---

## 🎯 Usage Examples

### Basic

```tsx
<TagsInput />
```

---

### Controlled

```tsx
const [tags, setTags] = useState<TagItem[]>(initial);

<TagsInput
  value={tags}
  onValueChange={setTags}
/>
```

---

### With Validation

```tsx
<TagsInput
  unique
  maxLength={10}
  onInvalidTag={(tag, reason) => {
    console.log(reason);
  }}
/>
```

---

### Custom Tag

```tsx
<TagsInput
  renderTag={({ tag, remove }) => (
    <div>
      #{tag.value}
      <button onClick={remove}>x</button>
    </div>
  )}
/>
```

---

## ⚠️ Important Notes

* Do not sort tags inside the component
* Do not mutate tags directly
* Do not rely on index for identity
* Always use stable `id` in controlled mode

---

## 🧩 Design Notes

* Focus is controlled manually (no sync effect)
* Refs are mapped by `id`
* Navigation resolves via `id → index`
* Component behaves like a token-based editor

---

## 🚀 Summary

This component provides a **fully keyboard-driven tag input system** with predictable behavior, stable focus management, and flexible integration for controlled applications.
