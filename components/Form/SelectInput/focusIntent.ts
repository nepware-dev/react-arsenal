type FocusIntent = { kind: 'pointer'; target: Node | null } | { kind: 'keyboard' };

let pendingIntent: FocusIntent | null = null;
let expiryTimeout: ReturnType<typeof setTimeout> | null = null;
let observerCount = 0;

const clearIntent = () => {
    pendingIntent = null;
    if (expiryTimeout !== null) {
        clearTimeout(expiryTimeout);
        expiryTimeout = null;
    }
};

// The browser moves focus while still handling the gesture, so anything focused in a later task was not the user.
const armIntent = (intent: FocusIntent) => {
    clearIntent();
    pendingIntent = intent;
    expiryTimeout = setTimeout(clearIntent, 0);
};

const handlePointerDown = (event: MouseEvent) => {
    armIntent({ kind: 'pointer', target: event.target as Node | null });
};

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
        armIntent({ kind: 'keyboard' });
    }
};

// Records the pointer/keyboard gesture that a following focus event can be attributed to.
export function observeFocusIntent() {
    if (observerCount === 0) {
        document.addEventListener('mousedown', handlePointerDown, true);
        document.addEventListener('keydown', handleKeyDown, true);
    }
    observerCount += 1;

    return () => {
        observerCount -= 1;
        if (observerCount === 0) {
            document.removeEventListener('mousedown', handlePointerDown, true);
            document.removeEventListener('keydown', handleKeyDown, true);
            clearIntent();
        }
    };
}

// Whether focus on `wrapper` came from the user; consumes the gesture so one gesture opens at most one select.
export function consumeFocusIntent(wrapper: HTMLElement | null) {
    const intent = pendingIntent;
    clearIntent();

    if (!intent) {
        return false;
    }
    if (intent.kind === 'keyboard') {
        return true;
    }
    return !!wrapper && !!intent.target && wrapper.contains(intent.target);
}
