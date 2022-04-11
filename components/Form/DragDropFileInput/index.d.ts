import * as React from 'react';

export type FileInputChangeCallback = (payload: {
    name: string;
    files: FileList;
    rejections: {errors: any[]; file: File}[];
}) => void;

export type FileValidator = (file: File) => string | Error | Error[];

export interface DragDropFileInputProps {
    name?: string;
    onChange?: FileInputChangeCallback;
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;
    minSize?: number;
    maxSize?: number;
    maxFiles?: number;
    validator?: FileValidator;
    onDragOver?: React.EventHandler;
    onDragLeave?: React.EventHandler;
    frame?: HTMLElement;
    onFrameDragEnter?: React.EventHandler;
    onFrameDragLeave?: React.EventHandler;
    containerClassName?: string;
    dropZoneClassName?: string;
    activeDropZoneClassName?: string;
    dragOverFrameClassName?: string;
    DropZoneComponent?: React.ReactNode;
    required?: boolean;
};

declare const DragDropFileInput;

export default DragDropFileInput;
