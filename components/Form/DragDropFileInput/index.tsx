import React, { useCallback, useState, useEffect, useRef } from 'react';

import styles from './styles.module.scss';
import type { DragDropFileInputProps } from './types';
import { eventHasFiles, fileAccepted, fileMatchSize, TOO_MANY_FILES_REJECTION } from './utils';
import FileInput from '../FileInput';
import cs from '../../../cs';
import { transformToElement } from '../../../utils';

interface MetaState {
    error: string | null;
    warning: string | null;
}

const DragDropFileInput: React.FC<DragDropFileInputProps> = (props) => {
    const frameDragTracker = useRef(0);

    const {
        name,
        onChange,
        multiple,
        accept,
        required,
        disabled,
        minSize,
        maxSize,
        maxFiles = 1,
        validator,
        onDragOver,
        onDragLeave,
        frame = window.document,
        onFrameDragEnter,
        onFrameDragLeave,
        containerClassName,
        dropZoneClassName,
        activeDropZoneClassName = '',
        dragOverFrameClassName = '',
        DropZoneComponent,
        onInvalid,
        ...inputProps
    } = props;

    const [meta, setMeta] = useState<MetaState>({
        error: null,
        warning: null,
    });

    useEffect(() => {
        if (inputProps.showRequired) {
            setMeta((prevMeta) => ({ ...prevMeta, warning: 'Required' }));
        }
        if (inputProps.errorMessage) {
            setMeta((prevMeta) => ({
                ...prevMeta,
                error: 'Error',
            }));
        }
    }, [inputProps.showRequired, inputProps.errorMessage]);

    const [isDragOverTarget, setDragOverTarget] = useState(false);
    const [isDragOverFrame, setDragOverFrame] = useState(false);

    const resetDragging = useCallback(() => {
        frameDragTracker.current = 0;
        setDragOverFrame(false);
        setDragOverTarget(false);
    }, []);

    const handleWindowDragOverOrDrop = useCallback(
        (event: DragEvent) => event.preventDefault(),
        [],
    );

    const handleFrameDrag = useCallback(
        (event: DragEvent) => {
            if (!eventHasFiles(event) || disabled) {
                return;
            }
            frameDragTracker.current += event.type === 'dragenter' ? 1 : -1;
            if (frameDragTracker.current === 1) {
                setDragOverFrame(true);
                onFrameDragEnter && onFrameDragEnter(event);
                return;
            }
            if (frameDragTracker.current === 0) {
                setDragOverFrame(false);
                onFrameDragLeave && onFrameDragLeave(event);
                return;
            }
        },
        [onFrameDragEnter, onFrameDragLeave, disabled],
    );

    const handleFrameDrop = useCallback(() => {
        if (isDragOverTarget) {
            return;
        }
        resetDragging();
    }, [isDragOverTarget, resetDragging]);

    const startFrameListeners = useCallback(
        (frame: HTMLElement | Document) => {
            if (frame) {
                frame.addEventListener('dragenter', handleFrameDrag as EventListener);
                frame.addEventListener('dragleave', handleFrameDrag as EventListener);
                frame.addEventListener('drop', handleFrameDrop as EventListener);
            }
        },
        [handleFrameDrag, handleFrameDrop],
    );
    const stopFrameListeners = useCallback(
        (frame: HTMLElement | Document) => {
            if (frame) {
                frame.removeEventListener('dragenter', handleFrameDrag as EventListener);
                frame.removeEventListener('dragleave', handleFrameDrag as EventListener);
                frame.removeEventListener('drop', handleFrameDrop as EventListener);
            }
        },
        [handleFrameDrag, handleFrameDrop],
    );

    useEffect(() => {
        startFrameListeners(frame);
        window.addEventListener('dragover', handleWindowDragOverOrDrop);
        window.addEventListener('drop', handleWindowDragOverOrDrop);
        return () => {
            stopFrameListeners(frame);
            window.removeEventListener('dragover', handleWindowDragOverOrDrop);
            window.removeEventListener('drop', handleWindowDragOverOrDrop);
        };
    }, [frame, handleWindowDragOverOrDrop, startFrameListeners, stopFrameListeners]);

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (!disabled && eventHasFiles(event)) {
                setDragOverTarget(true);
                onDragOver && onDragOver(event);
            }
        },
        [onDragOver, disabled],
    );

    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (disabled) {
                return;
            }
            setDragOverTarget(false);
            onDragLeave && onDragLeave(event);
        },
        [onDragLeave, disabled],
    );

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (!disabled && onChange && eventHasFiles(event)) {
                const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
                const acceptedFiles: File[] = [];
                const fileRejections: { errors: any[]; file: File }[] = [];
                files.forEach((file) => {
                    const [accepted, acceptError] = fileAccepted(file, accept);
                    const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
                    const customErrors = validator ? validator(file) : null;

                    if (accepted && sizeMatch && !customErrors) {
                        acceptedFiles.push(file);
                    } else {
                        let errors: any = [acceptError, sizeError];
                        if (customErrors) {
                            const customErrorsArray = Array.isArray(customErrors)
                                ? customErrors
                                : [customErrors];
                            errors = errors.concat(customErrorsArray);
                        }
                        fileRejections.push({ file, errors: errors.filter(Boolean) });
                    }
                });
                if (
                    (!multiple && acceptedFiles.length > 1) ||
                    (multiple && maxFiles >= 1 && acceptedFiles.length > maxFiles)
                ) {
                    acceptedFiles.forEach((file) => {
                        fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
                    });
                    acceptedFiles.splice(0);
                }
                onChange({ name, files: acceptedFiles, rejections: fileRejections });
            }
            resetDragging();
        },
        [
            onChange,
            resetDragging,
            disabled,
            multiple,
            name,
            maxFiles,
            minSize,
            maxSize,
            accept,
            validator,
        ],
    );

    const handleChange = useCallback(
        (target: HTMLInputElement) => {
            if (disabled) {
                return;
            }
            const files = target.files ? [...target.files] : [];

            const acceptedFiles: File[] = [];
            const fileRejections: { errors: any[]; file: File }[] = [];

            files.forEach((file) => {
                const [accepted, acceptError] = fileAccepted(file, accept);
                const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
                const customErrors = validator ? validator(file) : null;
                if (accepted && sizeMatch && !customErrors) {
                    acceptedFiles.push(file);
                } else {
                    let errors: any = [acceptError, sizeError];
                    if (customErrors) {
                         const customErrorsArray = Array.isArray(customErrors)
                                ? customErrors
                                : [customErrors];
                        errors = errors.concat(customErrorsArray);
                    }
                    fileRejections.push({ file, errors: errors.filter(Boolean) });
                }
            });
            if (multiple && maxFiles >= 1 && acceptedFiles.length > maxFiles) {
                acceptedFiles.forEach((file) => {
                    fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
                });
                acceptedFiles.splice(0);
            }
            if (acceptedFiles.length) {
                setMeta((prevMeta) => ({ ...prevMeta, warning: null, error: null }));
            } else if (required) {
                setMeta((prevMeta) => ({ ...prevMeta, warning: 'Required' }));
            }
            onChange?.({ name: target.name, files: acceptedFiles, rejections: fileRejections });
        },
        [disabled, onChange, multiple, maxFiles, minSize, maxSize, validator, required],
    );

    return (
        <div
            className={containerClassName}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <label
                className={cs(styles.dropZone, dropZoneClassName, {
                    [styles.dropZoneDisabled]: disabled,
                    [dragOverFrameClassName]: !isDragOverTarget && isDragOverFrame && !disabled,
                    [activeDropZoneClassName]: isDragOverTarget && !disabled,
                    [styles.dropZoneWarning]: meta.warning,
                    [styles.dropZoneError]: meta.error,
                })}
            >
                <FileInput
                    className={styles.fileInput}
                    name={name}
                    multiple={multiple}
                    onChange={handleChange}
                    accept={accept}
                    disabled={disabled}
                    required={required}
                    data-testid='file-input'
                    {...inputProps}
                />
                {DropZoneComponent
                    ? transformToElement(DropZoneComponent)
                    : 'Drag & drop or click here to add files'}
            </label>
        </div>
    );
};

export default DragDropFileInput;

export * from './types';
