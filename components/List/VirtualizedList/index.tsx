import React, { useCallback, useRef, useState } from 'react';

import styles from './styles.module.scss';
import { useVirtualizer, VirtualItem } from './useVirtualizer';
import BaseList from '../BaseList';
import type { KeyExtractor, ListRenderItem, ListProps } from '../types';
import cs from '../../../cs';

const virtualItemKeyExtractor: KeyExtractor<VirtualItem<unknown>> = (item) => item.key;

const VirtualizedList = <T,>(props: ListProps<T>) => {
    const {
        data,
        renderItem,
        keyExtractor,
        ref,
        horizontal = false,
        component: Component = 'div',
        overscan = 3,
        virtualContainerClassName,
        ...restProps
    } = props;

    const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
    const [itemsContainerNode, setItemsContainerNode] = useState<HTMLDivElement | null>(null);

    const { virtualItems, topSpacerSize, bottomSpacerSize, measureRef } = useVirtualizer({
        data,
        keyExtractor,
        scrollElement: scrollNode,
        itemsContainer: itemsContainerNode,
        overscan,
        horizontal,
    });

    const containerConfigRef = useRef({ topSpacerSize, bottomSpacerSize, horizontal, Component });
    containerConfigRef.current = { topSpacerSize, bottomSpacerSize, horizontal, Component };

    const refCallback = useCallback((node: HTMLDivElement | null) => {
        setScrollNode(node);

        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    },[ref]);

    const handleRenderVirtualizedList: ListRenderItem<VirtualItem<T>> = useCallback(
        ({ item, ...restProps }) => (
            <div
                ref={measureRef(item.key)}
                className={cs(styles.virtualizedItem, { [styles.virtualizedItemHorizontal]: horizontal })}
            >
                {renderItem({ ...restProps, item: item.data, index: item.index })}
            </div>
        ),
        [horizontal, renderItem, measureRef],
    );

    const VirtualizedListContainer = useCallback(
        ({ children, ...restProps }: { children: React.ReactNode } & Record<string, unknown>) => {
            const { topSpacerSize, bottomSpacerSize, horizontal, Component } = containerConfigRef.current;
            return (
                <Component {...restProps}>
                    <div
                        ref={setItemsContainerNode}
                        className={cs(styles.virtualizedItems, virtualContainerClassName, {
                            [styles.virtualizedItemsHorizontal]: horizontal,
                        })}
                    >
                        {topSpacerSize > 0 && (
                            <div
                                className={styles.virtualizedSpacer}
                                style={horizontal ? { width: topSpacerSize } : { height: topSpacerSize }}
                            />
                        )}
                        {children}
                        {bottomSpacerSize > 0 && (
                            <div
                                className={styles.virtualizedSpacer}
                                style={horizontal ? { width: bottomSpacerSize } : { height: bottomSpacerSize }}
                            />
                        )}
                    </div>
                </Component>
            );
        },
        [virtualContainerClassName],
    );

    return (
        <BaseList
            data={virtualItems}
            ref={refCallback}
            keyExtractor={virtualItemKeyExtractor}
            renderItem={handleRenderVirtualizedList}
            component={VirtualizedListContainer}
            {...restProps}
        />
    );
};

export default VirtualizedList;
