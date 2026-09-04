import '@testing-library/jest-dom';
import { render, cleanup, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach } from 'vitest';
import type { ReactNode } from 'react';

import MultiSelectInput from '../../../components/Form/MultiSelectInput';
import SelectInput from '../../../components/Form/SelectInput';
import Modal from '../../../components/Modal';

// react-focus-lock is left unmocked: a stubbed trap cannot show how the real lock reacts to focus leaving the modal.

const noop = () => {};

const OPTIONS = [
    { id: '1', label: 'Option A' },
    { id: '2', label: 'Option B' },
];

const keyExtractor = (item: (typeof OPTIONS)[number]) => item.id;
const valueExtractor = (item: (typeof OPTIONS)[number]) => item.label;

// The trap reclaims focus from a deferred timer, so the yank only shows up after it runs.
const flushFocusTrap = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
    });
};

const renderInModal = (select: ReactNode) =>
    render(
        <Modal isVisible onClose={noop}>
            <input data-testid="first-field" placeholder="First field" />
            {select}
        </Modal>,
    );

const openAndPickOption = async (user: ReturnType<typeof userEvent.setup>) => {
    await flushFocusTrap();
    await user.click(document.querySelector('.select-control') as HTMLElement);
    await flushFocusTrap();
    await user.click(screen.getByText('Option B'));
    await flushFocusTrap();
};

afterEach(cleanup);

describe('Selecting an option inside a modal', () => {
    it('keeps focus in the select instead of the modal first field', async () => {
        const user = userEvent.setup();
        renderInModal(
            <SelectInput
                options={OPTIONS}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                onChange={noop}
            />,
        );

        await openAndPickOption(user);

        const selectContainer = document.querySelector('.select-control')!.parentElement!;
        expect(document.activeElement).not.toBe(screen.getByTestId('first-field'));
        expect(selectContainer.contains(document.activeElement)).toBe(true);
        expect(document.querySelector('.select_options')).not.toBeInTheDocument();
    });

    it('keeps focus in the multi select instead of the modal first field', async () => {
        const user = userEvent.setup();
        renderInModal(
            <MultiSelectInput
                options={OPTIONS}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                onChange={noop}
            />,
        );

        await openAndPickOption(user);

        expect(document.activeElement).not.toBe(screen.getByTestId('first-field'));
        expect(document.activeElement).not.toBe(document.body);
    });

    it('still tabs through the multi select options after one is picked', async () => {
        const user = userEvent.setup();
        renderInModal(
            <MultiSelectInput
                options={OPTIONS}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                onChange={noop}
            />,
        );

        await openAndPickOption(user);

        const popup = document.querySelector('.popup') as HTMLElement;
        const checkboxes = popup.querySelectorAll('input[type="checkbox"]');

        await user.tab();

        expect(document.activeElement).toBe(checkboxes[0]);
    });
});
