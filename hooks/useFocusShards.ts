import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

export interface FocusShardRegistry {
    /**
     * Registers a node that renders outside the owning focus trap's DOM subtree - typically a
     * portalled popup - as a `react-focus-lock` shard, so the trap counts focus landing inside
     * that node as focus inside itself instead of pulling it back.
     *
     * Returns an unregister function.
     */
    registerFocusShard: (node: HTMLElement) => () => void;
}

export const FocusShardContext = createContext<FocusShardRegistry | null>(null);

// For focus trap owners: collects shard nodes from portalled descendants and forwards them to enclosing traps.
export function useFocusShardHost() {
    const enclosingRegistry = useContext(FocusShardContext);
    const [shards, setShards] = useState<HTMLElement[]>([]);

    const registerFocusShard = useCallback(
        (node: HTMLElement) => {
            setShards((prev) => (prev.includes(node) ? prev : [...prev, node]));
            const unregisterFromEnclosing = enclosingRegistry?.registerFocusShard(node);

            return () => {
                setShards((prev) => prev.filter((shard) => shard !== node));
                unregisterFromEnclosing?.();
            };
        },
        [enclosingRegistry],
    );

    const registry = useMemo<FocusShardRegistry>(() => ({ registerFocusShard }), [registerFocusShard]);

    return { shards, registry };
}

// Used by portalled content: keeps `node` registered as a shard of every enclosing focus trap.
export function useFocusShard(node: HTMLElement | null) {
    const enclosingRegistry = useContext(FocusShardContext);

    useEffect(() => {
        if (!node || !enclosingRegistry) {
            return;
        }
        return enclosingRegistry.registerFocusShard(node);
    }, [node, enclosingRegistry]);
}
