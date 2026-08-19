import React, {
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';

import styles from './styles.module.scss';
import type {
    ListRenderItemProps,
    KeyExtractor,
    ListRenderItem,
    ListProps,
    ListRefHandle,
    ListScrollOptions,
} from './types';
import { throttle, transformToElement } from '../../utils';

const List = <T,>(props: ListProps<T>) => {
    const {
        data,
        renderItem: _renderItem,
        keyExtractor,
        className = '',
        contentContainerClassName,
        style,
        ref: _ref,
        containerRef,
        component: Component = 'div',
        loading = false,
        LoadingComponent: _LoadingComponent,
        EmptyComponent: _EmptyComponent,
        HeaderComponent,
        FooterComponent,
        onEndReachedThreshold = 10,
        onEndReached,
        onItemClick,
    } = props;

    const ref = containerRef || _ref;

    const listRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef(data);
    dataRef.current = data;

    const handleItemScroll = useMemo(
        () =>
            throttle(
                () => {
                    const element = listRef.current;

                    if (!element) return;

                    const distanceFromEnd =
                        element.scrollHeight -
                        element.scrollTop -
                        element.offsetHeight;

                    if (onEndReachedThreshold > distanceFromEnd) {
                        if (!loading && onEndReached) {
                            onEndReached();
                        }
                    }
                },
                200,
                { leading: false, trailing: true },
            ),
        [loading, onEndReachedThreshold, onEndReached],
    );

    const renderItem = useCallback(
        (item: T, index: number) => {
            const key = keyExtractor(item, index);

            const {
                className: _className,
                classNameItem: className,
                renderItem: _renderItem,
                data: _data,
                onClick: _onClick,
                onItemClick: onClick,
                ...otherProps
            } = props;

            // @ts-ignore: Item may have its own render method
            const listRenderItem = item?.render || _renderItem;

            // TODO: Only send ListRenderItemProps as props
            const listItem = listRenderItem({
                item,
                index,
                className,
                onClick,
                ...otherProps,
            });

            return <React.Fragment key={key}>{listItem}</React.Fragment>;
        },
        [props, onItemClick, _renderItem, keyExtractor],
    );

    const LoadingComponent = useMemo(() => {
        if (_LoadingComponent) {
            return () => transformToElement(_LoadingComponent);
        }
        return DefaultLoadingComponent;
    }, [_LoadingComponent]);

    const EmptyComponent = useMemo(() => {
        if (_EmptyComponent) {
            return () => transformToElement(_EmptyComponent);
        }

        return DefaultEmptyComponent;
    }, [_EmptyComponent]);

    const handleRenderList = useCallback(() => {
        if (data.length === 0) {
            if (loading) {
                return <LoadingComponent key="loading" />;
            }
            return <EmptyComponent key="empty" />;
        }
        const renderedList = data.map(renderItem);
        if (loading && onEndReached) {
            renderedList.push(<LoadingComponent key="loading" />);
        }
        return renderedList;
    }, [
        loading,
        EmptyComponent,
        LoadingComponent,
        data,
        renderItem,
        onEndReached,
    ]);

    const [ContainerComponent, containerProps] = useMemo(() => {
        if (contentContainerClassName) {
            return ['div', { className: contentContainerClassName }];
        }
        return [React.Fragment, {}];
    }, [contentContainerClassName]);

    const [ListComponent, componentProps]: [
        React.ElementType,
        Record<string, unknown>,
    ] = useMemo(() => {
        if (Component === React.Fragment) {
            const hasComponentProps = className || ref || style || onEndReached;

            if (hasComponentProps) {
                console.warn(
                    'List: You cannot use className, style, ref, or onEndReached when using React.Fragment as the component. Please wrap your list with a container element.',
                );
            }

            return [React.Fragment, {}];
        }

        const componentProps = {
            className,
            ref: listRef,
            style,
            onScroll: onEndReached ? handleItemScroll : undefined,
        };

        return [Component, componentProps];
    }, [Component, className, ref, style, handleItemScroll, onEndReached]);

    const handleScrollToIndex = useCallback(
        (index: number, options?: ListScrollOptions) => {
            const { offsetTop = 0, offsetLeft = 0, scrollBehavior = 'smooth' } = options || {};

            const listElement = listRef.current;
            if (!listElement) return;

            if (index < 0 || index >= dataRef.current.length) {
                console.warn(
                    `Index ${index} is out of bounds for data length ${dataRef.current.length}.`,
                );
                return;
            }

            const itemElement = listElement.children[index] as HTMLElement;
            if (!itemElement) {
                console.warn(`No item found at index ${index}.`);
                return;
            }

            const itemHeight = itemElement.offsetHeight;
            const itemWidth = itemElement.offsetWidth;

            const containerRect = listElement.getBoundingClientRect();
            const itemRect = itemElement.getBoundingClientRect();
            const itemTop =
                itemRect.top - containerRect.top + listElement.scrollTop;
            const itemLeft =
                itemRect.left - containerRect.left + listElement.scrollLeft;

            listElement.scrollTo({
                top: itemTop + itemHeight / 2 - listElement.clientHeight / 2 + offsetTop,
                left: itemLeft + itemWidth / 2 - listElement.clientWidth / 2 + offsetLeft,
                behavior: scrollBehavior,
            });
        },
        [],
    );

    const handleScrollToItem = useCallback(
        (key: string | number, options?: ListScrollOptions) => {
            const index = dataRef.current.findIndex(
                (item, itemIndex) => keyExtractor(item, itemIndex) === key,
            );

            if (index === -1) {
                console.warn(`No item found with key ${key}.`);
                return;
            }

            handleScrollToIndex(index, options);
        },
        [keyExtractor, handleScrollToIndex],
    );

    useImperativeHandle(ref, () => {
        const element = listRef.current;

        if (!element) return {} as ListRefHandle<T>;

        return Object.assign(element, {
            scrollToItem: handleScrollToItem,
            scrollToIndex: handleScrollToIndex,
        });
    }, [handleScrollToItem, handleScrollToIndex]);

    return (
        <ContainerComponent {...containerProps}>
            {HeaderComponent && transformToElement(HeaderComponent)}
            <ListComponent {...componentProps}>
                {handleRenderList()}
            </ListComponent>
            {FooterComponent && transformToElement(FooterComponent)}
        </ContainerComponent>
    );
};

function DefaultEmptyComponent() {
    return <div className={styles.empty}>No item to display</div>;
}

function DefaultLoadingComponent() {
    return <div className={styles.loading}>Loading...</div>;
}

export default List;
export type {
    ListRenderItemProps,
    KeyExtractor,
    ListRenderItem,
    ListProps,
    ListRefHandle,
};
