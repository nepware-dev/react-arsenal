import React from 'react';
import PropTypes from 'prop-types';

import {IoClose} from 'react-icons/io5';
import {IoSearchOutline} from 'react-icons/io5';
import {FiChevronDown} from 'react-icons/fi';

import Icon from '../../../Icon';
import List from '../../../List';
import cs from '../../../../cs';

import styles from './styles.module.scss';

export const Label = ({
    item,
    valueExtractor,
    editable,
    onRemove,
}) => {

    const value = valueExtractor(item);

    const onCloseClick = (event) => {
        event.stopPropagation();
        onRemove({item});
    };

    return (
        <div
            className={styles.value}
            title={item.value}
        >
            <div className={styles.label}>{value}</div>
            {editable &&
                <div className={styles.close}>
                    <IoClose
                        className={styles.icon}
                        onClick={onCloseClick}
                    />
                </div>
            }
        </div>
    );
};


const SelectControl = ({
    placeholder,
    controlClassName,
    expanded,
    selectedItems,
    loading,
    handleCaretClick,
    keyExtractor,
    valueExtractor,
    onItemRemove,
    maxItems=50,
    editable,
    renderControlLabel,
}) => {

    const spillOverCount = selectedItems.length-maxItems;

    return (
        <div
            className={cs(
                styles.selectControl,
                'select-control',
                controlClassName,
                [styles.expanded, expanded],
                [styles.editable, editable],
                ['select-control-editable', editable],
            )}
            onClick={handleCaretClick}
        >
            <div
                className={cs(
                    styles.selectValue,
                    'select-value',
                    ['select-value-editable', editable],
                )}
            >
                {selectedItems.length? (
                    <>
                    <List
                        className={cs(styles.values, 'values')}
                        data={selectedItems.slice(0, maxItems)}
                        renderItem={renderControlLabel || Label}
                        valueExtractor={valueExtractor}
                        keyExtractor={keyExtractor}
                        editable={editable}
                        onRemove={onItemRemove}
                    />
                    {spillOverCount>0 && (
                        <div className={styles.othersText}>
                            +{spillOverCount} other{spillOverCount>1?'s':''}
                        </div>
                    )}
                    </>
                ):(
                    <div className={styles.placeholder}>{placeholder}</div>
                )}
            </div>
            <div className={cs(styles.selectIndicator, 'select-indicator')}>
                {loading && (
                    <Icon name="fas fa-spinner fa-spin" className={styles.loading} />
                )}
                <FiChevronDown size={16} onClick={handleCaretClick} />
            </div>
        </div>
    );
};

export default SelectControl;
