import React, {PureComponent, forwardRef} from 'react';
import PropTypes from 'prop-types';

import {throttle, transformToElement} from '../../utils';
import styles from './styles.module.scss';

const ElementOrElementType = PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.elementType,
]);

const propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    classNameItem: PropTypes.string,
    contentContainerClassName: PropTypes.string,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    onEndReachedThreshold: PropTypes.number,
    onEndReached: PropTypes.func,
    onClick: PropTypes.func,
    onItemClick: PropTypes.func,
    component: PropTypes.any,
    EmptyComponent: ElementOrElementType,
    LoadingComponent: ElementOrElementType,
    HeaderComponent: ElementOrElementType,
    FooterComponent: ElementOrElementType,
    forwardRef: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]),
};

const defaultProps = {
    className: '',
    loading: false,
    onEndReachedThreshold: 10,
    component: 'div',
};

class List extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.ref = this.props.forwardRef || React.createRef();
    }

    renderItem = ({item, index}) => {
        const {
            className: _className, // eslint-disable-line no-unused-vars
            classNameItem: className,
            renderItem: _renderItem,
            data, // eslint-disable-line no-unused-vars
            onClick: _onClick, // eslint-disable-line no-unused-vars
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
            EmptyComponent,
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
            LoadingComponent,
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
            loading,
            onEndReached,
            onEndReachedThreshold,
        } = this.props;

        const element = this.ref.current;
        const distanceFromEnd = element.scrollHeight - element.scrollTop - element.offsetHeight;

        if(onEndReachedThreshold > distanceFromEnd) {
            !loading && onEndReached();
        }
    }, 200, {leading: false, trailing: true});

    render() {
        const {
            data,
            className,
            style,
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
                    style={style}
                    {...props}
                >
                    {children}            
                </Component>
                {FooterComponent && transformToElement(FooterComponent)}
            </ContainerComponent>
        );
    }
}

export default forwardRef((props, ref) => <List {...props} forwardRef={ref} />);
