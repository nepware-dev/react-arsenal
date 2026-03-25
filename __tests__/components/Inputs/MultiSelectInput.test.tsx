import { act, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import MultiSelect, {
    type MultiSelectInputProps,
} from '../../../components/Form/MultiSelectInput';
import styles from '../../../components/Form/MultiSelectInput/styles.module.scss';
import controlStyles from '../../../components/Form/MultiSelectInput/SelectControl/styles.module.scss';

vi.mock('../../../components/Popup', () => ({
    default: ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => {
        if (!isVisible) return null;
        return <div data-testid="portal">{children}</div>;
    },
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

describe('MultiSelectInput', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    const renderMultiSelect = (props: Partial<MultiSelectInputProps<OptionType, string>> = {}) =>
        render(
            <MultiSelect
                options={OPTIONS}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                onChange={onChange}
                controlClassName="select-control"
                optionsWrapperClassName="select-options"
                {...props}
            />,
        );

    describe('rendering & configurations', () => {
        it('renders the placeholder and applies disabled / warning styles conditionally', () => {
            const { container } = renderMultiSelect({ placeholder: 'Pick items' });
            expect(screen.getByText('Pick items')).toBeInTheDocument();
            expect(container.querySelector(`.${styles.selectContainer}`)).toBeInTheDocument();

            const { container: disabledContainer } = renderMultiSelect({
                disabled: true,
            });
            expect(disabledContainer.querySelector(`.${styles.disabled}`)).toBeInTheDocument();
        });

        it('shows warning text when showRequired is true', () => {
            renderMultiSelect({ showRequired: false });
            expect(screen.queryByText('Required')).not.toBeInTheDocument();

            render(
                <MultiSelect
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

    describe('interactivity (open / close / select)', () => {
        it('opens the options on control click and closes on toggle', async () => {
            const { container } = renderMultiSelect();

            const control = container.querySelector('.select-control') as HTMLElement;

            await act(async () => {
                fireEvent.click(control);
            });

            const selectOptions = container.querySelector('.select-options') as HTMLElement;

            expect(selectOptions).toBeInTheDocument();

            await act(async () => {
                fireEvent.click(control);
            });

            expect(container.querySelector('.select-options')).not.toBeInTheDocument();
        });

        it('selects an item and calls onChange with the updated array', async () => {
            const { container } = renderMultiSelect({ name: 'myMultiSelect' });

            const control = container.querySelector('.select-control') as HTMLElement;

            await act(async () => {
                fireEvent.click(control);
            });

            const optionsContainer = container.querySelector('.select-options') as HTMLElement;
            const firstOption = optionsContainer.firstChild as HTMLElement;

            await act(async () => {
                fireEvent.click(firstOption);
            });

            expect(onChange).toHaveBeenCalledWith({
                name: 'myMultiSelect',
                value: [OPTIONS[0]],
            });
        });

        it('adds multiple items to the selection', async () => {
            const { container } = renderMultiSelect({ name: 'multi' });

            const control = container.querySelector('.select-control') as HTMLElement;

            await act(async () => {
                fireEvent.click(control);
            });

            const optionsContainer = container.querySelector('.select-options') as HTMLElement;
            const firstOption = optionsContainer.firstChild as HTMLElement;
            const secondOption = optionsContainer.children[1] as HTMLElement;

            await act(async () => {
                fireEvent.click(firstOption);
            });

            await act(async () => {
                fireEvent.click(secondOption);
            });

            expect(onChange).toHaveBeenLastCalledWith({
                name: 'multi',
                value: [OPTIONS[0], OPTIONS[1]],
            });
        });
    });

    describe('search / filtering', () => {
        it('filters options when typing in the search input', async () => {
            const { container } = renderMultiSelect();

            const control = container.querySelector('.select-control') as HTMLElement;

            await act(async () => {
                fireEvent.click(control);
            });

            const searchInput = container.querySelector('input') as HTMLInputElement;

            await act(async () => {
                fireEvent.change(searchInput, { target: { value: 'B' } });
            });

            const selectOptions = container.querySelector('.select-options') as HTMLElement;

            expect(selectOptions).toHaveTextContent(OPTIONS[1].label);
            expect(selectOptions).not.toHaveTextContent(OPTIONS[0].label);
            expect(selectOptions).not.toHaveTextContent(OPTIONS[2].label);
        });

        it('calls onInputChange when provided', async () => {
            const onInputChange = vi.fn();
            const { container } = renderMultiSelect({
                onInputChange,
            });

            const control = container.querySelector('.select-control') as HTMLElement;

            await act(async () => {
                fireEvent.click(control);
            });

            const searchInput = container.querySelector('input') as HTMLInputElement;

            await act(async () => {
                fireEvent.change(searchInput, { target: { value: 'A' } });
            });

            expect(onInputChange).toHaveBeenCalledWith('A');
        });
    });

    describe('loading state', () => {
        it('renders without crashing when loading', () => {
            const { container } = renderMultiSelect({ loading: true });
            expect(container.querySelector(`.${styles.selectContainer}`)).toBeInTheDocument();
        });
    });

    describe('controlled value', () => {
        it('respects the value prop and updates selected items', () => {
            const { container } = renderMultiSelect({
                value: [OPTIONS[0], OPTIONS[2]],
            });

            const control = container.querySelector('.select-control') as HTMLElement;

            expect(control).toHaveTextContent(OPTIONS[0].label);
            expect(control).not.toHaveTextContent(OPTIONS[1].label);
            expect(control).toHaveTextContent(OPTIONS[2].label);
        });
    });

    describe('default value', () => {
        it('selects default items on mount and fires onChange', () => {
            const { container } = renderMultiSelect({
                defaultValue: [OPTIONS[1]],
                name: 'defaultTest',
            });

            const control = container.querySelector('.select-control') as HTMLElement;

            expect(control).toHaveTextContent(OPTIONS[1].label);
            expect(onChange).toHaveBeenCalledWith({
                name: 'defaultTest',
                value: [OPTIONS[1]],
            });
        });
    });

    describe('remove item', () => {
        it('removes an item and calls onChange with remaining items', async () => {
            const onRemoveItem = vi.fn();
            const { container } = renderMultiSelect({
                value: [OPTIONS[0], OPTIONS[1]],
                name: 'removal',
                onChange: onRemoveItem,
            });

            const control = container.querySelector('.select-control') as HTMLElement;

            const selectedItem = screen.getByTestId(`selected-item-${OPTIONS[0].label}`);
            const closeButton = selectedItem.querySelector(
                `.${controlStyles.close}`,
            ) as HTMLElement;

            await act(async () => {
                fireEvent.click(closeButton);
            });

            expect(control).not.toHaveTextContent(OPTIONS[0].label);
            expect(onRemoveItem).toHaveBeenCalledTimes(1);
            expect(onRemoveItem).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: [OPTIONS[1]],
                }),
            );
            expect(control).toHaveTextContent(OPTIONS[1].label);
        });
    });
});
