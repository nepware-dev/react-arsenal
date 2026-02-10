import { PropsWithChildren } from 'react';

export interface WindowPortalProps extends PropsWithChildren {
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    onClose?: () => void;
    backgroundColor?: string;
}
