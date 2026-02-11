import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';

import { PortalProps } from './types';

const Portal: React.FC<PortalProps> = (props) => {
    const { children, container = document.body } = props;

    return ReactDOM.createPortal(children, container) as ReactElement;
};

export default Portal;

export type { PortalProps };
