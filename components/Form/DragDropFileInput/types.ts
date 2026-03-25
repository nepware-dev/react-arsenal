import * as React from 'react';

import { InputProps } from '../Input';

export type FileInputChangeCallback = (payload: {
    name?: string;
    files: File[];
    rejections: { errors: any[]; file: File }[];
}) => void;

export type FileValidator = (file: File) => string | Error | Error[];

export interface DragDropFileInputProps extends Omit<InputProps, 'onChange' | 'type'> {
    /**
     * The name attribute for the underlying input element.
     */
    name?: string;
    /**
     * Called when user drops file(s) into a dropzone OR selects files from input.
     */
    onChange?: FileInputChangeCallback;
    /**
     * Indicates if multiple files can be added.
     */
    multiple?: boolean;
    /**
     * One or more unique file type specifiers describing file types to allow.
     * Follows https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
     */
    accept?: string;
    /**
     * Indicates whether the input should be disabled.
     */
    disabled?: boolean;
    /**
     * Minimum size (IN KILOBYTES) of files to accept.
     */
    minSize?: number;
    /**
     * Maximum size (IN KILOBYTES) of files to accept.
     */
    maxSize?: number;
    /**
     * Maximum number of files to be accepted.
     * If user adds more than this value, all files will be rejected with Too many files error.
     */
    maxFiles?: number;

    /**
     * Custom validator that is checked for each file the user inputs.
     */
    validator?: FileValidator;
    /**
     * Called when user drags a file over the dropzone.
     */
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
    /**
     * Called when user drags a file and leaves the dropzone.
     */
    onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
    /**
     * The element that is to be considered as frame.
     * This allows customizing the component when the user is dragging files into an area different from the file dropzone.
     * Defaults to window.document.
     */
    frame?: HTMLElement | Document;
    /**
     * Called when user drags a file and enters the frame.
     */
    onFrameDragEnter?: (event: DragEvent) => void;
    /**
     * Called when user drags a file and leaves the frame.
     */
    onFrameDragLeave?: (event: DragEvent) => void;
    /**
     * Classname applied to the container element.
     */
    containerClassName?: string;
    /**
     * Classname applied to the label element wrapping the dropzone.
     */
    dropZoneClassName?: string;
    /**
     * Classname applied to the dropzone when user is dragging over it.
     */
    activeDropZoneClassName?: string;
    /**
     * Classname applied to the dropzone when user is dragging files over the frame.
     */
    dragOverFrameClassName?: string;
    /**
     * Component that is rendered inside the dropzone.
     */
    DropZoneComponent?: React.ReactNode | React.ElementType;
    /**
     * Whether or not the component is required.
     */
    required?: boolean;
    showRequired?: boolean;
    errorMessage?: any;
}
