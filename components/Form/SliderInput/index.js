import React, {useMemo, useRef, useCallback, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import List from '../../List';
import cs from '../../../cs';
import {isObject} from '../../../utils';
import useControlledState from '../../../hooks/useControlledState';

import useDrag from './useDrag';
import styles from './styles.module.scss';

const keyExtractor = item => item;

const propTypes = {
    /**
     * Whether the input is disabled or not.
     */
    disabled: PropTypes.bool,
    /**
     * An array containing the start and end values of the input range.
     */
    inputRange: PropTypes.array,
    /**
     * Function called when the input is changed.
     * @param {{x: number, y: number}} value - The value of the input, based on axis value.
     */
    onChange: PropTypes.func.isRequired,
    /**
     * Major axis of the input (can be one of x and y).
     */
    axis: PropTypes.oneOf(['x','y']),
    /**
     * Whether the slider direction should be reversed.
     * Goes Right-to-Left for x-axis, and Bottom-to-Top for y-axis.
     */
    reverse: PropTypes.bool,
    /**
     * Minimum step of input change.
     */
    step: PropTypes.number,
    /**
     * Initial value of the input.
     */
    defaultValue: PropTypes.number,
    /**
     * Style applied to the input thumb.
     * If function is used, it should return a style object.
     */
    thumbStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.func,
    ]),
    /**
     * Size of the track (width for x-axis, height for y-axis).
     */
    trackSize: PropTypes.number,
    /**
     * Class applied to the input container element.
     */
    containerClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    /**
     * Class applied to track labels container.
     */
    marksContainerClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    /**
     * Labels to display on the input.
     * Pass an empty array to not display track labels.
     */
    marks: PropTypes.array,
    /**
     * Key extractor function for track label list.
     * @param {any} item - Track label item.
     */
    markKeyExtractor: PropTypes.func,
    /**
     * Custom renderer for the track labels.
     * @param {any} item - Track label item.
     */
    renderMark: PropTypes.func,
    /**
     * Color of the active area of the track.
     * If passed as function, it should return a string.
     */
    activeTrackColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    /**
     * Name of the input.
     */
    name: PropTypes.String,
};

const noop = () => {};

const defaultProps = {
    inputRange: [0, 10],
    axis: 'x',
    step: 0.1,
    trackSize: 10,
    thumbStyle: {width: 20, height: 20},
    marks: [0, 5, 10],
    onChange: noop,
    defaultValue: 5,
};

const KeyCodes = {
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

const getClientPosition = e => {
    const touches = e?.touches;

    if (touches && touches.length) {
        const finger = touches[0];
        return {
            x: finger.clientX,
            y: finger.clientY
        };
    }

    return {
        x: e.clientX,
        y: e.clientY
    };
};

function getOffset(value, min, max) {
    return (value - min) / (max - min);
}

function getActiveTrackStyle(direction, value, min, max) {
   const offset = getOffset(value, min, max);

   const style = {};

    switch(direction) {
        case 'rtl':
        case 'ltr':
            style.width = `${offset * 100}%`;
            style.height = '100%';
            break;
        default:
            style.height = `${offset * 100}%`;
            style.width = '100%';
            break;
    }
    return style;
}

function getDirectionStyle(direction, value, min, max) {
    const offset = getOffset(value, min, max);

    const positionStyle = {};

    switch(direction) {
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

const SliderInput = props => {
    const {
        name,
        value,
        disabled,
        inputRange,
        onChange,
        axis,
        reverse,
        step,
        defaultValue,
        thumbStyle,
        trackSize,
        containerClassName,
        marks,
        markKeyExtractor,
        marksContainerClassName,
        renderMark,
        activeTrackColor,
    } = props;

    const containerRef = useRef();
    const handle = useRef(null);
    const start = useRef({});
    const offset = useRef({});
    const inputRef = useRef();

    const direction = useMemo(() => {
        if(axis==='y') {
            return reverse ? 'ttb' : 'btt';
        }
        return reverse ? 'rtl' : 'ltr';
    }, [axis, reverse]);

    const [minValue, maxValue] = useMemo(() => inputRange, [inputRange]);

    const handleChange = useCallback(val => {
        onChange && onChange({name, value: val});
    }, [onChange]);

    const [controlledValue, setValue] = useControlledState(defaultValue, {
        value,
        onChange: handleChange,
    });

    const triggerChangeValue = useCallback(val => {
        if(val > maxValue) {
            return setValue(maxValue);
        }
        if(val < minValue) {
            return setValue(minValue);
        }
        setValue(val);
    }, []);

    const handleDragChange = useCallback(dragOffset => {
        const nextValue = controlledValue + dragOffset * (maxValue - minValue);
        const newVal = (nextValue !== 0 ? Math.round(nextValue / step) * step : 0);
        triggerChangeValue(newVal); 
    }, [controlledValue, triggerChangeValue, minValue, maxValue, step]);

    const {isDragging, onStartMove} = useDrag(containerRef, direction, handleDragChange);

    const handleSliderMouseDown = useCallback(e => {
        e.preventDefault();

        const {
            width,
            height,
            left,
            top,
            bottom,
            right,
        } = containerRef.current.getBoundingClientRect();
        const {clientX, clientY} = e;

        let percent;
        switch(direction) {
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
        const newVal = (nextValue !== 0 ? Math.round(nextValue / step) * step : 0); 

        triggerChangeValue(newVal);
    }, [direction, inputRange, step, triggerChangeValue]);

    const handleOffsetChange = useCallback(offset => {
        if(!disabled) {
            if(offset === 'min') {
                return triggerChangeValue(minValue);
            }
            if(offset === 'max') {
                return triggerChangeValue(maxValue);
            }
            if(offset === -1) {
                return triggerChangeValue(controlledValue - step < minValue ? minValue : controlledValue - step);
            }
            return triggerChangeValue(controlledValue + step > maxValue ? maxValue : controlledValue + step); 
        }
    }, [triggerChangeValue, minValue, maxValue, step, controlledValue]);

    const handleKeyDown = useCallback(e => {
        if(!disabled) {
            let offset = null;
            switch(e.which || e.keyCode) {
                case KeyCodes.LEFT:
                    offset = direction === 'ltr' || direction === 'ttb' ? -1 : 1;
                    break;
                case KeyCodes.RIGHT:
                    offset = direction === 'ltr' || direction === 'ttb' ? 1 : -1;
                    break;
                case KeyCodes.UP:
                    offset = direction === 'ttb' || direction === 'rtl' ? -1 : 1;
                    break;
                case KeyCodes.DOWN:
                    offset = direction === 'ttb' || direction === 'rtl' ? 1 : -1;
                    break;
                case KeyCodes.HOME:
                    offset = 'min';
                    break;
                case KeyCodes.END:
                    offset = 'max';
                    break;
            }
            if(offset !== null) {
                e.preventDefault();
                handleOffsetChange(offset);
            }
        }
    }, [disabled, direction, handleOffsetChange]);

    const renderLabel = useCallback(({item: label}) => (
        <span className={styles.trackLabel}>{label}</span>
    ), []);

    const positionStyle = useMemo(() => {
        return getDirectionStyle(direction, controlledValue, minValue, maxValue);
    }, [direction, controlledValue, minValue, maxValue]);

    const activeTrackStyle = useMemo(() => {
        return getActiveTrackStyle(direction, controlledValue, minValue, maxValue);
    }, [direction, controlledValue, minValue, maxValue]);

    const markList = useMemo(() => {
        if(direction === 'btt' || direction ===  'rtl') {
            return marks.reverse();
        }
        return marks;
    }, [marks, direction]);

    return (
        <div ref={containerRef} className={cs(styles.container, containerClassName, {
            [styles.containerDisabled]: disabled,
        })} onMouseDown={handleSliderMouseDown}>
            <div
                className={cs(styles.track, {
                    [styles.trackX]: axis === 'x',
                    [styles.trackY]: axis === 'y',
                })}
            >
                <div
                    className={styles.trackActive}
                    style={{...activeTrackStyle, backgroundColor: activeTrackColor}}
                />
            </div>
            <div
                ref={handle}
                className={cs(styles.thumb, {
                    [styles.thumbX]: axis === 'x',
                    [styles.thumbY]: axis === 'y',
                })}
                style={{...positionStyle, ...thumbStyle}}
                onMouseDown={onStartMove}
                onTouchStart={onStartMove}
                onKeyDown={handleKeyDown}
                role="slider"
                tabIndex={disabled ? null : 0}
            />
            <List
                className={cs(styles.marks, marksContainerClassName, {
                    [styles.marksX]: axis === 'x',
                    [styles.marksY]: axis === 'y',
                })}
                data={markList}
                renderItem={renderMark ?? renderLabel}
                keyExtractor={markKeyExtractor ?? keyExtractor}
            />
        </div>
    );
};

SliderInput.propTypes = propTypes;
SliderInput.defaultProps = defaultProps;

export default SliderInput;
