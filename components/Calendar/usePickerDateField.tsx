import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Localize from "../I18n/Localize";
import Calendar, {
    type CalendarClassNames,
    type CalendarDayInfo,
    type CalendarProps,
} from ".";
import cs from "../../cs";
import { isArray } from "../../utils";
import type { BikramSambatDate, GregorianDate } from "../../utils/date";
import {
    bikramSambatToGregorian,
    gregorianToBikramSambatSafe,
    parseCalendarViewParts,
    type DisplaySystem,
} from "./pickerDateSystem";

export type PickerFieldMode = "gregorian" | "nepali" | "toggle";

export interface SystemToggleClassNames {
    root?: string;
    option?: string;
    activeOption?: string;
}

export interface PickerMessageClassNames {
    error?: string;
    warning?: string;
}

export interface PickerDateFieldModel<Model> {
    empty: Model;
    parseIso: (value: string | null | undefined) => Model;
    toIsoValue: (model: Model) => string | null;
    format: (
        model: Model,
        displaySystem: DisplaySystem,
        language?: string,
    ) => string;
    parseTyped: (
        trimmedText: string,
        displaySystem: DisplaySystem,
    ) => Model | null;
    isWithinBounds: (model: Model) => boolean;
    equals: (first: Model, second: Model) => boolean;
    getDate: (model: Model) => GregorianDate | null;
    withDate: (model: Model, date: GregorianDate) => Model;
    // Optional completeness check; defaults to date presence when omitted.
    isComplete?: (model: Model) => boolean;
}

interface UsePickerDateFieldConfig<Model> {
    name?: string;
    value?: string | null;
    defaultValue?: string | null;
    disabled: boolean;
    required: boolean;
    showRequired?: boolean;
    mode: PickerFieldMode;
    language?: string;
    errorMessage?: any;
    containerClassName?: string;
    calendarProps?: Partial<CalendarProps>;
    minimumAdDate: GregorianDate | null;
    maximumAdDate: GregorianDate | null;
    // Predicate and renderer receive Gregorian dates, matching the AD/ISO value contract.
    isDateDisabled?: (date: GregorianDate) => boolean;
    renderDay?: (date: GregorianDate, info: CalendarDayInfo) => React.ReactNode;
    onChange?: (payload: { name?: string; value: string | null }) => void;
    model: PickerDateFieldModel<Model>;
    styles: { readonly [key: string]: string };
    systemToggleClassName: string;
    systemToggleClassNames?: SystemToggleClassNames;
    calendarClassNames?: CalendarClassNames;
    messageClassNames?: PickerMessageClassNames;
    completesOnDateChange: boolean;
}

export interface PickerDateField<Model> {
    displaySystem: DisplaySystem;
    setDisplaySystem: (system: DisplaySystem) => void;
    selected: Model;
    setSelected: (model: Model) => void;
    selectedDate: GregorianDate | null;
    inputText: string;
    expanded: boolean;
    warning: string | null;
    errorText: any;
    controlRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    Wrapper: React.ElementType;
    wrapperProps: { className?: string };
    showCalendar: () => void;
    /**
     * Closes the calendar and returns focus to the text input.
     * Use for user-triggered closes from within the picker (selection, Enter, Escape) so focus never
     * falls back to the document body, where an ancestor focus lock would recapture it.
     */
    hideCalendar: () => void;
    /**
     * Closes the calendar without touching focus.
     * Use for user-triggered closes from outside the picker, where the click target owns focus.
     */
    dismissCalendar: () => void;
    toggleCalendar: () => void;
    handleInputFocus: () => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    commitTypedValue: () => "committed" | "reset";
    handleClearIconClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    emit: (model: Model) => void;
    systemToggle: React.ReactNode;
    calendar: React.ReactNode;
    messages: React.ReactNode;
}

const usePickerDateField = <Model,>(
    config: UsePickerDateFieldConfig<Model>,
): PickerDateField<Model> => {
    const {
        name,
        value,
        defaultValue,
        disabled,
        required,
        showRequired,
        mode,
        language,
        containerClassName,
        calendarProps,
        minimumAdDate,
        maximumAdDate,
        isDateDisabled,
        renderDay,
        onChange,
        model,
        styles,
        systemToggleClassName,
        systemToggleClassNames,
        calendarClassNames,
        messageClassNames,
        completesOnDateChange,
    } = config;

    const modelRef = useRef(model);
    modelRef.current = model;

    const isSelectionComplete = useCallback(
        (candidate: Model) =>
            model.isComplete
                ? model.isComplete(candidate)
                : !!model.getDate(candidate),
        [model],
    );

    const [displaySystem, setDisplaySystem] = useState<DisplaySystem>(
        mode === "nepali" ? "bs" : "ad",
    );

    useEffect(() => {
        if (mode !== "toggle") {
            setDisplaySystem(mode === "nepali" ? "bs" : "ad");
        }
    }, [mode]);

    const [selected, setSelected] = useState<Model>(() =>
        model.parseIso(value ?? defaultValue),
    );
    const resetBaseline = selected;
    const [inputText, setInputText] = useState<string>(() =>
        model.format(
            model.parseIso(value ?? defaultValue),
            mode === "nepali" ? "bs" : "ad",
            language,
        ),
    );
    const [expanded, setExpanded] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);

    const controlRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const restoringFocusRef = useRef(false);

    useEffect(() => {
        if (value !== undefined) {
            setSelected(modelRef.current.parseIso(value));
        }
    }, [value]);

    useEffect(() => {
        setInputText(
            modelRef.current.format(selected, displaySystem, language),
        );
    }, [selected, displaySystem, language]);

    useEffect(() => {
        if (showRequired) {
            const currentModel = modelRef.current;
            const complete = currentModel.isComplete
                ? currentModel.isComplete(selected)
                : !!currentModel.getDate(selected);
            setWarning(complete ? null : "Required");
        } else if (!required) {
            setWarning(null);
        }
    }, [showRequired, required, selected]);

    const dismissCalendar = useCallback(() => setExpanded(false), []);

    // Flagged so the input's own focus handler can tell this apart from a user focus and not reopen.
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

    const hideCalendar = useCallback(() => {
        setExpanded(false);
        restoreInputFocus();
    }, [restoreInputFocus]);

    const showCalendar = useCallback(() => {
        if (!disabled) {
            setExpanded(true);
        }
    }, [disabled]);

    const handleInputFocus = useCallback(() => {
        if (restoringFocusRef.current) {
            return;
        }
        showCalendar();
    }, [showCalendar]);

    const toggleCalendar = useCallback(() => {
        setExpanded((previouslyExpanded) =>
            disabled ? previouslyExpanded : !previouslyExpanded,
        );
    }, [disabled]);

    const emit = useCallback(
        (nextModel: Model) => {
            setWarning(
                required && !isSelectionComplete(nextModel) ? "Required" : null,
            );
            onChange?.({ name, value: model.toIsoValue(nextModel) });
        },
        [name, required, onChange, model, isSelectionComplete],
    );

    const handleDateSelect = useCallback(
        (date: GregorianDate) => {
            const nextModel = model.withDate(selected, date);
            setSelected(nextModel);
            if (completesOnDateChange) {
                hideCalendar();
            }
            emit(nextModel);
        },
        [model, selected, completesOnDateChange, hideCalendar, emit],
    );

    const handleBikramSambatSelect = useCallback(
        (date: BikramSambatDate) =>
            handleDateSelect(bikramSambatToGregorian(date)),
        [handleDateSelect],
    );

    const handleClearIconClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            setSelected(model.empty);
            if (completesOnDateChange) {
                hideCalendar();
            }
            emit(model.empty);
        },
        [model, completesOnDateChange, hideCalendar, emit],
    );

    const commitTypedValue = useCallback((): "committed" | "reset" => {
        const trimmedText = inputText.trim();
        if (trimmedText === "") {
            if (!model.equals(selected, model.empty)) {
                setSelected(model.empty);
                emit(model.empty);
            }
            return "committed";
        }
        const parsed = model.parseTyped(trimmedText, displaySystem);
        const parsedDate = parsed ? model.getDate(parsed) : null;
        const parsedDisabled = !!parsedDate && !!isDateDisabled?.(parsedDate);
        if (parsed && model.isWithinBounds(parsed) && !parsedDisabled) {
            if (!model.equals(selected, parsed)) {
                setSelected(parsed);
                emit(parsed);
            }
            return "committed";
        }
        setInputText(model.format(resetBaseline, displaySystem, language));
        return "reset";
    }, [
        inputText,
        displaySystem,
        language,
        model,
        emit,
        selected,
        resetBaseline,
        isDateDisabled,
    ]);

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setInputText(event.target.value);
            showCalendar();
        },
        [showCalendar],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
                if (commitTypedValue() === "committed") {
                    hideCalendar();
                }
            } else if (event.key === "Escape" || event.key === "Tab") {
                hideCalendar();
            }
        },
        [commitTypedValue, hideCalendar],
    );

    const typedViewParts = useMemo(
        () => parseCalendarViewParts(inputText, displaySystem),
        [inputText, displaySystem],
    );

    const errorText = useMemo(() => {
        if (isArray(config.errorMessage)) {
            return config.errorMessage[0];
        }
        return config.errorMessage;
    }, [config.errorMessage]);

    const [Wrapper, wrapperProps] = useMemo(() => {
        if (containerClassName) {
            return ["div", { className: containerClassName }] as const;
        }
        return [React.Fragment, {}] as const;
    }, [containerClassName]);

    const selectedDate = model.getDate(selected);

    const systemToggle =
        mode === "toggle" ? (
            <div
                className={cs(
                    styles.systemToggle,
                    systemToggleClassName,
                    systemToggleClassNames?.root,
                )}
            >
                <button
                    type="button"
                    className={cs(
                        styles.systemToggleOption,
                        "date-system-toggle-option",
                        systemToggleClassNames?.option,
                        { [styles.active]: displaySystem === "ad" },
                        displaySystem === "ad" &&
                            "date-system-toggle-option-active",
                        displaySystem === "ad" &&
                            systemToggleClassNames?.activeOption,
                    )}
                    disabled={disabled}
                    onClick={() => setDisplaySystem("ad")}
                >
                    AD
                </button>
                <button
                    type="button"
                    className={cs(
                        styles.systemToggleOption,
                        "date-system-toggle-option",
                        systemToggleClassNames?.option,
                        { [styles.active]: displaySystem === "bs" },
                        displaySystem === "bs" &&
                            "date-system-toggle-option-active",
                        displaySystem === "bs" &&
                            systemToggleClassNames?.activeOption,
                    )}
                    disabled={disabled}
                    onClick={() => setDisplaySystem("bs")}
                >
                    BS
                </button>
            </div>
        ) : null;

    const calendarClassName = cs(styles.calendar, calendarProps?.className);
    const mergedCalendarClassNames =
        calendarClassNames ?? calendarProps?.classNames;

    // Consumer hooks work in Gregorian; adapt them to the Bikram Sambat calendar.
    const bikramSambatIsDateDisabled = useMemo(
        () =>
            isDateDisabled
                ? (date: BikramSambatDate) =>
                      isDateDisabled(bikramSambatToGregorian(date))
                : undefined,
        [isDateDisabled],
    );
    const bikramSambatRenderDay = useMemo(
        () =>
            renderDay
                ? (date: BikramSambatDate, info: CalendarDayInfo) =>
                      renderDay(bikramSambatToGregorian(date), info)
                : undefined,
        [renderDay],
    );

    const calendar =
        displaySystem === "bs" ? (
            <Calendar
                {...calendarProps}
                system="nepali"
                className={calendarClassName}
                classNames={mergedCalendarClassNames}
                value={
                    selectedDate
                        ? gregorianToBikramSambatSafe(selectedDate)
                        : null
                }
                viewDate={typedViewParts}
                minimumDate={
                    minimumAdDate
                        ? (gregorianToBikramSambatSafe(minimumAdDate) ??
                          undefined)
                        : undefined
                }
                maximumDate={
                    maximumAdDate
                        ? (gregorianToBikramSambatSafe(maximumAdDate) ??
                          undefined)
                        : undefined
                }
                language={language}
                isDateDisabled={bikramSambatIsDateDisabled}
                renderDay={bikramSambatRenderDay}
                onChange={handleBikramSambatSelect}
            />
        ) : (
            <Calendar
                {...calendarProps}
                system="gregorian"
                className={calendarClassName}
                classNames={mergedCalendarClassNames}
                value={selectedDate}
                viewDate={typedViewParts}
                minimumDate={minimumAdDate ?? undefined}
                maximumDate={maximumAdDate ?? undefined}
                isDateDisabled={isDateDisabled}
                renderDay={renderDay}
                onChange={handleDateSelect}
            />
        );

    const messages = (
        <>
            {!!errorText && (
                <span
                    className={cs(
                        styles.errorText,
                        "input-error",
                        messageClassNames?.error,
                    )}
                >
                    <Localize>{errorText}</Localize>
                </span>
            )}
            {!!warning && (
                <span
                    className={cs(
                        styles.warningText,
                        "input-warning",
                        messageClassNames?.warning,
                    )}
                >
                    <Localize>{warning}</Localize>
                </span>
            )}
        </>
    );

    return {
        displaySystem,
        setDisplaySystem,
        selected,
        setSelected,
        selectedDate,
        inputText,
        expanded,
        warning,
        errorText,
        controlRef,
        inputRef,
        Wrapper,
        wrapperProps,
        showCalendar,
        hideCalendar,
        dismissCalendar,
        toggleCalendar,
        handleInputFocus,
        handleInputChange,
        handleKeyDown,
        commitTypedValue,
        handleClearIconClick,
        emit,
        systemToggle,
        calendar,
        messages,
    };
};

export default usePickerDateField;
