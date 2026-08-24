import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';

import styles from './styles.module.scss';
import type { CommitTypedValueResult, TimePickerInputProps } from './types';
import { parseTimeToMinutes, to12HourLabel, minutesToTime, normalizeTime } from './utils';
import DateTimeSelector, { type TimeOption } from '../DateTimePickerInput/DateTimeSelector';
import Popup from '../../Popup';
import Localize from '../../I18n/Localize';
import cs from '../../../cs';
import { fromNepaliDigits, isNepaliLanguage, toNepaliDigits } from '../../../utils/date';
import { consumeFocusIntent, observeFocusIntent } from '../SelectInput/focusIntent';

const TimePickerInput: React.FC<TimePickerInputProps> = (props) => {
    const {
        name,
        className,
        classNames,
        containerClassName,
        timeInputClassName,
        value,
        defaultValue,
        placeholder = 'Select time...',
        disabled = false,
        required = false,
        showRequired,
        clearable = true,
        errorMessage,
        minimumTime,
        maximumTime,
        excludeTimes,
        timeMode = 'list',
        timeStepMinutes = 30,
        language,
        onChange,
        align = 'left',
        is24HourFormat: _is24HourFormat = false,
        scrollToSelectedOnOpen = false,
    } = props;

    const minimumMinutes = useMemo(() => (minimumTime ? parseTimeToMinutes(minimumTime) : null), [minimumTime]);
    const maximumMinutes = useMemo(() => (maximumTime ? parseTimeToMinutes(maximumTime) : null), [maximumTime]);

    const excludedMinutes = useMemo(() => {
        if (!excludeTimes?.length) {
            return null;
        }
        const minutes = excludeTimes
            .map((time) => parseTimeToMinutes(time))
            .filter((minute): minute is number => minute !== null);
        return new Set(minutes);
    }, [excludeTimes]);

    const isWithinBounds = useCallback(
        (time: string) => {
            const minutes = parseTimeToMinutes(time);
            if (minutes === null) {
                return true;
            }
            if (minimumMinutes !== null && minutes < minimumMinutes) {
                return false;
            }
            if (maximumMinutes !== null && minutes > maximumMinutes) {
                return false;
            }
            if (excludedMinutes?.has(minutes)) {
                return false;
            }
            return true;
        },
        [minimumMinutes, maximumMinutes, excludedMinutes],
    );

    const timeStep = timeStepMinutes && timeStepMinutes > 0 ? timeStepMinutes : 30;

    const isAlignedToStep = useCallback(
        (time: string) => {
            const minutes = parseTimeToMinutes(time);
            return minutes !== null && minutes % timeStep === 0;
        },
        [timeStep],
    );

    const useNepaliDigits = isNepaliLanguage(language);

    const is24HourFormat = useMemo(() => {
        if (useNepaliDigits) {
            return true;
        }
        return _is24HourFormat;
    }, [useNepaliDigits, _is24HourFormat]);

    const dateTimeSelectorClassNames = useMemo(() => {
        return {
            timeRow: classNames?.timeRow,
            timeLabel: classNames?.timeLabel,
            timeInput: classNames?.timeInput,
            timeColumn: cs(styles.timeColumn, {
                [styles.timeColumn12Hour]: !is24HourFormat,
            }, classNames?.timeColumn),
            timeColumnHeader: classNames?.timeColumnHeader,
            timeOption: cs(styles.timeOption, classNames?.timeOption),
            selectedTimeOption: classNames?.selectedTimeOption,
        };
    }, [classNames, is24HourFormat]);

    const formatTime = useCallback(
        (time: string) => (time && useNepaliDigits ? toNepaliDigits(time) : time),
        [useNepaliDigits],
    );

    const formatDisplayTime = useCallback(
        (time: string) => {
            if (!time) {
                return '';
            }
            return formatTime(is24HourFormat ? time : to12HourLabel(time));
        },
        [is24HourFormat, formatTime],
    );

    const [selected, setSelected] = useState(() => normalizeTime(value ?? defaultValue ?? ''));
    const [inputText, setInputText] = useState(() => formatDisplayTime(normalizeTime(value ?? defaultValue ?? '')));
    const [expanded, setExpanded] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);

    useEffect(() => {
        if (value !== undefined) {
            setSelected(normalizeTime(value ?? ''));
        }
    }, [value]);

    useEffect(() => {
        setInputText(formatDisplayTime(selected));
    }, [selected, formatDisplayTime]);

    useEffect(() => {
        if (showRequired) {
            setWarning(selected ? null : 'Required');
        } else if (!required) {
            setWarning(null);
        }
    }, [showRequired, required, selected]);

    useEffect(() => observeFocusIntent(), []);

    const controlRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const nativeTimeInputRef = useRef<HTMLInputElement>(null);
    const restoringFocusRef = useRef(false);

    const restoreInputFocus = useCallback(() => {
        const input = inputRef.current;
        if (disabled || !input || document.activeElement === input) {
            return;
        }
        restoringFocusRef.current = true;
        try {
            input.focus();
        } finally {
            restoringFocusRef.current = false;
        }
    }, [disabled]);

    const hideOptions = useCallback(() => {
        setExpanded(false);
        restoreInputFocus();
    }, [restoreInputFocus]);

    const dismissOptions = useCallback(() => setExpanded(false), []);

    const showOptions = useCallback(() => {
        if (!disabled) {
            setExpanded(true);
        }
    }, [disabled]);

    const toggleOptions = useCallback(() => {
        setExpanded((previouslyExpanded) => (disabled ? previouslyExpanded : !previouslyExpanded));
    }, [disabled]);

    const handleInputFocus = useCallback(() => {
        if (restoringFocusRef.current) {
            return;
        }
        if (!consumeFocusIntent(controlRef.current)) {
            return;
        }
        showOptions();
    }, [showOptions]);

    const emit = useCallback(
        (time: string) => {
            setWarning(required && !time ? 'Required' : null);
            onChange?.({ name, value: time || null });
        },
        [name, required, onChange],
    );

    const commitTime = useCallback(
        (time: string) => {
            if (!isWithinBounds(time)) {
                return false;
            }
            if (time !== selected) {
                setSelected(time);
                emit(time);
            }
            return true;
        },
        [selected, isWithinBounds, emit],
    );

    const handleClearIconClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            commitTime('');
            hideOptions();
        },
        [commitTime, hideOptions],
    );

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setInputText(event.target.value);
            showOptions();
        },
        [showOptions],
    );

    const commitTypedValue = useCallback((): CommitTypedValueResult => {
        const trimmedText = inputText.trim();
        if (trimmedText === '') {
            if (clearable && commitTime('')) {
                return { status: 'committed', time: '' };
            }
            setInputText(formatDisplayTime(selected));
            return { status: 'reset', time: selected };
        }
        const normalized = normalizeTime(useNepaliDigits ? fromNepaliDigits(trimmedText) : trimmedText);
        if (normalized && isAlignedToStep(normalized) && commitTime(normalized)) {
            return { status: 'committed', time: normalized };
        }
        setInputText(formatDisplayTime(selected));
        return { status: 'reset', time: selected };
    }, [inputText, clearable, useNepaliDigits, commitTime, isAlignedToStep, formatDisplayTime, selected]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                if (!expanded) {
                    event.preventDefault();
                    showOptions();
                    return;
                }
                event.preventDefault();
                if (commitTypedValue().status === 'committed') {
                    hideOptions();
                }
            } else if (event.key === 'Escape' || event.key === 'Tab') {
                hideOptions();
            } else if (!expanded && event.key === 'ArrowDown') {
                event.preventDefault();
                showOptions();
            }
        },
        [commitTypedValue, hideOptions, expanded, showOptions],
    );

    const handleNativeTimeChange = useCallback(
        (target: HTMLInputElement) => {
            const rawTime = target.value;
            const normalized = rawTime === '' ? '' : normalizeTime(rawTime) || rawTime;
            if (!commitTime(normalized) && nativeTimeInputRef.current) {
                nativeTimeInputRef.current.value = selected;
            }
        },
        [commitTime, selected],
    );

    const timeOptions = useMemo<TimeOption[]>(() => {
        const options: TimeOption[] = [];
        for (let minutes = 0; minutes < 24 * 60; minutes += timeStep) {
            const time = minutesToTime(minutes);
            options.push({ minutes, time, label: formatDisplayTime(time) });
        }
        return options;
    }, [timeStep, formatDisplayTime]);

    const isTimeOptionDisabled = useCallback((option: TimeOption) => !isWithinBounds(option.time), [isWithinBounds]);

    const handleTimeOptionSelect = useCallback(
        (option: TimeOption) => {
            if (commitTime(option.time)) {
                hideOptions();
            }
        },
        [commitTime, hideOptions],
    );

    const errorText = Array.isArray(errorMessage) ? errorMessage[0] : errorMessage;

    const [Wrapper, wrapperProps] = useMemo(() => {
        if (containerClassName) {
            return ['div', { className: containerClassName }] as const;
        }
        return [React.Fragment, {}] as const;
    }, [containerClassName]);

    const showClear = clearable && !disabled && !!selected;

    const [anchorOrigin, transformOrigin] = useMemo(() => {
        if (align === 'right') {
            return ['bottom right', 'top right'] as const;
        }
        if (align === 'center') {
            return ['bottom center', 'top center'] as const;
        }
        return ['bottom left', 'top left'] as const;
    }, [align]);

    return (
        <Wrapper {...wrapperProps}>
            <div
                className={cs(
                    styles.timeInputContainer,
                    { disabled, [styles.disabled]: disabled },
                    className,
                    classNames?.container,
                )}
            >
                <div
                    ref={controlRef}
                    className={cs(
                        styles.timeControl,
                        'time-picker-control',
                        classNames?.control,
                        [styles.expanded, expanded],
                        [styles.warning, !!warning],
                        [styles.error, !!errorText],
                    )}
                >
                    <input
                        ref={inputRef}
                        type='text'
                        className={cs(styles.timeInput, 'time-picker-input', classNames?.input)}
                        value={inputText}
                        placeholder={placeholder}
                        disabled={disabled}
                        onFocus={handleInputFocus}
                        onClick={showOptions}
                        onChange={handleInputChange}
                        onBlur={commitTypedValue}
                        onKeyDown={handleKeyDown}
                    />
                    <div className={cs(styles.indicator, 'time-picker-indicator', classNames?.indicator)}>
                        {showClear && (
                            <button
                                type='button'
                                className={cs(styles.clear, 'time-picker-clear', classNames?.clear)}
                                onClick={handleClearIconClick}
                            >
                                <IoMdClose />
                            </button>
                        )}
                        <button
                            type='button'
                            className={cs(styles.toggle, 'time-picker-toggle', classNames?.toggle)}
                            aria-label='Toggle time picker'
                            disabled={disabled}
                            onClick={toggleOptions}
                        >
                            <FiClock size={16} />
                        </button>
                    </div>
                </div>
                <Popup
                    isVisible={expanded}
                    className={cs(styles.popup, 'time-picker-popup', classNames?.popup)}
                    disableFocusLock
                    anchor={controlRef}
                    anchorOrigin={anchorOrigin}
                    transformOrigin={transformOrigin}
                    onClose={dismissOptions}
                >
                    <div className={styles.pickerPopup}>
                        <div
                            className={cs(
                                styles.pickerBody,
                                'time-picker-body',
                                classNames?.body,
                                timeMode === 'native' ? styles.stacked : styles.listMode,
                            )}
                        >
                            <DateTimeSelector
                                timeMode={timeMode}
                                disabled={disabled}
                                timeText={selected}
                                timeOptions={timeOptions}
                                timeInputRef={nativeTimeInputRef}
                                timeInputClassName={timeInputClassName}
                                effectiveMinimumTime={minimumTime}
                                effectiveMaximumTime={maximumTime}
                                isTimeOptionDisabled={isTimeOptionDisabled}
                                onTimeChange={handleNativeTimeChange}
                                onTimeOptionSelect={handleTimeOptionSelect}
                                scrollToSelectedOnOpen={scrollToSelectedOnOpen}
                                classNames={dateTimeSelectorClassNames}
                            />
                        </div>
                    </div>
                </Popup>
            </div>
            {!!errorText && (
                <span className={cs(styles.errorText, 'input-error', classNames?.error)}>
                    <Localize>{errorText}</Localize>
                </span>
            )}
            {!!warning && (
                <span className={cs(styles.warningText, 'input-warning', classNames?.warning)}>
                    <Localize>{warning}</Localize>
                </span>
            )}
        </Wrapper>
    );
};

export default TimePickerInput;

export * from './types';
