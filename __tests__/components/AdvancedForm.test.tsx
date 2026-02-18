import '@testing-library/jest-dom';
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { useRef } from 'react';

import Form from '../../components/Form';
import Input from '../../components/Form/Input';
import SelectInput from '../../components/Form/SelectInput';

interface OptionType {
    id: string;
    name: string;
}
const SELECT_OPTIONS: OptionType[] = [
    { id: '1', name: 'Option A' },
    { id: '2', name: 'Option B' },
    { id: '3', name: 'Option C' },
];

const fieldValueExtractor = (payload: { option: OptionType | null }) => payload.option?.name ?? '';
const valueExtractor = (item: OptionType) => item.name;
const keyExtractor = (item: OptionType) => item.id;

afterEach(() => {
    cleanup();
});

describe('Form (Advanced)', () => {
    describe('Basic rendering', () => {
        it('renders a <form> element', () => {
            const { container } = render(
                <Form onSubmit={vi.fn()} data-testid="my-form" className="custom-form">
                    <button type="submit">Submit</button>
                </Form>,
            );

            const form = container.querySelector('form');

            expect(form).toBeInTheDocument();

            expect(form).toHaveAttribute('data-testid', 'my-form');
            expect(form).toHaveClass('custom-form');
        });

    });

    describe('Form.Input with Input component', () => {
        it('renders the Input component inside the form', () => {
            render(
                <Form onSubmit={vi.fn()}>
                    <Form.Input component={Input} name="username" label="Email address" placeholder="Username" />
                </Form>,
            );

            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
            expect(screen.getByText('Email address')).toBeInTheDocument();
        });

        it('calls the external onChange handler when the input value changes', () => {
            const handleChange = vi.fn();

            render(
                <Form onSubmit={vi.fn()}>
                    <Form.Input
                        component={Input}
                        name="username"
                        onChange={handleChange}
                        placeholder="Username"
                    />
                </Form>,
            );

            fireEvent.change(screen.getByPlaceholderText('Username'), {
                target: { value: 'john' },
            });

            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it('captures the typed value in formData on submit', async () => {
            const onSubmit = vi.fn();

            render(
                <Form onSubmit={onSubmit} data-testid="form">
                    <Form.Input component={Input} name="username" placeholder="Username" />
                    <button type="submit">Submit</button>
                </Form>,
            );

            fireEvent.change(screen.getByPlaceholderText('Username'), {
                target: { name: 'username', value: 'john_doe' },
            });

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
            const [formData] = onSubmit.mock.calls[0] as [FormData];
            expect(formData.get('username')).toBe('john_doe');
        });

        it('passes errorMessage from form error prop down to the Input', () => {
            render(
                <Form onSubmit={vi.fn()} error={{ username: 'Name is required' }}>
                    <Form.Input component={Input} name="username" placeholder="Username" />
                </Form>,
            );

            expect(screen.getByText('Name is required')).toBeInTheDocument();
        });
    });

    describe('Form.Input with SelectInput component', () => {
        it('renders SelectInput with the provided options', () => {
            render(
                <Form onSubmit={vi.fn()}>
                    <Form.Input
                        component={SelectInput<OptionType, string>}
                        name="category"
                        options={SELECT_OPTIONS}
                        placeholder="Pick one"
                        valueExtractor={valueExtractor}
                        keyExtractor={keyExtractor}
                    />
                </Form>,
            );

            expect(screen.getByText('Pick one')).toBeInTheDocument();
        });

        it('calls the external onChange handler when a SelectInput option is chosen', async () => {
            const handleChange = vi.fn();

            render(
                <Form onSubmit={vi.fn()}>
                    <Form.Input
                        component={SelectInput<OptionType, string>}
                        name="category"
                        options={SELECT_OPTIONS}
                        onChange={handleChange}
                        valueExtractor={valueExtractor}
                        keyExtractor={keyExtractor}
                    />
                </Form>,
            );

            const control = screen.getByText('Select...');
            await act(async () => {
                fireEvent.click(control);
            });

            const optionA = await screen.findByText('Option A');
            await act(async () => {
                fireEvent.click(optionA);
            });

            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it('captures the selected value in formData on submit', async () => {
            const onSubmit = vi.fn();

            render(
                <Form onSubmit={onSubmit} data-testid="form">
                    <Form.Input
                        component={SelectInput<OptionType, string>}
                        name="category"
                        options={SELECT_OPTIONS}
                        fieldValueExtractor={fieldValueExtractor}
                        valueExtractor={valueExtractor}
                        keyExtractor={keyExtractor}
                    />
                    <button type="submit">Submit</button>
                </Form>,
            );

            const control = screen.getByText('Select...');
            await act(async () => {
                fireEvent.click(control);
            });

            const optionB = await screen.findByText('Option B');
            await act(async () => {
                fireEvent.click(optionB);
            });

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
            const [formData] = onSubmit.mock.calls[0] as [FormData];
            expect(formData.get('category')).toBe('Option B');
        });
    });

    describe('Form submission', () => {
        it('calls onSubmit with a FormData instance when submitted', async () => {
            const onSubmit = vi.fn();

            render(
                <Form onSubmit={onSubmit} data-testid="form">
                    <button type="submit">Submit</button>
                </Form>,
            );

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
            expect(onSubmit.mock.calls[0][0]).toBeInstanceOf(FormData);
        });

        it('does not call onSubmit when a required Input field is empty', async () => {
            const onSubmit = vi.fn();
            const onInvalidSubmit = vi.fn();

            render(
                <Form onSubmit={onSubmit} onInvalidSubmit={onInvalidSubmit} data-testid="form">
                    <Form.Input component={Input} name="username" required placeholder="Username" />
                    <button type="submit">Submit</button>
                </Form>,
            );

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(onInvalidSubmit).toHaveBeenCalledWith('required'));
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('shows the required warning indicator when invalid submit occurs on empty required field', async () => {
            render(
                <Form onSubmit={vi.fn()} data-testid="form">
                    <Form.Input component={Input} name="username" required placeholder="Username" />
                    <button type="submit">Submit</button>
                </Form>,
            );

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(screen.getByText('Required')).toBeInTheDocument());
        });

        it('pre-populates formData from defaultFormData on submit', async () => {
            const onSubmit = vi.fn();
            const prefilled = new FormData();
            prefilled.set('token', 'abc123');

            render(
                <Form onSubmit={onSubmit} defaultFormData={prefilled} data-testid="form">
                    <button type="submit">Submit</button>
                </Form>,
            );

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
            const [formData] = onSubmit.mock.calls[0] as [FormData];
            expect(formData.get('token')).toBe('abc123');
        });
    });

    describe('Form onChange', () => {
        it('calls form onChange handler when a named input fires a native change event', () => {
            const handleChange = vi.fn();

            render(
                <Form onChange={handleChange}>
                    <Form.Input component={Input} name="notes" placeholder="Notes" />
                </Form>,
            );

            fireEvent.change(screen.getByPlaceholderText('Notes'), {
                target: { name: 'notes', value: 'hello' },
            });

            expect(handleChange).toHaveBeenCalledTimes(1);
        });
    });

    describe('Form.InputGroup', () => {
        it('collects grouped field values with the group prefix on submit', async () => {
            const onSubmit = vi.fn();

            render(
                <Form onSubmit={onSubmit} data-testid="form">
                    <Form.InputGroup name="address">
                        <Form.Input component={Input} name="street" placeholder="Street" />
                    </Form.InputGroup>
                    <button type="submit">Submit</button>
                </Form>,
            );

            fireEvent.change(screen.getByPlaceholderText('Street'), {
                target: { name: 'street', value: '123 Main St' },
            });

            fireEvent.submit(screen.getByTestId('form'));

            await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
            const [formData] = onSubmit.mock.calls[0] as [FormData];

            expect(formData.get('address.street')).toBe('123 Main St');
        });
    });

    describe('Ref handle', () => {
        it('exposes getFormData() that returns the current FormData', () => {
            let formRef: React.RefObject<{
                getFormData: () => FormData;
                nativeForm: HTMLFormElement | null;
            }>;

            const TestComponent = () => {
                formRef = useRef(null) as any;
                return (
                    <Form ref={formRef as any} onSubmit={vi.fn()}>
                        <Form.Input component={Input} name="city" placeholder="City" />
                    </Form>
                );
            };

            render(<TestComponent />);

            fireEvent.change(screen.getByPlaceholderText('City'), {
                target: { name: 'city', value: 'Paris' },
            });

            const fd = formRef!.current!.getFormData();
            expect(fd).toBeInstanceOf(FormData);
            expect(fd.get('city')).toBe('Paris');
        });

        it('exposes nativeForm pointing to the <form> DOM element', () => {
            let formRef: React.RefObject<{
                getFormData: () => FormData;
                nativeForm: HTMLFormElement | null;
            }>;

            const TestComponent = () => {
                formRef = useRef(null) as any;
                return (
                    <Form ref={formRef as any} onSubmit={vi.fn()}>
                        <div />
                    </Form>
                );
            };

            const { container } = render(<TestComponent />);
            expect(formRef!.current!.nativeForm).toBe(container.querySelector('form'));
        });
    });
});
