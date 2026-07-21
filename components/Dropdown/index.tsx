import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './styles.module.scss';
import type { DropdownProps } from './types';
import cs from '../../cs';

const Dropdown = (props: DropdownProps) => {
    const {
        label,
        children,
        className,
        labelContainerClassName,
        contentContainerClassName,
        align = 'left',
        showOnHover,
        useCapture = true,
        renderLabel,
    } = props;

    const [isOpen, setIsOpen] = useState(false);

    const labelRef = useRef<HTMLButtonElement>(null);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const hideDropdown = useCallback(
        (event?: MouseEvent) => {
            if (event?.target && labelRef.current?.contains(event.target as Node)) {
                event.stopPropagation();
            }

            setIsOpen(false);
            document.removeEventListener('click', hideDropdown, useCapture);
        },
        [useCapture],
    );

    const showDropdown = useCallback(() => {
        setIsOpen(true);

        clearTimeout(clickTimeoutRef.current);

        clickTimeoutRef.current = setTimeout(() => {
            document.addEventListener('click', hideDropdown, useCapture);
        }, 50);
    }, [useCapture, hideDropdown]);

    const onClick = useCallback(() => {
        if (isOpen) {
            hideDropdown();
        } else {
            showDropdown();
        }
    }, [isOpen, hideDropdown, showDropdown]);

    const handleMouseEnter = useCallback(() => {
        if (showOnHover) {
            showDropdown();
        }
    }, [showOnHover, showDropdown]);

    const handleMouseLeave = useCallback(() => {
        if (showOnHover) {
            hideDropdown();
        }
    }, [showOnHover, hideDropdown]);

    const renderLabelContent = useCallback(() => {
        if (renderLabel) return renderLabel();

        return (
            <>
                <span className={styles.dropdownLabel}>{label}</span>
                <span className={styles.caret} />
            </>
        );
    }, [label, renderLabel]);

    useEffect(() => {
        return () => {
            clearTimeout(clickTimeoutRef.current);
            hideDropdown();
        };
    }, [hideDropdown]);

    return (
        <div
            data-testid="dropdown-wrapper"
            className={cs(styles.dropdown, className, {
                [styles.open]: isOpen,
            })}
        >
            <button
                ref={labelRef}
                className={cs(styles.dropdownToggle, labelContainerClassName)}
                type="button"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
            >
                {renderLabelContent()}
            </button>
            <div
                className={cs(styles.dropdownMenu, contentContainerClassName, {
                    [styles.alignLeft]: align === 'left',
                    [styles.alignRight]: align === 'right',
                    [styles.alignCenter]: align === 'center',
                })}
            >
                {children}
            </div>
        </div>
    );
};

export default Dropdown;

export type { DropdownProps };
