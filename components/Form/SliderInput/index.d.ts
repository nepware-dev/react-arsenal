import * as React from 'react';

type SliderInputChangeCallback = (payload: {x: number, y: number}) => void;

export interface SliderInputProps {
    disabled?: boolean;
    inputRange?: number[];
    onChange?: SliderInputChangeCallback;
    axis?: 'x' | 'y';
    reverse?: boolean;
    step?: number;
    defaultValue?: number;
    value?: number;
    thumbStyle?: React.CSSProperties;
    trackSize?: number;
    containerClassName?: string;
    showTooltip?: boolean;
    tooltipClassName?: string;
    marksContainerClassName?: string;
    marks?: string[] | number[];
    markKeyExtractor?: (item: any) => string;
    renderMark?: (item: any) => React.ReactNode;
    activeTrackColor?: string;
    name?: string;
};

declare const SliderInput;

export default SliderInput;
