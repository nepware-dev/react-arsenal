import React, {useCallback, useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';

import FileInput from '../FileInput';

import cs from '../../../cs';
import {transformToElement} from '../../../utils';
import {
    accepts, 
    eventHasFiles, 
    fileAccepted, 
    fileMatchSize, 
    TOO_MANY_FILES_REJECTION,
} from './utils';

import styles from './styles.module.scss';

const propTypes = {
    /**
     * The name attribute for the underlying input element.
     */
    name: PropTypes.string,
    
    /**
     * Called when user drops file(s) into a dropzone OR selects files from input.
     * @param {String} name - The name of the input element supplied.
     * @param {Array} files - Array of accepted files: Empty if all files are rejected.
     * @param {Array} rejections - Array of rejected files with respective errors.
     */
    onChange: PropTypes.func.isRequired,

    /**
     * Indicates if multiple files can be added.
     */
    multiple: PropTypes.bool,
    
    /**
     * One or more unique file type specifiers describing file types to allow.
     * Follows https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept 
     */
    accept: PropTypes.string,

    /**
     * Indicates whether the input should be disabled.
     */
     disabled: PropTypes.bool,

    /**
     * Minimum size (IN KILOBYTES) of files to accept.
     */
    minSize: PropTypes.number,
    
    /**
     * Maximum size (IN KILOBYTES) of files to accept.
     */
    maxSize: PropTypes.number,
    
    /**
     * Maximum number of files to be accepted.
     * If user adds more than this value, all files will be rejected with Too many files error.
     */
    maxFiles: PropTypes.number,
    
    /**
     * Custom validator that is checked for each file the user inputs.
     * @param {File} file
     * @returns {String|Error|Error[]}
     */
    validator: PropTypes.func,
    
    /**
     * Called when user drags a file over the dropzone.
     * @param {(DragEvent|Event)} event
     */
    onDragOver: PropTypes.func,
    
    /**
     * Called when user drags a file and leaves the dropzone.
     * @param {(DragEvent|Event)} event
     */
    onDragLeave: PropTypes.func,
    
    /**
     * The element that is to be considered as frame.
     * This allows customizing the component when the user is dragging files into an area different from the file dropzone.
     * Defaults to window.document.
     */
    frame: PropTypes.element,
    
    /**
     * Called when user drags a file and enters the frame.
     * @param {(DragEvent|Event)} event
     */
    onFrameDragEnter: PropTypes.func,
    
    /**
     * Called when user drags a file and leaves the frame.
     * @param {(DragEvent|Event)} event
     */
    onFrameDragLeave: PropTypes.func,

    /**
     * Classname applied to the container element.
     */
    containerClassName: PropTypes.string,
    
    /**
     * Classname applied to the label element wrapping the dropzone.
     */
    dropZoneClassName: PropTypes.string,
    
    /**
     * Classname applied to the dropzone when user is dragging over it.
     */
    activeDropZoneClassName: PropTypes.string,
    
    /**
     * Classname applied to the dropzone when user is dragging files over the frame.
     */
    dragOverFrameClassName: PropTypes.string,
    
    /**
     * Component that is rendered inside the dropzone.
     */
    DropZoneComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType,
    ]),
};

const DragDropFileInput = props => {
    const frameDragTracker = useRef(0);

    const {
        name,
        onChange,
        multiple,
        accept,
        disabled,
        minSize,
        maxSize,
        maxFiles,
        validator,
        onDragOver,
        onDragLeave,
        frame = window.document,
        onFrameDragEnter,
        onFrameDragLeave,
        containerClassName,
        dropZoneClassName,
        activeDropZoneClassName,
        errorDropZoneClassName,
        dragOverFrameClassName,
        DropZoneComponent,
        ...inputProps
    } = props;

    const [isDragOverTarget, setDragOverTarget] = useState(false);
    const [isDragOverFrame, setDragOverFrame] = useState(false);

    const resetDragging = useCallback(() => {
        frameDragTracker.current = 0;
        setDragOverFrame(false);
        setDragOverTarget(false);
    }, []);

    const handleWindowDragOverOrDrop = useCallback(event => event.preventDefault(), []);

    const handleFrameDrag = useCallback((event) => {
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
    }, [onFrameDragEnter, onFrameDragLeave, disabled, isDragOverTarget]);

    const handleFrameDrop = useCallback(event => {
        if(isDragOverTarget) {
            return;
        }
        resetDragging();
    }, [isDragOverTarget, resetDragging]);

    const startFrameListeners = useCallback((frame) => {
        if (frame) {
            frame.addEventListener('dragenter', handleFrameDrag);
            frame.addEventListener('dragleave', handleFrameDrag);
            frame.addEventListener('drop', handleFrameDrop);
        }
    }, [handleFrameDrag, handleFrameDrop]);
    const stopFrameListeners = useCallback((frame) => {
        if (frame) {
            frame.removeEventListener('dragenter', handleFrameDrag);
            frame.removeEventListener('dragleave', handleFrameDrag);
            frame.removeEventListener('drop', handleFrameDrop);
        }
    }, [handleFrameDrag, handleFrameDrop]);

    useEffect(() => {
        startFrameListeners(frame);
        window.addEventListener('dragover', handleWindowDragOverOrDrop);
        window.addEventListener('drop', handleWindowDragOverOrDrop);
        return () => {
            stopFrameListeners();
            window.removeEventListener('dragover', handleWindowDragOverOrDrop);
            window.removeEventListener('drop', handleWindowDragOverOrDrop);
        }
    }, [frame, handleWindowDragOverOrDrop, startFrameListeners, stopFrameListeners]);

    const handleDragOver = useCallback(event => {
        if (!disabled && eventHasFiles(event)) {
            setDragOverTarget(true);
            onDragOver && onDragOver(event);
        }
    }, [onDragOver, disabled]);

    const handleDragLeave = useCallback(event => {
        if(disabled) {
            return;
        }
        setDragOverTarget(false);
        onDragLeave && onDragLeave(event);
    }, [onDragLeave, disabled]);

    const handleDrop = useCallback(event => {
        if (!disabled && onChange && eventHasFiles(event)) {
            const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
            const acceptedFiles = [];
            const fileRejections = [];
            files.forEach(file => {
                const [accepted, acceptError] = fileAccepted(file, accept);
                const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
                const customErrors = validator ? validator(file) : null;

                if (accepted && sizeMatch && !customErrors) {
                    acceptedFiles.push(file);
                } else {
                    let errors = [acceptError, sizeError];
                    if (customErrors) {
                        errors = errors.concat(customErrors);
                    }
                    fileRejections.push({ file, errors });
                }
            });
            if ((!multiple && acceptedFiles.length > 1) || (multiple && maxFiles >= 1 &&  acceptedFiles.length > maxFiles)) {
                acceptedFiles.forEach(file => {
                    fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
                })
                acceptedFiles.splice(0);
            }
            onChange({name, files: acceptedFiles, rejections: fileRejections});
        }
        resetDragging();
    }, [
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
    ]);

    const handleChange = useCallback(target => {
        if(disabled) {
            return;
        }
        const files = [...target.files];

        const acceptedFiles = [];
        const fileRejections = [];

        files.forEach(file => {
            const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
            const customErrors = validator ? validator(file) : null;
            if (sizeMatch && !customErrors) {
                acceptedFiles.push(file);
            } else {
                let errors = [sizeError];
                if (customErrors) {
                    errors = errors.concat(customErrors);
                }
                fileRejections.push({ file, errors });
            }
        });
        if (multiple && maxFiles >= 1 && acceptedFiles.length > maxFiles) {
            acceptedFiles.forEach(file => {
                fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
            })
            acceptedFiles.splice(0);
        }
        onChange({name: target.name, files: acceptedFiles, rejections: fileRejections});
    }, [onChange, multiple, maxFiles, minSize, maxSize, validator]);

    const handleTargetClick = useCallback(event => {
        resetDragging();
    }, [resetDragging]);

    return (
        <div
            className={containerClassName}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <label className={cs(styles.dropZone, dropZoneClassName, {
                [styles.dropZoneDisabled]: disabled,
                [dragOverFrameClassName]: !isDragOverTarget && isDragOverFrame && !disabled,
                [activeDropZoneClassName]: isDragOverTarget && !disabled,
            })}>
                <FileInput 
                    className={styles.fileInput} 
                    name={name}
                    multiple={multiple} 
                    onChange={handleChange}
                    accept={accept}
                    disabled={disabled}
                    {...inputProps} 
                />
                {DropZoneComponent
                    ? transformToElement(DropZoneComponent) 
                    : 'Drag & drop or click here to add files'
                }
            </label>
        </div>
    );
};

DragDropFileInput.propTypes = propTypes;

export default DragDropFileInput;
