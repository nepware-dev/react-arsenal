import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import styles from './styles.module.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    emptyComponent: PropTypes.elementType,
    loadingComponent: PropTypes.elementType,
};

const defaultProps = {
    className: '',
    loading: false,
};

export default class List extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderItem = ({item}) => {
        const { 
            className: _className, // ignore
            classNameItem: className,
            renderItem: _renderItem,
            keyExtractor,
            data, // ignore
            onClick: _onClick, // ignore
            onItemClick: onClick,
            ...otherProps
        } = this.props;

        const Item = item.render || _renderItem;

        const key = keyExtractor(item);

        return (
            <Item
                key={key}
                item={item}
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
            return <EmptyComponent />;
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
            return <LoadingComponent />;
        } else {
            return (
                <div className={styles.loading}>
                    Loading...
                </div>
            );
        }
    }

    render() {
        const { 
            data,
            className,
            loading,
        } = this.props;

        const Item = this.renderItem;

        const EmptyComponent = this.renderEmptyComponent;
        const LoadingComponent = this.renderLoadingComponent;

        const children = [];

        if(loading) {
            children.push(<LoadingComponent />);
        } else if(!data.length) {
            children.push(<EmptyComponent />);
        } else {
            data.forEach(item => {
                children.push(this.renderItem({item}));
            });
        }

        return (
            <div className={className}>
                {children}
            </div>
        );
    }
}
