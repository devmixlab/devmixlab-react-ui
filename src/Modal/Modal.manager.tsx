/**
 * ModalManager
 *
 * Centralises the three pieces of cross-instance coordination that every Modal
 * instance previously managed independently against shared module-level variables:
 *
 *   1. Stack   — tracks open modal IDs in order; used to decide which modal owns
 *                the Escape key at any given moment.
 *
 *   2. Counter — counts how many modals are open; drives the body scroll-lock so
 *                it is applied on the first open and released on the last close.
 *
 *   3. Focus   — snapshots and restores the focused element per modal ID, so that
 *                nested modals closing in sequence each return focus to the right
 *                element regardless of how long they were open or what stole focus
 *                in between.
 *
 * All methods are synchronous and side-effect-free except where noted (scroll
 * lock writes to document.body.style, focus restoration calls .focus()).
 * The manager holds no React state — it is a plain singleton that Modal instances
 * call into from their useEffect hooks.
 */

class ModalManager {
    // ── Stack ──────────────────────────────────────────────────────────────

    private stack: number[] = [];

    push(id: number): void {
        this.stack.push(id);
    }

    remove(id: number): void {
        const index = this.stack.indexOf(id);
        if (index !== -1) this.stack.splice(index, 1);
    }

    isTop(id: number): boolean {
        return this.stack[this.stack.length - 1] === id;
    }

    // ── Scroll lock counter ────────────────────────────────────────────────

    private openCount = 0;

    acquire(): void {
        this.openCount += 1;
        if (this.openCount === 1) {
            document.body.style.overflow = 'hidden';
        }
    }

    release(): void {
        this.openCount -= 1;
        if (this.openCount === 0) {
            document.body.style.overflow = '';
        }
    }

    // ── Focus registry ─────────────────────────────────────────────────────

    private focusMap = new Map<number, HTMLElement | null>();

    /**
     * Snapshot whichever element currently has focus and associate it with
     * this modal ID. Call this the moment `opened` becomes true, before the
     * modal moves focus into itself.
     */
    captureFocus(id: number): void {
        this.focusMap.set(id, document.activeElement as HTMLElement | null);
    }

    /**
     * Return focus to the element that was active when this modal opened, then
     * remove the entry. A rAF is used so the call is safe to make before React
     * has finished unmounting the modal's DOM subtree.
     */
    restoreFocus(id: number): void {
        const target = this.focusMap.get(id) ?? null;
        this.focusMap.delete(id);

        requestAnimationFrame(() => {
            if (target && document.contains(target)) {
                target.focus();
            }
        });
    }
}

// Singleton — shared across all Modal instances in the same JS module scope,
// which is the same guarantee the previous module-level variables provided.
export const modalManager = new ModalManager();
