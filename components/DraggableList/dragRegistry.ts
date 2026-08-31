import type { ItemKey } from './types';

/**
 * Native drag and drop allows one drag at a time for the whole document, so the
 * lists of a `group` coordinate through this module-level external store rather
 * than through React context. Every mutation notifies, and the getters are the
 * snapshots `useSyncExternalStore` reads, so they must stay referentially stable
 * between mutations.
 */

export type ActiveDrag = {
    group: string;
    itemKey: ItemKey;
    item: unknown;
    /** Identifies the list instance the item is being dragged out of. */
    sourceId: symbol;
    /**
     * Fires the source list's 'remove' change from its latest props and reports
     * the index and the item it removed, or null when it no longer holds the key.
     */
    commitRemove: () => { from: number; item: unknown } | null;
};

let activeDrag: ActiveDrag | null = null;
/** The list instance currently showing the dragged item in its preview. */
let receiverId: symbol | null = null;

const listeners = new Set<() => void>();

const notify = () => {
    listeners.forEach((listener) => listener());
};

const dragRegistry = {
    start(drag: ActiveDrag) {
        activeDrag = drag;
        receiverId = null;
        notify();
    },
    get: () => activeDrag,
    getReceiverId: () => receiverId,
    setReceiver(id: symbol | null) {
        if (receiverId === id) {
            return;
        }
        receiverId = id;
        notify();
    },
    clear() {
        if (!activeDrag && receiverId === null) {
            return;
        }
        activeDrag = null;
        receiverId = null;
        notify();
    },
    subscribe(listener: () => void) {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    },
};

export default dragRegistry;
