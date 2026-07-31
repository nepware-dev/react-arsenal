import React, { useCallback, useMemo, useRef } from "react";

import { FiCalendar } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";

import styles from "./styles.module.scss";
import type { DateTimePickerInputProps } from "./types";
import DateTimeSelector, { type TimeOption } from "./DateTimeSelector";
import Popup from "../../Popup";
import cs from "../../../cs";
import {
    compareGregorianDates,
    formatIsoDate,
    fromNepaliDigits,
    isNepaliLanguage,
    parseIsoDate,
    toNepaliDigits,
    type GregorianDate,
} from "../../../utils/date";
import { formatDatePart, parseDatePart } from "../../Calendar/pickerDateSystem";
import usePickerDateField, {
    type PickerDateFieldModel,
} from "../../Calendar/usePickerDateField";

// Emitted value separator: ISO uses `T`. Flip this one line to a space if the contract changes.
const ISO_DATETIME_SEPARATOR = "T";
const DISPLAY_SEPARATOR = " ";

interface DateTimeModel {
    date: GregorianDate | null;
    time: string;
}

const parseTimeToMinutes = (time: string): number | null => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
    if (!match) {
        return null;
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
};

const normalizeTime = (time: string): string => {
    const totalMinutes = parseTimeToMinutes(time);
    return totalMinutes === null ? "" : minutesToTime(totalMinutes);
};

const parseIsoDateTime = (value?: string | null): DateTimeModel => {
    if (!value) {
        return { date: null, time: "" };
    }
    const [datePart = "", timePart = ""] = String(value).trim().split(/[ T]/);
    const date = parseIsoDate(datePart);
    return { date, time: date ? normalizeTime(timePart) : "" };
};

const areModelsEqual = (
    first: DateTimeModel,
    second: DateTimeModel,
): boolean => {
    const datesEqual =
        (!first.date && !second.date) ||
        (!!first.date &&
            !!second.date &&
            compareGregorianDates(first.date, second.date) === 0);
    return datesEqual && first.time === second.time;
};

const DateTimePickerInput: React.FC<DateTimePickerInputProps> = (props) => {
    const {
        name,
        className,
        classNames,
        containerClassName,
        dateInputClassName,
        timeInputClassName,
        value,
        defaultValue,
        placeholder = "Select date and time...",
        disabled = false,
        required = false,
        showRequired,
        clearable = true,
        errorMessage,
        minimumDate,
        maximumDate,
        mode = "gregorian",
        timeMode = "list",
        timeStepMinutes = 30,
        language,
        isDateDisabled,
        renderDay,
        calendarProps,
        onChange,
    } = props;

    const minimumBound = useMemo(
        () => parseIsoDateTime(minimumDate),
        [minimumDate],
    );
    const maximumBound = useMemo(
        () => parseIsoDateTime(maximumDate),
        [maximumDate],
    );

    const minimumMinutes = minimumBound.time
        ? parseTimeToMinutes(minimumBound.time)
        : null;
    const maximumMinutes = maximumBound.time
        ? parseTimeToMinutes(maximumBound.time)
        : null;

    const isWithinBounds = useCallback(
        (date: GregorianDate | null, time: string) => {
            if (!date) {
                return true;
            }
            if (
                minimumBound.date &&
                compareGregorianDates(date, minimumBound.date) < 0
            ) {
                return false;
            }
            if (
                maximumBound.date &&
                compareGregorianDates(date, maximumBound.date) > 0
            ) {
                return false;
            }
            const timeMinutes = time ? parseTimeToMinutes(time) : null;
            if (timeMinutes === null) {
                return true;
            }
            if (
                minimumBound.date &&
                minimumMinutes !== null &&
                compareGregorianDates(date, minimumBound.date) === 0 &&
                timeMinutes < minimumMinutes
            ) {
                return false;
            }
            if (
                maximumBound.date &&
                maximumMinutes !== null &&
                compareGregorianDates(date, maximumBound.date) === 0 &&
                timeMinutes > maximumMinutes
            ) {
                return false;
            }
            return true;
        },
        [minimumBound.date, maximumBound.date, minimumMinutes, maximumMinutes],
    );

    const model = useMemo<PickerDateFieldModel<DateTimeModel>>(
        () => ({
            empty: { date: null, time: "" },
            parseIso: (rawValue) => parseIsoDateTime(rawValue),
            toIsoValue: (currentModel) => {
                if (!currentModel.date) {
                    return null;
                }
                const isoDate = formatIsoDate(currentModel.date);
                return currentModel.time
                    ? `${isoDate}${ISO_DATETIME_SEPARATOR}${currentModel.time}`
                    : isoDate;
            },
            format: (currentModel, displaySystem, formatLanguage) => {
                const datePart = formatDatePart(
                    currentModel.date,
                    displaySystem,
                    formatLanguage,
                );
                if (!datePart) {
                    return "";
                }
                const useNepaliDigits =
                    displaySystem === "bs" && isNepaliLanguage(formatLanguage);
                const timePart = currentModel.time
                    ? useNepaliDigits
                        ? toNepaliDigits(currentModel.time)
                        : currentModel.time
                    : "";
                return timePart
                    ? `${datePart}${DISPLAY_SEPARATOR}${timePart}`
                    : datePart;
            },
            parseTyped: (trimmedText, displaySystem) => {
                const normalized =
                    displaySystem === "bs"
                        ? fromNepaliDigits(trimmedText)
                        : trimmedText;
                const [datePart = "", timePart = ""] = normalized.split(/[ T]/);
                const parsedDate = parseDatePart(datePart, displaySystem);
                if (!parsedDate) {
                    return null;
                }
                return { date: parsedDate, time: normalizeTime(timePart) };
            },
            isWithinBounds: (currentModel) =>
                isWithinBounds(currentModel.date, currentModel.time),
            equals: (first, second) => areModelsEqual(first, second),
            isComplete: (currentModel) => !!currentModel.date && !!currentModel.time,
            getDate: (currentModel) => currentModel.date,
            withDate: (currentModel, date) => ({
                date,
                time: isWithinBounds(date, currentModel.time)
                    ? currentModel.time
                    : "",
            }),
        }),
        [isWithinBounds],
    );

    const timeInputRef = useRef<HTMLInputElement>(null);

    // A datetime is only meaningful once both date and time exist; suppress the intermediate date-only value.
    const handleChange = useCallback(
        (payload: { name?: string; value: string | null }) => {
            if (
                payload.value !== null &&
                !payload.value.includes(ISO_DATETIME_SEPARATOR)
            ) {
                return;
            }
            onChange?.(payload);
        },
        [onChange],
    );

    const field = usePickerDateField<DateTimeModel>({
        name,
        value,
        defaultValue,
        disabled,
        required,
        showRequired,
        mode,
        language,
        errorMessage,
        containerClassName,
        calendarProps,
        minimumAdDate: minimumBound.date,
        maximumAdDate: maximumBound.date,
        isDateDisabled,
        renderDay,
        onChange: handleChange,
        model,
        styles,
        systemToggleClassName: "date-time-system-toggle",
        systemToggleClassNames: {
            root: classNames?.systemToggle,
            option: classNames?.systemToggleOption,
            activeOption: classNames?.activeSystemToggleOption,
        },
        calendarClassNames: classNames?.calendar,
        messageClassNames: {
            error: classNames?.error,
            warning: classNames?.warning,
        },
        completesOnDateChange: false,
    });

    const { Wrapper, wrapperProps, setSelected, emit, hideCalendar } = field;
    const selectedDate = field.selectedDate;
    const timeText = field.selected.time;

    const useNepaliDigits =
        field.displaySystem === "bs" && isNepaliLanguage(language);

    const handleTimeChange = useCallback(
        (target: HTMLInputElement) => {
            const raw = target.value;
            if (raw === "") {
                const next: DateTimeModel = { date: selectedDate, time: "" };
                setSelected(next);
                emit(next);
                return;
            }
            const normalized = normalizeTime(raw) || raw;
            if (!selectedDate || isWithinBounds(selectedDate, normalized)) {
                const next: DateTimeModel = {
                    date: selectedDate,
                    time: normalized,
                };
                setSelected(next);
                emit(next);
                return;
            }
            if (timeInputRef.current) {
                timeInputRef.current.value = timeText;
            }
        },
        [selectedDate, timeText, isWithinBounds, setSelected, emit],
    );

    const timeOptions = useMemo<TimeOption[]>(() => {
        const step =
            timeStepMinutes && timeStepMinutes > 0 ? timeStepMinutes : 30;
        const options: TimeOption[] = [];
        for (let minutes = 0; minutes < 24 * 60; minutes += step) {
            const time = minutesToTime(minutes);
            options.push({
                minutes,
                time,
                label: useNepaliDigits ? toNepaliDigits(time) : time,
            });
        }
        return options;
    }, [timeStepMinutes, useNepaliDigits]);

    const isTimeOptionDisabled = useCallback(
        (option: TimeOption) =>
            !!selectedDate && !isWithinBounds(selectedDate, option.time),
        [selectedDate, isWithinBounds],
    );

    const handleTimeOptionSelect = useCallback(
        (option: TimeOption) => {
            if (!selectedDate || isWithinBounds(selectedDate, option.time)) {
                const next: DateTimeModel = {
                    date: selectedDate,
                    time: option.time,
                };
                setSelected(next);
                emit(next);
                if (selectedDate) {
                    hideCalendar();
                }
            }
        },
        [selectedDate, isWithinBounds, setSelected, emit, hideCalendar],
    );

    const onMinimumBoundaryDate =
        !!selectedDate &&
        !!minimumBound.date &&
        compareGregorianDates(selectedDate, minimumBound.date) === 0;
    const onMaximumBoundaryDate =
        !!selectedDate &&
        !!maximumBound.date &&
        compareGregorianDates(selectedDate, maximumBound.date) === 0;
    const effectiveMinimumTime = onMinimumBoundaryDate
        ? minimumBound.time || undefined
        : undefined;
    const effectiveMaximumTime = onMaximumBoundaryDate
        ? maximumBound.time || undefined
        : undefined;

    const showClear = clearable && !disabled && !!selectedDate;

    return (
        <Wrapper {...wrapperProps}>
            <div
                className={cs(
                    styles.dateTimeInputContainer,
                    { disabled, [styles.disabled]: disabled },
                    className,
                    classNames?.container,
                )}
            >
                <div
                    ref={field.controlRef}
                    className={cs(
                        styles.dateTimeControl,
                        "date-time-control",
                        classNames?.control,
                        [styles.expanded, field.expanded],
                        [styles.warning, !!field.warning],
                        [styles.error, !!field.errorText],
                    )}
                >
                    <input
                        ref={field.inputRef}
                        type="text"
                        className={cs(
                            styles.dateTimeInput,
                            "date-time-input",
                            dateInputClassName,
                            classNames?.input,
                        )}
                        value={field.inputText}
                        placeholder={placeholder}
                        disabled={disabled}
                        onFocus={field.handleInputFocus}
                        onChange={field.handleInputChange}
                        onBlur={field.commitTypedValue}
                        onKeyDown={field.handleKeyDown}
                    />
                    {field.systemToggle}
                    <div
                        className={cs(
                            styles.indicator,
                            "date-time-indicator",
                            classNames?.indicator,
                        )}
                    >
                        {showClear && (
                            <button
                                type="button"
                                className={cs(
                                    styles.clear,
                                    "date-time-clear",
                                    classNames?.clear,
                                )}
                                onClick={field.handleClearIconClick}
                            >
                                <IoMdClose />
                            </button>
                        )}
                        <button
                            type="button"
                            className={cs(
                                styles.calendarToggle,
                                "date-time-calendar-toggle",
                                classNames?.calendarToggle,
                            )}
                            aria-label="Toggle picker"
                            disabled={disabled}
                            onClick={field.toggleCalendar}
                        >
                            <FiCalendar size={16} />
                        </button>
                    </div>
                </div>
                <Popup
                    isVisible={field.expanded}
                    className={cs(
                        styles.popup,
                        "date-time-popup",
                        classNames?.popup,
                    )}
                    disableFocusLock
                    anchor={field.controlRef}
                    anchorOrigin="bottom left"
                    transformOrigin="top left"
                    onClose={field.dismissCalendar}
                >
                    <div className={styles.pickerPopup}>
                        <div
                            className={cs(
                                styles.pickerBody,
                                "date-time-body",
                                classNames?.body,
                                timeMode === "native"
                                    ? styles.stacked
                                    : styles.sideBySide,
                            )}
                        >
                            {field.calendar}
                            <DateTimeSelector
                                timeMode={timeMode}
                                disabled={disabled}
                                timeText={timeText}
                                timeOptions={timeOptions}
                                timeInputRef={timeInputRef}
                                timeInputClassName={timeInputClassName}
                                effectiveMinimumTime={effectiveMinimumTime}
                                effectiveMaximumTime={effectiveMaximumTime}
                                isTimeOptionDisabled={isTimeOptionDisabled}
                                onTimeChange={handleTimeChange}
                                onTimeOptionSelect={handleTimeOptionSelect}
                                classNames={classNames}
                            />
                        </div>
                    </div>
                </Popup>
            </div>
            {field.messages}
        </Wrapper>
    );
};

export default DateTimePickerInput;

export * from "./types";
