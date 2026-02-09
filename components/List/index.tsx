import React, { useCallback, useMemo, useRef } from 'react';

import styles from './styles.module.scss';
import type { ListRenderItemProps, KeyExtractor, ListRenderItem, ListProps } from './types';
import { getElement } from './utils';
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

    const innerRef = useRef<HTMLDivElement>(null);

    const ref = _ref || innerRef;

    const handleItemScroll = useMemo(
        () =>
            throttle(
                () => {
                    const element = getElement(ref);

                    if (!element) return;

                    const distanceFromEnd =
                        element.scrollHeight - element.scrollTop - element.offsetHeight;

                    if (onEndReachedThreshold > distanceFromEnd) {
                        if (!loading && onEndReached) {
                            onEndReached();
                        }
                    }
                },
                200,
                { leading: false, trailing: true },
            ),
        [loading, onEndReachedThreshold, ref, onEndReached],
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
            const listRenderItem = item.render || _renderItem;

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
        if (loading) {
            return <LoadingComponent key="loading" />;
        }
        if (data.length === 0) {
            return <EmptyComponent key="empty" />;
        }
        return data.map(renderItem);
    }, [loading, EmptyComponent, LoadingComponent, data, renderItem]);

    const [ContainerComponent, containerProps] = useMemo(() => {
        if (contentContainerClassName) {
            return ['div', { className: contentContainerClassName }];
        }
        return [React.Fragment, {}];
    }, [contentContainerClassName]);

    const [ListComponent, componentProps]: [React.ElementType, Record<string, unknown>] =
        useMemo(() => {
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
                ref,
                style,
                onScroll: onEndReached ? handleItemScroll : undefined,
            };

            return [Component, componentProps];
        }, [Component, className, ref, style, handleItemScroll, onEndReached]);

    return (
        <ContainerComponent {...containerProps}>
            {HeaderComponent && transformToElement(HeaderComponent)}
            <ListComponent {...componentProps}>{handleRenderList()}</ListComponent>
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
export type { ListRenderItemProps, KeyExtractor, ListRenderItem, ListProps };
