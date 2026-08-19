import { act, render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SelectInput, { type SelectInputProps } from '../../../components/Form/SelectInput';
import styles from '../../../components/Form/SelectInput/styles.module.scss';

vi.mock('../../../components/Popup', () => ({
    default: ({ isVisible, children }: { isVisible: boolean; children: React.ReactNode }) =>
        isVisible ? <div data-testid="popup">{children}</div> : null,
}));

interface OptionType {
    id: string;
    label: string;
}

const OPTIONS: OptionType[] = [
    { id: '1', label: 'Option A' },
    { id: '2', label: 'Option B' },
    { id: '3', label: 'Option C' },
];

const keyExtractor = (item: OptionType) => item.id;
const valueExtractor = (item: OptionType) => item.label;

describe('SelectInput', () => {
    const onChange = vi.fn();
    const scrollTo = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
        scrollTo.mockClear();
        Element.prototype.scrollTo = scrollTo;
    });

    const renderSelect = (props: Partial<SelectInputProps<OptionType, string>> = {}) =>
        render(
            <SelectInput
                options={OPTIONS}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                onChange={onChange}
                {...props}
            />,
        );

    describe('rendering & configurations', () => {
        it('renders the placeholder, search inputs, and errors conditionally based on props', () => {
            const { container, rerender } = renderSelect({ placeholder: 'Choose one' });
            expect(screen.getByText('Choose one')).toBeInTheDocument();
            expect(container.querySelector(`.${styles.input}`)).toBeInTheDocument();

            rerender(
                <SelectInput
                    options={OPTIONS}
                    keyExtractor={keyExtractor}
                    valueExtractor={valueExtractor}
                    onChange={onChange}
                    disabled
                    errorMessage="This field is required"
                />,
            );
            expect(container.querySelector(`.${styles.disabled}`)).toBeInTheDocument();
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });

        it('renders the selected value or custom label template', () => {
            const { rerender } = renderSelect({ value: OPTIONS[1] });
            expect(screen.getByText('Option B')).toBeInTheDocument();

            rerender(
                <SelectInput
                    options={OPTIONS}
                    keyExtractor={keyExtractor}
                    valueExtractor={valueExtractor}
                    onChange={onChange}
                    value={OPTIONS[0]}
                    renderDisplayLabel={(item) => (
                        <span data-testid="custom-label">{item.label} (custom)</span>
                    )}
                />,
            );
            expect(screen.getByTestId('custom-label')).toBeInTheDocument();
        });
    });

    describe('interactivity (open / close / select)', () => {
        it('opens the popup, allows selection, and sends the correct data to onChange', async () => {
            const { container } = renderSelect({ name: 'mySelect' });
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            await act(async () => {
                fireEvent.click(wrapper);
            });
            expect(await screen.findByText('Option A')).toBeInTheDocument();

            const optionA = screen.getByText('Option A');
            await act(async () => {
                fireEvent.click(optionA);
            });

            expect(onChange).toHaveBeenCalledWith({ name: 'mySelect', option: OPTIONS[0] });
        });

        it('closes the open popup when the Escape key is pressed', async () => {
            const { container } = renderSelect();
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            await act(async () => {
                fireEvent.click(wrapper);
            });
            expect(await screen.findByText('Option B')).toBeInTheDocument();

            await act(async () => {
                fireEvent.keyDown(wrapper, { key: 'Escape' });
            });
            expect(screen.queryByText('Option B')).not.toBeInTheDocument();
        });

        it('prevents interaction and removes tab index when disabled', () => {
            const { container } = renderSelect({ disabled: true });
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            expect(wrapper).toHaveClass(styles.disabled);
            expect(wrapper).not.toHaveAttribute('tabindex');
        });

        it('disables the search input so it cannot be focused or typed into when disabled', async () => {
            const { container } = renderSelect({ disabled: true });

            const searchInput = container.querySelector('input') as HTMLInputElement;
            expect(searchInput).toBeDisabled();
            expect(searchInput).not.toHaveFocus();

            searchInput.focus();
            expect(searchInput).not.toHaveFocus();

            const user = userEvent.setup();
            await user.type(searchInput, 'B');
            expect(searchInput).not.toHaveValue();
        });
    });

    describe('opening on focus', () => {
        const getWrapper = (container: HTMLElement) =>
            container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

        it('opens when the user presses the select', async () => {
            const { container } = renderSelect();
            const wrapper = getWrapper(container);

            await act(async () => {
                fireEvent.mouseDown(wrapper);
                wrapper.focus();
            });

            expect(screen.getByTestId('popup')).toBeInTheDocument();
        });

        it('opens when the user tabs into the select', async () => {
            const { container } = renderSelect();
            const wrapper = getWrapper(container);

            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'Tab' });
                wrapper.focus();
            });

            expect(screen.getByTestId('popup')).toBeInTheDocument();
        });

        it('stays closed when focus arrives without a user gesture', async () => {
            const { container } = render(
                <>
                    <button type="button" data-testid="other-control">
                        Other
                    </button>
                    <SelectInput
                        options={OPTIONS}
                        keyExtractor={keyExtractor}
                        valueExtractor={valueExtractor}
                        onChange={onChange}
                    />
                </>,
            );
            const wrapper = getWrapper(container);

            await act(async () => {
                screen.getByTestId('other-control').focus();
            });
            // A focus trap reclaiming focus looks like this: a real relatedTarget, no pointer or key press behind it.
            await act(async () => {
                wrapper.focus();
            });

            expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
        });

        it('stays closed when a key press that landed elsewhere is followed by programmatic focus', async () => {
            const { container } = render(
                <>
                    <button type="button" data-testid="other-control">
                        Other
                    </button>
                    <SelectInput
                        options={OPTIONS}
                        keyExtractor={keyExtractor}
                        valueExtractor={valueExtractor}
                        onChange={onChange}
                    />
                </>,
            );
            const wrapper = getWrapper(container);

            // Tabbing onto something that is not a select leaves that key press unclaimed.
            await act(async () => {
                fireEvent.keyDown(document.body, { key: 'Tab' });
                screen.getByTestId('other-control').focus();
            });
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });

            // A focus trap redirecting focus later must not inherit that key press.
            await act(async () => {
                wrapper.focus();
            });

            expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
        });
    });

    describe('scroll to selected option on open', () => {
        it('does not scroll when scrollToSelectedOnOpen is not set', async () => {
            const { container } = renderSelect({ value: OPTIONS[2] });
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            await act(async () => {
                fireEvent.click(wrapper);
            });
            expect(await screen.findByText('Option A')).toBeInTheDocument();

            expect(scrollTo).not.toHaveBeenCalled();
        });

        it('centers the selected option in view when opted in', async () => {
            const { container } = renderSelect({ value: OPTIONS[2], scrollToSelectedOnOpen: true });
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            await act(async () => {
                fireEvent.click(wrapper);
            });
            const popup = await screen.findByTestId('popup');
            expect(within(popup).getByText('Option C')).toBeInTheDocument();

            expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
        });

        it('does not scroll when opted in but nothing is selected', async () => {
            const { container } = renderSelect({ scrollToSelectedOnOpen: true });
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            await act(async () => {
                fireEvent.click(wrapper);
            });
            expect(await screen.findByText('Option A')).toBeInTheDocument();

            expect(scrollTo).not.toHaveBeenCalled();
        });

        it('scrolls to the selected option when keyExtractor falls back to its index argument', async () => {
            interface NoIdOption {
                label: string;
            }
            const noIdOptions: NoIdOption[] = [
                { label: 'Option A' },
                { label: 'Option B' },
                { label: 'Option C' },
            ];
            const indexKeyExtractor = (_item: NoIdOption, index: number) => index;
            const noIdValueExtractor = (opt: NoIdOption) => opt.label;

            const { container } = render(
                <SelectInput
                    options={noIdOptions}
                    keyExtractor={indexKeyExtractor}
                    valueExtractor={noIdValueExtractor}
                    onChange={onChange}
                    value={noIdOptions[2]}
                    scrollToSelectedOnOpen
                />,
            );
            const wrapper = container.querySelector(`.${styles.selectContainer}`) as HTMLElement;

            await act(async () => {
                fireEvent.click(wrapper);
            });
            const popup = await screen.findByTestId('popup');
            expect(within(popup).getByText('Option C')).toBeInTheDocument();

            expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
        });
    });

    describe('clear functionality', () => {
        it('manages clear visibility and triggers onChange with null', () => {
            const { container } = renderSelect({ value: OPTIONS[0], name: 'mySelect' });
            const clearIcon = container.querySelector(`.${styles.clear}`) as HTMLElement;
            expect(clearIcon).toBeInTheDocument();

            fireEvent.click(clearIcon);
            expect(onChange).toHaveBeenCalledWith({ name: 'mySelect', option: null });
        });
    });

    describe('search / filtering', () => {
        it('fires callback when typing but does not filter options internally when onInputChange is provided', async () => {
            const onInputChange = vi.fn();
            const { container } = renderSelect({ onInputChange });

            const wrapper = container.querySelector(`.${styles.selectContainer}`);
            if (!wrapper) throw new Error('Select container not found');
            await act(async () => {
                fireEvent.click(wrapper);
            });

            const searchInput = container.querySelector('input');
            if (!searchInput) throw new Error('Search input not found');
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: 'B' } });
            });

            expect(onInputChange).toHaveBeenCalledWith('B');
            expect(await screen.findByText('Option B')).toBeInTheDocument();
            expect(screen.queryByText('Option A')).toBeInTheDocument();
        });

        it('does not internally filter options when onInputChange is provided', async () => {
            const onInputChange = vi.fn();
            const { container } = renderSelect({ onInputChange });

            const wrapper = container.querySelector(`.${styles.selectContainer}`);
            if (!wrapper) throw new Error('Select container not found');
            await act(async () => {
                fireEvent.click(wrapper);
            });

            const searchInput = container.querySelector('input');
            if (!searchInput) throw new Error('Search input not found');
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: 'B' } });
            });

            expect(onInputChange).toHaveBeenCalledWith('B');
            expect(screen.getByText('Option A')).toBeInTheDocument();
            expect(screen.getByText('Option B')).toBeInTheDocument();
            expect(screen.getByText('Option C')).toBeInTheDocument();
        });

        it('internally filters dropdown list items when typing without onInputChange', async () => {
            const { container } = renderSelect();

            const wrapper = container.querySelector(`.${styles.selectContainer}`);
            if (!wrapper) throw new Error('Select container not found');
            await act(async () => {
                fireEvent.click(wrapper);
            });

            const searchInput = container.querySelector('input');
            if (!searchInput) throw new Error('Search input not found');
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: 'B' } });
            });

            expect(await screen.findByText('Option B')).toBeInTheDocument();
            expect(screen.queryByText('Option A')).not.toBeInTheDocument();
        });

        it('restores the full options list when the search input is cleared after filtering', async () => {
            const { container } = renderSelect();

            const wrapper = container.querySelector(`.${styles.selectContainer}`);
            if (!wrapper) throw new Error('Select container not found');
            await act(async () => {
                fireEvent.click(wrapper);
            });

            const searchInput = container.querySelector('input');
            if (!searchInput) throw new Error('Search input not found');
            await act(async () => {
                fireEvent.change(searchInput, { target: { value: 'B' } });
            });
            expect(screen.queryByText('Option A')).not.toBeInTheDocument();

            await act(async () => {
                fireEvent.change(searchInput, { target: { value: '' } });
            });
            expect(await screen.findByText('Option A')).toBeInTheDocument();
            expect(screen.getByText('Option B')).toBeInTheDocument();
            expect(screen.getByText('Option C')).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('shows spinner and hides clear icon during loading states', () => {
            const { container } = renderSelect({ value: OPTIONS[0], loading: true });
            expect(container.querySelector(`.${styles.loading}`)).toBeInTheDocument();
            expect(container.querySelector(`.${styles.clear}`)).not.toBeInTheDocument();
        });
    });

    describe('validation updates', () => {
        it('shows warning text upon dynamic changes or clearing required selections', () => {
            const { rerender } = renderSelect({ showRequired: false });
            expect(screen.queryByText('Required')).not.toBeInTheDocument();

            rerender(
                <SelectInput
                    options={OPTIONS}
                    keyExtractor={keyExtractor}
                    valueExtractor={valueExtractor}
                    onChange={onChange}
                    showRequired={true}
                />,
            );
            expect(screen.getByText('Required')).toBeInTheDocument();
        });
    });
});
