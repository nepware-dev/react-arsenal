import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import DragDropFileInput from '../../../components/Form/DragDropFileInput';

const createTestFile = (name = 'test.png', type = 'image/png', sizeBytes = 1000): File =>
    new File(['x'.repeat(sizeBytes)], name, { type });

const createDropEvent = (target: HTMLElement, files: File[]): Event => {
    const event = createEvent.drop(target);
    Object.defineProperty(event, 'dataTransfer', {
        value: { files, types: ['Files'] },
    });
    return event;
};

const createDragOverEvent = (target: HTMLElement): Event => {
    const event = createEvent.dragOver(target);
    Object.defineProperty(event, 'dataTransfer', {
        value: { types: ['Files'] },
    });
    return event;
};

describe('DragDropFileInput', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    describe('rendering', () => {
        it('renders default drop zone text', () => {
            render(<DragDropFileInput name="file" onChange={onChange} />);
            expect(
                screen.getByText('Drag & drop or click here to add files'),
            ).toBeInTheDocument();
        });

        it('renders a custom DropZoneComponent', () => {
            render(
                <DragDropFileInput
                    name="file"
                    onChange={onChange}
                    DropZoneComponent={<span>Upload here</span>}
                />,
            );
            expect(screen.getByText('Upload here')).toBeInTheDocument();
        });
    });

    describe('file input change', () => {
        it('calls onChange with an accepted file', () => {
            render(<DragDropFileInput name="upload" onChange={onChange} />);
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const file = createTestFile();
            Object.defineProperty(input, 'files', { value: [file], configurable: true });
            fireEvent.change(input);

            expect(onChange).toHaveBeenCalledOnce();
            const [payload] = onChange.mock.calls[0];
            expect(payload.name).toBe('upload');
            expect(payload.files).toHaveLength(1);
            expect(payload.rejections).toHaveLength(0);
        });

        it('rejects a file with invalid type when accept is set', () => {
            render(<DragDropFileInput name="upload" onChange={onChange} accept=".pdf" />);
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const file = createTestFile('image.png', 'image/png');
            Object.defineProperty(input, 'files', { value: [file], configurable: true });
            fireEvent.change(input);

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections).toHaveLength(1);
            expect(payload.rejections[0].errors[0].code).toBe('file-invalid-type');
        });

        it('rejects a file that exceeds maxSize', () => {
            render(<DragDropFileInput name="upload" onChange={onChange} maxSize={1} />);
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const file = createTestFile('large.png', 'image/png', 1001);
            Object.defineProperty(input, 'files', { value: [file], configurable: true });
            fireEvent.change(input);

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections[0].errors[0].code).toBe('file-too-large');
        });

        it('rejects a file that is too small', () => {
            render(<DragDropFileInput name="upload" onChange={onChange} minSize={10} />);
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const file = createTestFile('tiny.png', 'image/png', 1);
            Object.defineProperty(input, 'files', { value: [file], configurable: true });
            fireEvent.change(input);

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections[0].errors[0].code).toBe('file-too-small');
        });

        it('rejects all files when count exceeds maxFiles in multiple mode', () => {
            render(
                <DragDropFileInput
                    name="upload"
                    onChange={onChange}
                    multiple
                    maxFiles={1}
                />,
            );
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const files = [createTestFile('a.png'), createTestFile('b.png')];
            Object.defineProperty(input, 'files', { value: files, configurable: true });
            fireEvent.change(input);

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections[0].errors[0].code).toBe('too-many-files');
        });

        it('does not call onChange when disabled', () => {
            render(<DragDropFileInput name="upload" onChange={onChange} disabled />);
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const file = createTestFile();
            Object.defineProperty(input, 'files', { value: [file], configurable: true });
            fireEvent.change(input);

            expect(onChange).not.toHaveBeenCalled();
        });

        it('rejects files that fail the custom validator', () => {
            const validator = vi.fn().mockReturnValue('custom-error');
            render(
                <DragDropFileInput name="upload" onChange={onChange} validator={validator} />,
            );
            const input = screen.getByTestId('file-input') as HTMLInputElement;
            const file = createTestFile();
            Object.defineProperty(input, 'files', { value: [file], configurable: true });
            fireEvent.change(input);

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections[0].errors).toContain('custom-error');
        });
    });

    describe('drag and drop', () => {
        it('calls onChange with accepted dropped files', () => {
            const { container } = render(
                <DragDropFileInput name="upload" onChange={onChange} />,
            );
            const dropZone = container.firstChild as HTMLElement;
            fireEvent(dropZone, createDropEvent(dropZone, [createTestFile()]));

            expect(onChange).toHaveBeenCalledOnce();
            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(1);
            expect(payload.rejections).toHaveLength(0);
        });

        it('rejects dropped files with invalid type', () => {
            const { container } = render(
                <DragDropFileInput name="upload" onChange={onChange} accept=".pdf" />,
            );
            const dropZone = container.firstChild as HTMLElement;
            fireEvent(dropZone, createDropEvent(dropZone, [createTestFile('img.png', 'image/png')]));

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections[0].errors[0].code).toBe('file-invalid-type');
        });

        it('rejects all dropped files when count exceeds maxFiles in single mode', () => {
            const { container } = render(
                <DragDropFileInput name="upload" onChange={onChange} />,
            );
            const dropZone = container.firstChild as HTMLElement;
            const files = [createTestFile('a.png'), createTestFile('b.png')];
            fireEvent(dropZone, createDropEvent(dropZone, files));

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections).toHaveLength(2);
            expect(payload.rejections[0].errors[0].code).toBe('too-many-files');
        });

        it('rejects all dropped files when count exceeds maxFiles in multiple mode', () => {
            const { container } = render(
                <DragDropFileInput name="upload" onChange={onChange} multiple maxFiles={1} />,
            );
            const dropZone = container.firstChild as HTMLElement;
            const files = [createTestFile('a.png'), createTestFile('b.png')];
            fireEvent(dropZone, createDropEvent(dropZone, files));

            const [payload] = onChange.mock.calls[0];
            expect(payload.files).toHaveLength(0);
            expect(payload.rejections).toHaveLength(2);
            expect(payload.rejections[0].errors[0].code).toBe('too-many-files');
        });

        it('does not call onChange on drop when disabled', () => {
            const { container } = render(
                <DragDropFileInput name="upload" onChange={onChange} disabled />,
            );
            const dropZone = container.firstChild as HTMLElement;
            fireEvent(dropZone, createDropEvent(dropZone, [createTestFile()]));

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not set active state when dragging over a disabled component', () => {
            const { container } = render(
                <DragDropFileInput
                    name="upload"
                    onChange={onChange}
                    activeDropZoneClassName="active"
                    disabled
                />,
            );
            const dropZone = container.firstChild as HTMLElement;
            fireEvent(dropZone, createDragOverEvent(dropZone));

            expect(dropZone.querySelector('label')).not.toHaveClass('active');
        });
    });

    describe('frame drag events', () => {
        const createFrameDragEvent = (type: string): DragEvent => {
            const event = new Event(type, { bubbles: false }) as DragEvent;
            Object.defineProperty(event, 'dataTransfer', {
                value: { types: ['Files'] },
            });
            return event;
        };

        it('calls onFrameDragEnter when a drag enters the frame', () => {
            const onFrameDragEnter = vi.fn();
            const frame = document.createElement('div');
            render(
                <DragDropFileInput
                    name="upload"
                    onChange={onChange}
                    frame={frame}
                    onFrameDragEnter={onFrameDragEnter}
                />,
            );

            frame.dispatchEvent(createFrameDragEvent('dragenter'));

            expect(onFrameDragEnter).toHaveBeenCalledOnce();
        });

        it('calls onFrameDragLeave when a drag leaves the frame', () => {
            const onFrameDragLeave = vi.fn();
            const frame = document.createElement('div');
            render(
                <DragDropFileInput
                    name="upload"
                    onChange={onChange}
                    frame={frame}
                    onFrameDragLeave={onFrameDragLeave}
                />,
            );

            frame.dispatchEvent(createFrameDragEvent('dragenter'));
            frame.dispatchEvent(createFrameDragEvent('dragleave'));

            expect(onFrameDragLeave).toHaveBeenCalledOnce();
        });

        it('removes listener from the old frame on re-render', () => {
            const frame1 = document.createElement('div');
            const frame1Spy = vi.spyOn(frame1, 'removeEventListener');
            const frame2 = document.createElement('div');
            const { rerender } = render(
                <DragDropFileInput
                    name="upload"
                    onChange={onChange}
                    frame={frame1}
                />,
            );
            rerender(
                <DragDropFileInput
                    name="upload"
                    onChange={onChange}
                    frame={frame2}
                />,
            );

            expect(frame1Spy).toHaveBeenCalledWith('dragenter', expect.any(Function));
        });
    });
});
