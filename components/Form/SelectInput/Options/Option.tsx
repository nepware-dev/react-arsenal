import { type ReactNode } from 'react';

import styles from './styles.module.scss';
import type { OptionProps } from './types';
import cs from '../../../../cs';

const noop = () => {};

function Option<T extends ReactNode>({
    className: _className,
    label,
    selected = false,
    focused,
    onClick = noop,
    onFocus = noop,
    disabled = false,
}: OptionProps<T>) {
    const className = cs(styles.option, _className, {
        [styles.selected]: selected,
        [styles.focused]: focused,
        [styles.disabled]: disabled,
    });

    return (
        <div
            className={className}
            onClick={!disabled ? onClick : undefined}
            onMouseOverCapture={!disabled ? onFocus : undefined}
        >
            {label}
        </div>
    );
}

export default Option;
