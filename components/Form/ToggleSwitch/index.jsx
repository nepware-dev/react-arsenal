import React, {useCallback, forwardRef, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';

import styles from './styles.module.scss';

const propTypes = {
    /**
     * CSS styling applied to the container div.
     */
    containerClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    /**
     * CSS styling applied to the switch component.
     */
    className: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    /**
     * CSS styling applied to the thumb.
     */
    thumbClassName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func,
    ]),
    /**
     * Name for the input component.
     */
    name: PropTypes.string,
    /**
     * Function called when the toggle input is changed.
     * @param {{name: string, value: bool}} payload - Input change payload containing input name, and changed value.
     */
    onChange: PropTypes.func,
    /**
     * Use to set controlled value for the input.
     */
    value: PropTypes.bool,
    /**
     * Determines the size of the track. This value is twice the height.
     */
    size: PropTypes.number,
    /**
     * Whether or not the input is 'on' (i.e., true) initially.
     */
    onByDefault: PropTypes.bool,
    /**
     * Whether or not the input is disabled.
     */
    disabled: PropTypes.bool,
};

const ToggleSwitch = props => {
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

    const inputRef = useRef();
    const containerRef = useRef();

    const handleChange = useCallback(event => {
        const value = !!event.target.checked;
        onChange && onChange({name, value});
    }, [onChange, name]);

    useEffect(() => {
        if(size) {
            containerRef.current.style?.setProperty('--track-length', `${size}px`);
        }
        if(onByDefault) {
            inputRef.current.checked = true;
        }
    }, [onByDefault, size]);

    useEffect(() => {
        if(value!==undefined) {
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

ToggleSwitch.propTypes = propTypes;

export default ToggleSwitch;
