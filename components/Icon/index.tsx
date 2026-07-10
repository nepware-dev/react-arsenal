import React from 'react';

import styles from './styles.module.scss';
import type { IconProps } from './types';
import cs from '../../cs';

const Icon: React.FC<IconProps> = (props) => {
    const { name, className: _className = '', onClick } = props;

    const className = cs(name, styles.icon, _className, {
        [styles.clickable]: !!onClick,
    });

    return <span className={className} onClick={onClick} />;
};

export default Icon;

export type { IconProps } from './types';
