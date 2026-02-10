import type { MouseEvent } from 'react';

export interface IconProps {
    name: string;
    className?: string;
    onClick?: (event: MouseEvent<HTMLSpanElement>) => void;
}
