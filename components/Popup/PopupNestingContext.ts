import { createContext } from 'react';

export type PopupContainsNode = (node: Node) => boolean;

export interface PopupNestingContextValue {
    /**
     * Registers a descendant popup so the ancestor can treat clicks landing inside it as inside
     * itself. Descendant popups portal outside the ancestor wrapper, so DOM containment alone
     * cannot answer that question. Returns an unregister function.
     */
    registerNestedPopup: (containsNode: PopupContainsNode) => () => void;
}

const PopupNestingContext = createContext<PopupNestingContextValue | null>(null);

export default PopupNestingContext;
