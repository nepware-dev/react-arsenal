import type React from 'react';

import styles from './styles.module.scss';
import { OptionProps } from './types';
import CheckboxInput from '../../CheckboxInput';
import cs from '../../../../cs';

const noop = () => {};

const Option: React.FC<OptionProps> = ({
    className: _className,
    label,
    selected = false,
    onClick = noop,
    disabled = false,
}) => {
    const className = cs(styles.option, _className, {
        [styles.selected]: selected,
        [styles.disabled]: disabled,
    });

    // Disable pointer events on the checkbox wrapper to prevent the native focus behavior of the browser.
    // Without this, clicking the checkbox would try to focus the absolutely positioned input (see CheckboxInput) causing unexpected scroll behavior
    return (
        <div className={className} onClick={!disabled ? onClick : undefined}>
            <div style={{ pointerEvents: 'none' }}>
                <CheckboxInput checked={selected} disabled={disabled} />
            </div>
            {label}
        </div>
    );
};

export default Option;
