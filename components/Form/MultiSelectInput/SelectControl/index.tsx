import React, { useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import { FiChevronDown } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

import styles from './styles.module.scss';
import type { LabelProps, SelectControlProps } from './types';
import List, { type ListRenderItem } from '../../../List';
import cs from '../../../../cs';

export function Label<T, V extends React.ReactNode>({ item, valueExtractor, editable, onRemove }: LabelProps<T, V>) {
    const label = valueExtractor(item);

    const title = typeof label === 'string' ? label : '';

    const onCloseClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onRemove({ item });
    };

    return (
        <div data-testid={`selected-item-${label}`} className={styles.value} title={title}>
            <div className={styles.label}>{label}</div>
            {editable && (
                <div className={styles.close} onClick={onCloseClick}>
                    <IoClose className={styles.icon} />
                </div>
            )}
        </div>
    );
}

function SelectControl<T, V extends React.ReactNode>({
    placeholder,
    controlClassName,
    expanded,
    selectedItems,
    loading,
    handleCaretClick,
    keyExtractor,
    valueExtractor,
    onItemRemove,
    maxItems = 50,
    editable,
    renderControlLabel,
}: SelectControlProps<T, V>) {
    const spillOverCount = selectedItems.length - maxItems;

    const renderDefaultLabel: ListRenderItem<T> = useCallback(
        ({ item }) => {
            return (
                <Label
                    item={item}
                    valueExtractor={valueExtractor}
                    editable={editable}
                    onRemove={onItemRemove}
                />
            );
        },
        [editable, onItemRemove, valueExtractor],
    );
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
            tabIndex={-1}
            onClick={handleCaretClick}
        >
            <div
                className={cs(styles.selectValue, 'select-value', [
                    'select-value-editable',
                    editable,
                ])}
            >
                {selectedItems.length ? (
                    <>
                        <List
                            className={cs(styles.values, 'values')}
                            data={selectedItems.slice(0, maxItems)}
                            renderItem={renderControlLabel || renderDefaultLabel}
                            keyExtractor={keyExtractor}
                        />
                        {spillOverCount > 0 && (
                            <div className={styles.othersText}>
                                +{spillOverCount} other{spillOverCount > 1 ? 's' : ''}
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.placeholder}>{placeholder}</div>
                )}
            </div>
            <div className={cs(styles.selectIndicator, 'select-indicator')}>
                {loading && <FaSpinner className={styles.loading} />}
                <FiChevronDown size={16} onClick={handleCaretClick} />
            </div>
        </div>
    );
}

export default SelectControl;
