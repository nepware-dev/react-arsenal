import { useCallback, useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

import styles from './styles.module.scss';
import type { ModalProps } from './types';
import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import cs from '../../cs';
import { FocusShardContext, useFocusShardHost } from '../../hooks/useFocusShards';

const Modal: React.FC<ModalProps> = (props) => {
    const {
        children,
        className: classNameFromProps,
        overlayClassName: overlayClassNameFromProps,
        closeOnEscape,
        closeOnOutsideClick,
        disableFocusLock = false,
        onClose,
    } = props;

    const wrapperRef = useRef<HTMLDivElement>(null);

    const { shards: focusShards, registry: focusShardRegistry } = useFocusShardHost();

    const className = cs(styles.modal, classNameFromProps, 'modal');
    const overlayClassName = cs(styles.overlay, overlayClassNameFromProps, 'overlay');

    const updateBody = useCallback((modalShown: boolean) => {
        if (modalShown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, []);

    const handleKeyPressed = useCallback(
        (event: KeyboardEvent) => {
            if (closeOnEscape && event.key === 'Escape') {
                onClose?.({ escape: true });
            }
        },
        [closeOnEscape, onClose],
    );

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                closeOnOutsideClick &&
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                onClose?.({ outsideClick: true });
            }
        },
        [closeOnOutsideClick, onClose],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPressed);
        document.addEventListener('mousedown', handleClickOutside);
        updateBody(true);

        return () => {
            document.removeEventListener('keydown', handleKeyPressed);
            document.removeEventListener('mousedown', handleClickOutside);
            updateBody(false);
        };
    }, [handleKeyPressed, handleClickOutside, updateBody]);

    return (
        <Portal>
            <FocusShardContext.Provider value={focusShardRegistry}>
                <FocusLock disabled={disableFocusLock} shards={focusShards}>
                    <div className={overlayClassName} data-testid="modal-overlay">
                        <div ref={wrapperRef} className={className}>
                            {children}
                        </div>
                    </div>
                </FocusLock>
            </FocusShardContext.Provider>
        </Portal>
    );
};

export default withVisibleCheck(Modal);

export type { ModalProps };
