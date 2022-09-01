import * as React from 'react';

type SliderInputChangeCallback = (payload: {name?: string, value: number | number[]}) => void;

export interface SliderInputProps {
    disabled?: boolean;
    inputRange?: number[];
    onChange?: SliderInputChangeCallback;
    axis?: 'x' | 'y';
    reverse?: boolean;
    step?: number;
    defaultValue?: number | number[];
    value?: number | number[];
    thumbStyle?: React.CSSProperties;
    trackSize?: number;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
    showTooltip?: boolean;
    tooltipClassName?: string;
    tooltipValueExtractor?: (value: number) => number | string;
    marksContainerClassName?: string;
    marks?: string[] | number[];
    markKeyExtractor?: (item: any) => string;
    renderMark?: (item: any) => React.ReactNode;
    activeTrackColor?: string;
    name?: string;
    isRangeInput?: boolean;
};

declare const SliderInput;

export default SliderInput;
