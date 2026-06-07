type FocusDirection = 1 | -1;

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export const getFocusableElements = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
    );

export const focusRelativeToElement = (
    element: HTMLElement | null,
    direction: FocusDirection = 1,
) => {
    if (!element) {
        return false;
    }

    const focusableElements = getFocusableElements();

    const index = focusableElements.indexOf(element);

    if (index === -1) {
        return false;
    }

    const nextElement = focusableElements[index + direction];

    if (!nextElement) {
        return false;
    }

    nextElement.focus();

    return true;
};
