import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import styles from './styles.module.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.array.isRequired,
    keyExtractor: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    emptyComponent: PropTypes.elementType,
};

const defaultProps = {
    className: '',
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
            className,
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

    render() {
        const { 
            data,
            className,
        } = this.props;

        const Item = this.renderItem;

        const EmptyComponent = this.renderEmptyComponent;

        return (
            <div className={cs(styles.list, className)}>
            {
                data.length?
                (
                    data.map(item => {
                        return this.renderItem({item});
                    })
                ):
                <EmptyComponent />
            }
            </div>
        );
    }
}
