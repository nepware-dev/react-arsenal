import { useCallback, useEffect, useRef } from 'react';

import styles from './styles.module.scss';
import type { ToggleSwitchProps } from './types';
import cs from '../../../cs';

const ToggleSwitch: React.FC<ToggleSwitchProps> = (props) => {
    const {
        containerClassName,
        className,
        thumbClassName,
        name,
        onChange,
        size,
        onByDefault,
        value,
        disabled,
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = !!event.target.checked;
            onChange && onChange({ name, value });
        },
        [onChange, name],
    );

    useEffect(() => {
        if (size && containerRef.current) {
            containerRef.current.style.setProperty('--track-length', `${size}px`);
        }
        if (onByDefault && inputRef.current) {
            inputRef.current.checked = true;
        }
    }, [onByDefault, size]);

    useEffect(() => {
        if (value !== undefined && inputRef.current) {
            inputRef.current.checked = value;
        }
    }, [value]);

    return (
        <div className={cs(styles.container, containerClassName)}>
            <div ref={containerRef} className={cs(styles.toggleSwitch, className)}>
                <input
                    ref={inputRef}
                    type="checkbox"
                    className={styles.checkbox}
                    onChange={handleChange}
                    name={name}
                    checked={value}
                    disabled={disabled}
                />
                <div className={styles.label}>
                    <span className={styles.inner} />
                    <span className={cs(styles.thumb, thumbClassName)} />
                </div>
            </div>
        </div>
    );
};

export default ToggleSwitch;

export type { ToggleSwitchProps } from './types';
