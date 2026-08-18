import { useRef, useState, useCallback } from 'react';
import type { StoryFn } from '@storybook/react-vite';

import Button from '@ra/components/Button';
import Popup, { PopupProps } from '@ra/components/Popup';

import styles from './styles.module.scss';

export default {
    title: 'Components/Popup',
    component: Popup,
};

export const Story: StoryFn<PopupProps<HTMLButtonElement>> = (storyArgs) => {
    const [showPopup, setShowPopup] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    const handleClick = useCallback(() => {
        setShowPopup((prev) => !prev);
    }, []);

    return (
        <>
            <Button ref={ref} onClick={handleClick}>
                checking
            </Button>
            <Popup
                {...storyArgs}
                className={styles.popup}
                isVisible={showPopup}
                onClose={handleClick}
                anchor={ref}
            >
                <div>test</div>
            </Popup>
        </>
    );
};

Story.storyName = 'Popup';

Story.args = {
    closeOnOutsideClick: true,
    anchorOrigin: 'center left',
    transformOrigin: 'center left',
};
