import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';

import styles from './styles.module.scss';
import type { SliderInputProps } from './types';
import useDrag from './useDrag';
import List, { type KeyExtractor, type ListRenderItem } from '../../List';
import cs from '../../../cs';
import useControlledState from '../../../hooks/useControlledState';
import { isArray } from '../../../utils';

const keyExtractor: KeyExtractor<string | number> = (item) => item;

const noop = () => {};

function getOffset(value: number, min: number, max: number) {
    return (value - min) / (max - min);
}

function getActiveTrackStyle(
    direction: 'rtl' | 'ltr' | 'ttb' | 'btt',
    value: number | number[],
    min: number,
    max: number,
) {
    let val: number[];
    if (isArray(value)) {
        val = value;
    } else {
        val = [min, value];
    }

    const startOffset = getOffset(val[0], min, max);
    const offset = getOffset(val[1] - val[0], min, max);

    const style: React.CSSProperties = {};

    switch (direction) {
        case 'rtl':
            style.right = `${startOffset * 100}%`;
            style.width = `${offset * 100}%`;
            style.height = '100%';
            break;
        case 'ltr':
            style.left = `${startOffset * 100}%`;
            style.width = `${offset * 100}%`;
            style.height = '100%';
            break;
        case 'ttb':
            style.top = `${startOffset * 100}%`;
            style.height = `${offset * 100}%`;
            style.width = '100%';
            break;
        default:
            style.bottom = `${startOffset * 100}%`;
            style.height = `${offset * 100}%`;
            style.width = '100%';
            break;
    }
    return style;
}

function getDirectionStyle(
    direction: 'rtl' | 'ltr' | 'ttb' | 'btt',
    value: number,
    min: number,
    max: number,
) {
    const offset = getOffset(value, min, max);

    const positionStyle: React.CSSProperties = {};

    switch (direction) {
        case 'rtl':
            positionStyle.right = `${offset * 100}%`;
            positionStyle.transform = 'translateX(50%) translateY(-50%)';
            break;
        case 'btt':
            positionStyle.bottom = `${offset * 100}%`;
            positionStyle.transform = 'translateY(50%) translateX(-50%)';
            break;
        case 'ttb':
            positionStyle.top = `${offset * 100}%`;
            positionStyle.transform = 'translateX(-50%) translateY(-50%)';
            break;
        default:
            positionStyle.left = `${offset * 100}%`;
            positionStyle.transform = 'translateX(-50%) translateY(-50%)';
            break;
    }

    return positionStyle;
}

const ThumbComponent: React.FC<{
    triggerChange: (val: number, idx: number) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    ref: React.RefObject<HTMLDivElement | null>;
    minValue: number;
    maxValue: number;
    step: number;
    index: number;
    controlledValue: number;
    direction: 'rtl' | 'ltr' | 'ttb' | 'btt';
    disabled?: boolean;
    showTooltip?: boolean;
    tooltipClassName?: string;
    tooltipValueExtractor: (value: number) => React.ReactNode;
    onDragging?: (idx: number) => void;
    isActive?: boolean;
    style?: React.CSSProperties;
    className?: string;
    tabIndex?: number;
}> = (props) => {
    const {
        triggerChange,
        containerRef,
        ref,
        minValue,
        maxValue,
        step,
        controlledValue,
        direction,
        style,
        index,
        disabled,
        showTooltip,
        tooltipClassName,
        tooltipValueExtractor,
        onDragging: onDragCallback,
        isActive,
        ...otherProps
    } = props;

    const positionStyle = useMemo(() => {
        return getDirectionStyle(direction, controlledValue, minValue, maxValue);
    }, [direction, controlledValue, minValue, maxValue]);

    const handleOffsetChange = useCallback(
        (offset: string | number) => {
            if (!disabled) {
                if (offset === 'min') {
                    return triggerChange(minValue, index);
                }
                if (offset === 'max') {
                    return triggerChange(maxValue, index);
                }
                if (offset === -1) {
                    return triggerChange(
                        controlledValue - step < minValue ? minValue : controlledValue - step,
                        index,
                    );
                }
                return triggerChange(
                    controlledValue + step > maxValue ? maxValue : controlledValue + step,
                    index,
                );
            }
        },
        [disabled, minValue, maxValue, step, controlledValue, index, triggerChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (!disabled) {
                let offset = null;
                switch (e.key) {
                    case 'ArrowLeft':
                        offset = direction === 'ltr' || direction === 'ttb' ? -1 : 1;
                        break;
                    case 'ArrowRight':
                        offset = direction === 'ltr' || direction === 'ttb' ? 1 : -1;
                        break;
                    case 'ArrowUp':
                        offset = direction === 'ttb' || direction === 'rtl' ? -1 : 1;
                        break;
                    case 'ArrowDown':
                        offset = direction === 'ttb' || direction === 'rtl' ? 1 : -1;
                        break;
                    case 'Home':
                        offset = 'min';
                        break;
                    case 'End':
                        offset = 'max';
                        break;
                }
                if (offset !== null) {
                    e.preventDefault();
                    handleOffsetChange(offset);
                }
            }
        },
        [disabled, direction, handleOffsetChange],
    );

    const handleDragChange = useCallback(
        (dragOffset: number) => {
            const nextValue = controlledValue + dragOffset * (maxValue - minValue);
            const newVal = Math.round(nextValue / step) * step;
            triggerChange(newVal, index);
        },
        [controlledValue, triggerChange, minValue, maxValue, step, index],
    );

    const { isDragging, onStartMove } = useDrag(containerRef, direction, handleDragChange);

    useEffect(() => {
        if (onDragCallback && isDragging) {
            onDragCallback(index);
        }
    }, [index, onDragCallback, isDragging]);

    return (
        <>
            <div
                ref={ref}
                onMouseDown={onStartMove}
                onTouchStart={onStartMove}
                role="slider"
                style={{ ...style, ...positionStyle }}
                onKeyDown={handleKeyDown}
                {...otherProps}
            />
            {showTooltip && (
                <div
                    className={cs(styles.tooltip, tooltipClassName, {
                        [styles.tooltipX]: ['rtl', 'ltr'].includes(direction),
                        [styles.tooltipY]: ['ttb', 'btt'].includes(direction),
                        [styles.tooltipActive]: isActive,
                    })}
                    style={positionStyle}
                >
                    {tooltipValueExtractor(controlledValue)}
                </div>
            )}
        </>
    );
};

function SliderInput<T extends string | number>(props: SliderInputProps<T>) {
    const {
        name,
        value,
        disabled,
        inputRange = [0, 10],
        onChange = noop,
        axis = 'x',
        reverse,
        step = 0.1,
        defaultValue = 5,
        thumbStyle = { width: 20, height: 20 },
        showTooltip,
        containerStyle,
        containerClassName,
        tooltipClassName,
        marks = [0 , 5, 10] as T[],
        markKeyExtractor,
        marksContainerClassName,
        renderMark,
        activeTrackColor,
        isRangeInput,
        tooltipValueExtractor = (value) => value,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const handle = useRef<HTMLDivElement>(null);

    const [activeThumbIdx, setActiveThumbIdx] = useState(0);

    const direction = useMemo(() => {
        if (axis === 'y') {
            return reverse ? 'ttb' : 'btt';
        }
        return reverse ? 'rtl' : 'ltr';
    }, [axis, reverse]);

    const [minValue, maxValue] = useMemo(() => inputRange.sort((a, b) => a - b), [inputRange]);

    const handleChange = useCallback(
        (val: number | number[]) => {
            onChange?.({ name, value: val });
        },
        [name, onChange],
    );

    const [controlledValue, setValue] = useControlledState(
        isRangeInput && !isArray(defaultValue) ? [minValue, defaultValue] : defaultValue,
        {
            value,
            onChange: handleChange,
        },
    );

    const triggerChangeValue = useCallback(
        (val: number, idx: number) => {
            let newValue: number | number[];

            newValue = Math.max(minValue, Math.min(maxValue, val));
            if (isRangeInput && isArray(controlledValue)) {
                if (idx === 0 && newValue > controlledValue[1] - step) {
                    return;
                }
                if (idx === 1 && newValue < controlledValue[0] + step) {
                    return;
                }
                const newRangeValues = [...controlledValue];
                newRangeValues[idx] = newValue;
                newValue = newRangeValues;
            }
            setValue(newValue);
        },
        [isRangeInput, minValue, maxValue, controlledValue, step, setValue],
    );

    const handleSliderMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();

            if (!containerRef.current) return;

            const { width, height, left, top, bottom, right } =
                containerRef.current.getBoundingClientRect();
            const { clientX, clientY } = e;

            let percent;
            switch (direction) {
                case 'btt':
                    percent = (bottom - clientY) / height;
                    break;
                case 'ttb':
                    percent = (clientY - top) / height;
                    break;
                case 'rtl':
                    percent = (right - clientX) / width;
                    break;
                default:
                    percent = (clientX - left) / width;
            }
            const nextValue = minValue + percent * (maxValue - minValue);
            const newVal = nextValue !== 0 ? Math.round(nextValue / step) * step : 0;

            let changeIdx = 0;
            if (isRangeInput) {
                const differences = (controlledValue as number[]).map((val) =>
                    Math.abs(newVal - val),
                );
                changeIdx = differences.indexOf(Math.min(...differences));
            }
            triggerChangeValue(newVal, changeIdx);
        },
        [direction, minValue, maxValue, step, triggerChangeValue, isRangeInput, controlledValue],
    );

    const renderLabel: ListRenderItem<T> = useCallback(
        ({ item: label }) => <span className={styles.trackLabel}>{label}</span>,
        [],
    );

    const activeTrackStyle = useMemo(() => {
        return getActiveTrackStyle(direction, controlledValue, minValue, maxValue);
    }, [direction, controlledValue, minValue, maxValue]);

    const markList = useMemo(() => {
        if (reverse) {
            return [...marks.reverse()];
        }
        return marks;
    }, [marks, reverse]);

    return (
        <div
            ref={containerRef}
            style={containerStyle}
            className={cs(styles.container, containerClassName, {
                [styles.containerDisabled]: disabled,
            })}
            onMouseDown={handleSliderMouseDown}
        >
            <div
                className={cs(styles.track, {
                    [styles.trackX]: axis === 'x',
                    [styles.trackY]: axis === 'y',
                    [styles.trackReverse]: reverse,
                })}
            >
                <div
                    className={styles.trackActive}
                    style={{ ...activeTrackStyle, backgroundColor: activeTrackColor }}
                />
            </div>
            <ThumbComponent
                ref={handle}
                className={cs(styles.thumb, {
                    [styles.thumbX]: axis === 'x',
                    [styles.thumbY]: axis === 'y',
                })}
                style={thumbStyle}
                triggerChange={triggerChangeValue}
                containerRef={containerRef}
                minValue={minValue}
                maxValue={maxValue}
                step={step}
                tabIndex={disabled ? undefined : 0}
                index={0}
                controlledValue={isArray(controlledValue) ? controlledValue?.[0] ?? controlledValue: controlledValue}
                direction={direction}
                disabled={disabled}
                showTooltip={showTooltip}
                tooltipClassName={tooltipClassName}
                tooltipValueExtractor={tooltipValueExtractor}
                isActive={activeThumbIdx === 0}
                onDragging={isRangeInput ? setActiveThumbIdx : undefined}
            />
            {isRangeInput && (
                <ThumbComponent
                    ref={handle}
                    className={cs(styles.thumb, {
                        [styles.thumbX]: axis === 'x',
                        [styles.thumbY]: axis === 'y',
                    })}
                    style={thumbStyle}
                    triggerChange={triggerChangeValue}
                    containerRef={containerRef}
                    minValue={minValue}
                    maxValue={maxValue}
                    step={step}
                    tabIndex={disabled ? undefined : 0}
                    index={1}
                    controlledValue={isArray(controlledValue) ? controlledValue?.[1] ?? controlledValue : controlledValue}
                    direction={direction}
                    disabled={disabled}
                    showTooltip={showTooltip}
                    tooltipClassName={tooltipClassName}
                    tooltipValueExtractor={tooltipValueExtractor}
                    onDragging={setActiveThumbIdx}
                    isActive={activeThumbIdx === 1}
                />
            )}
            <List
                className={cs(styles.marks, marksContainerClassName, {
                    [styles.marksX]: axis === 'x',
                    [styles.marksY]: axis === 'y',
                })}
                data={markList}
                renderItem={renderMark ?? renderLabel}
                keyExtractor={markKeyExtractor ?? keyExtractor}
                EmptyComponent={React.Fragment}
            />
        </div>
    );
};

export default SliderInput;

export type { SliderInputProps } from './types';
