import { useCallback, useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';

import Button from '@ra/components/Button';
import { ModalProps } from '@ra/components/Modal/types';
import Modal from '@ra/components/Modal';

import styles from './styles.module.scss';

export const Story: StoryFn<ModalProps> = (modalProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const toggleModal = useCallback(() => setIsVisible((prev) => !prev), []);

    return (
        <>
            <Button onClick={toggleModal}>Open Modal</Button>
            <Modal
                isVisible={isVisible}
                onClose={toggleModal}
                className={styles.modal}
                {...modalProps}
            >
                <div className={styles.modalContent}>
                    <span>Modal Content</span>
                    <Button onClick={toggleModal}>Close Modal</Button>
                </div>
            </Modal>
        </>
    );
};

Story.storyName = 'Modal';

Story.args = {
    closeOnOutsideClick: true,
    closeOnEscape: true,
    disableFocusLock: false,
};

export default {
    title: 'Components/Modal',
    component: Modal,
} satisfies Meta<typeof Modal>;
