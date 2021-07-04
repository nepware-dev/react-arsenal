import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {throttle, transformToElement} from '../../utils';
import styles from './styles.module.scss';

const ElementOrElementType = PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.elementType,
]);

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    onEndReachedThreshold: PropTypes.number,
    onEndReached: PropTypes.func,
    component: PropTypes.any,
    EmptyComponent: ElementOrElementType,
    LoadingComponent: ElementOrElementType,
    HeaderComponent: ElementOrElementType,
    FooterComponent: ElementOrElementType,
};

const defaultProps = {
    className: '',
    loading: false,
    onEndReachedThreshold: 10,
    component: 'div',
};

export default class List extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    renderItem = ({item, index}) => {
        const {
            className: _className, // ignore
            classNameItem: className,
            renderItem: _renderItem,
            data, // ignore
            onClick: _onClick, // ignore
            onItemClick: onClick,
            ...otherProps
        } = this.props;

        const Item = item.render || _renderItem;


        return (
            <Item
                item={item}
                index={index}
                className={className}
                onClick={onClick}
                {...otherProps}
            />
        );
    }

    renderEmptyComponent = () => {
        const {
            emptyComponent: EmptyComponent,
        } = this.props;
        if(EmptyComponent) {
            return transformToElement(EmptyComponent);
        } else {
            return (
                <div className={styles.empty}>
                    No item to display
                </div>
            );
        }
    }

    renderLoadingComponent = () => {
        const {
            loadingComponent: LoadingComponent,
        } = this.props;
        if(LoadingComponent) {
            return transformToElement(LoadingComponent);
        } else {
            return (
                <div className={styles.loading}>
                    Loading...
                </div>
            );
        }
    }

    onScroll = throttle((event) => {
        const {
            onEndReached,
            onEndReachedThreshold,
        } = this.props;

        const element = this.ref.current;
        const distanceFromEnd = element.scrollHeight - element.scrollTop - element.offsetHeight;

        if(onEndReachedThreshold > distanceFromEnd) {
            onEndReached();
        }
    }, 200, {leading: false, trailing: true});

    render() {
        const {
            data,
            className,
            loading,
            onEndReached,
            keyExtractor,
            component: Component,
            contentContainerClassName,
            HeaderComponent,
            FooterComponent
        } = this.props;

        const Item = this.renderItem;

        const EmptyComponent = this.renderEmptyComponent;
        const LoadingComponent = this.renderLoadingComponent;

        const children = [];

        if(loading) {
            children.push(<LoadingComponent key='loading' />);
        } else if(!data?.length) {
            children.push(<EmptyComponent key='empty' />);
        } else {
            data.forEach((item, index) => {
                const key = keyExtractor(item, index);
                children.push(<Item key={key} item={item} index={index} />);
            });
        }

        let ContainerComponent = React.Fragment;
        const containerProps = {};
        if(contentContainerClassName) {
            ContainerComponent = 'div';
            containerProps.className=contentContainerClassName;
        }

        const props = {};
        if(onEndReached) {
            props.onScroll = this.onScroll;
        }

        return (
            <ContainerComponent {...containerProps}>
                {HeaderComponent && transformToElement(HeaderComponent)}
                <Component
                    ref={this.ref}
                    className={className}
                    {...props}
                >
                    {children}            
                </Component>
                {FooterComponent && transformToElement(FooterComponent)}
            </ContainerComponent>
        );
    }
}
