import {
    Children,
    Fragment,
    isValidElement,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import styles from './styles.module.scss';
import type { PanelGroupProps } from './types';
import PanelGroupContext, {
    PanelIndexContext,
    type PanelGroupContextType,
} from './PanelGroupContext';
import Panel from './Panel';
import PanelResizer from './PanelResizer';
import useDragSession from './useDragSession';
import usePanelObserver from './usePanelObserver';
import { isSameLayout, resizeLayout, toPercentages } from './layout';
import {
    getPanelConstraints,
    getPanelSizes,
    type PanelFlex,
    readPanelFlex,
    restorePanelFlex,
    setPanelGrowth,
} from './measure';
import cs from '../../cs';
import useControlledState from '../../hooks/useControlledState';

interface FlatPanel {
    key: string;
    element: ReactElement;
}

/*
 * `Children.toArray` does not look inside fragments, so one would collapse every panel
 * it holds onto a single index. Keys stay paths to survive the flattening.
 */
const flattenPanels = (nodes: ReactNode, prefix = ''): FlatPanel[] =>
    Children.toArray(nodes).flatMap((child, index) => {
        if (!isValidElement(child)) {
            return [];
        }
        const key = `${prefix}${child.key ?? index}`;

        return child.type === Fragment
            ? flattenPanels((child.props as PropsWithChildren).children, `${key}:`)
            : [{ key, element: child }];
    });

const isComplete = (elements: (HTMLElement | undefined)[]): elements is HTMLElement[] =>
    elements.every(Boolean);

const PanelGroup: React.FC<PanelGroupProps> = (props) => {
    const {
        children,
        direction = 'horizontal',
        layout,
        onLayout,
        className,
        resizerClassName,
        renderResizer,
        keyboardStep = 10,
        ref,
        ...otherProps
    } = props;

    const baseId = useId();
    const panelsRef = useRef(new Map<number, HTMLElement>());
    // The inline flex the panels carried before the group first wrote over it, which
    // is what a reset has to give back.
    const authorFlexRef = useRef<PanelFlex[] | null>(null);

    const [appliedLayout, setAppliedLayout] = useControlledState<number[] | undefined>(
        undefined,
        { value: layout, onChange: onLayout },
    );
    const [measuredLayout, setMeasuredLayout] = useState<number[]>();

    const panels = useMemo(() => flattenPanels(children), [children]);

    const getPanelId = useCallback((index: number) => `${baseId}-panel-${index}`, [baseId]);

    const registerPanel = useCallback((index: number, el: HTMLElement | null) => {
        if (el) {
            panelsRef.current.set(index, el);
        } else {
            panelsRef.current.delete(index);
        }
    }, []);

    /*
     * Every panel or none: children are indexed by position, so a child that renders no
     * panel would leave every index behind it against the wrong element. Registrations
     * cover 0..size-1 only when none of them is missing.
     */
    const getPanelElements = useCallback((): HTMLElement[] | null => {
        const registry = panelsRef.current;
        const elements = Array.from({ length: registry.size }, (_, index) => registry.get(index));

        return isComplete(elements) ? elements : null;
    }, []);

    const commitLayout = useCallback(
        (pixelSizes: number[]) => setAppliedLayout(toPercentages(pixelSizes)),
        [setAppliedLayout],
    );

    const captureAuthorFlex = useCallback((elements: HTMLElement[]) => {
        if (!authorFlexRef.current) {
            authorFlexRef.current = readPanelFlex(elements);
        }
    }, []);

    const { resizingIndex, startResize, moveResize, endResize, cancelResize } = useDragSession({
        direction,
        getElements: getPanelElements,
        onStart: captureAuthorFlex,
        onCommit: commitLayout,
    });

    /*
     * CSS minimums and maximums clamp the growth the group writes, so what a panel asks
     * for and what it renders at differ. The separators report the second one.
     */
    const measurePanels = useCallback(() => {
        const elements = getPanelElements();

        if (!elements || resizingIndex !== null) {
            return;
        }
        const percentages = toPercentages(getPanelSizes(elements, direction));

        setMeasuredLayout((prev) => (isSameLayout(prev, percentages) ? prev : percentages));
    }, [direction, getPanelElements, resizingIndex]);

    const observePanels = usePanelObserver(measurePanels);

    /*
     * The one place `appliedLayout` reaches the panels. Keeping it out of the panel
     * style prop leaves React owning nothing but the author's own sizing, so a reset
     * can hand that back intact and a controlled group that declines the layout a drag
     * reported gets its own value re-asserted over whatever the drag left behind.
     */
    const syncPanels = useCallback(() => {
        if (resizingIndex !== null) {
            return;
        }
        const elements = getPanelElements();

        if (!elements) {
            return;
        }
        let wrote = false;

        // A layout that does not describe every panel describes none of them: applied
        // as far as it goes, it would leave the rest on a zero basis with a stale growth.
        if (appliedLayout?.length === elements.length) {
            captureAuthorFlex(elements);
            wrote = setPanelGrowth(elements, appliedLayout);
        }
        const observed = observePanels(elements);

        // Reading the panels back is a forced reflow, worth it only when the group moved
        // something itself, or when nothing is watching for the moves it did not cause.
        if (wrote || !observed || !measuredLayout) {
            measurePanels();
        }
    }, [
        appliedLayout,
        captureAuthorFlex,
        getPanelElements,
        measuredLayout,
        measurePanels,
        observePanels,
        resizingIndex,
    ]);

    // Every commit, because neither the panel elements nor their own styles are ours
    // to track: reordering or restyling has to end with the DOM matching the layout.
    useLayoutEffect(syncPanels);

    const nudge = useCallback(
        (index: number, steps: number) => {
            const elements = getPanelElements();

            if (!elements || elements.length < 2) {
                return;
            }
            const constraints = getPanelConstraints(elements, direction);
            const total = constraints.reduce((sum, { size }) => sum + size, 0);

            commitLayout(resizeLayout(constraints, index, steps * (keyboardStep / 100) * total));
        },
        [commitLayout, direction, getPanelElements, keyboardStep],
    );

    const reset = useCallback(() => {
        const elements = getPanelElements();

        if (!elements) {
            return;
        }
        restorePanelFlex(elements, authorFlexRef.current);
        authorFlexRef.current = null;
        setAppliedLayout(undefined);
    }, [getPanelElements, setAppliedLayout]);

    const context = useMemo<PanelGroupContextType>(
        () => ({
            direction,
            reported: measuredLayout,
            resizingIndex,
            resizerClassName,
            renderResizer,
            getPanelId,
            registerPanel,
            startResize,
            moveResize,
            endResize,
            cancelResize,
            nudge,
            reset,
        }),
        [
            direction,
            measuredLayout,
            resizingIndex,
            resizerClassName,
            renderResizer,
            getPanelId,
            registerPanel,
            startResize,
            moveResize,
            endResize,
            cancelResize,
            nudge,
            reset,
        ],
    );

    return (
        <PanelGroupContext.Provider value={context}>
            <div
                {...otherProps}
                ref={ref}
                className={cs(styles.group, styles[direction], className, {
                    [styles.groupResizing]: resizingIndex !== null,
                })}
            >
                {panels.map(({ key, element }, index) => (
                    <Fragment key={key}>
                        {index > 0 && <PanelResizer index={index - 1} />}
                        <PanelIndexContext.Provider value={index}>
                            {element}
                        </PanelIndexContext.Provider>
                    </Fragment>
                ))}
            </div>
        </PanelGroupContext.Provider>
    );
};

PanelGroup.displayName = 'PanelGroup';

export default PanelGroup;

export { Panel };
export * from './types';
