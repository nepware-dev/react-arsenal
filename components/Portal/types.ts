import type { ReactNode } from 'react';

export interface PortalProps {
    container?: Element | DocumentFragment;
    children: ReactNode;
}
