import { KeyExtractor, ListRenderItem } from '../../List';

type SliderInputChangeCallback = (payload: { name?: string; value: number | number[] }) => void;

export interface SliderInputProps<T extends string | number> {
    /**
     * Whether the input is disabled or not.
     */
    disabled?: boolean;
    /**
     * An array containing the start and end values of the input range.
     */
    inputRange?: number[];
    /**
     * Function called when the input is changed.
     * @param {{x: number, y: number}} value - The value of the input, based on axis value.
     */
    onChange: SliderInputChangeCallback;
    /**
     * Major axis of the input (can be one of x and y).
     */
    axis?: 'x' | 'y';
    /**
     * Whether the slider direction should be reversed.
     * Goes Right-to-Left for x-axis, and Bottom-to-Top for y-axis.
     */
    reverse?: boolean;
    /**
     * Minimum step of input change.
     */
    step?: number;
    /**
     * Initial value of the input.
     */
    defaultValue?: number | number[];
    /**
     * Value for controlled input.
     */
    value?: number | number[];
    /**
     * Style applied to the input thumb.
     * If function is used, it should return a style object.
     */
    thumbStyle?: React.CSSProperties;
    /**
     * Size of the track (width for x-axis, height for y-axis).
     */
    trackSize?: number;
    /**
     * Class applied to the input container element.
     */
    containerClassName?: string;
    /**
     * Style of the input container element.
     */
    containerStyle?: React.CSSProperties;
    /**
     * Whether or not to show tooltip with value.
     * */
    showTooltip?: boolean;
    /**
     * Class applied to the tooltip element.
     */
    tooltipClassName?: string;
    /**
     * Value extractor for tooltip content.
     */
    tooltipValueExtractor?: (value: number) => number | string;
    /**
     * Class applied to track labels container.
     */
    marksContainerClassName?: string;
    /**
     * Labels to display on the input.
     * Pass an empty array to not display track labels.
     */
    marks?: T[];
    /**
     * Key extractor function for track label list.
     */
    markKeyExtractor?: KeyExtractor<T>;
    /**
     * Custom renderer for the track labels.
     */
    renderMark?: ListRenderItem<T>;
    /**
     * Color of the active area of the track.
     * If passed as function, it should return a string.
     */
    activeTrackColor?: string;
    /**
     * Name of the input.
     */
    name?: string;
    /**
     * Whether or not to allow range input
     */
    isRangeInput?: boolean;
}
