import { formatFileSize } from '../../../utils';

export const eventHasFiles = (event: DragEvent | React.DragEvent<HTMLDivElement>) => {
    return event.dataTransfer?.types?.some((type) => type === 'Files');
};

export const FILE_INVALID_TYPE = 'file-invalid-type';
export const FILE_TOO_LARGE = 'file-too-large';
export const FILE_TOO_SMALL = 'file-too-small';
export const TOO_MANY_FILES = 'too-many-files';

export function accepts(file: File, acceptedFiles?: string | string[]) {
    if (file && acceptedFiles) {
        const acceptedFilesArray = Array.isArray(acceptedFiles)
            ? acceptedFiles
            : acceptedFiles.split(',');
        const fileName = file.name || '';
        const mimeType = (file.type || '').toLowerCase();
        const baseMimeType = mimeType.replace(/\/.*$/, '');

        return acceptedFilesArray.some((type) => {
            const validType = type.trim().toLowerCase();
            if (validType.charAt(0) === '.') {
                return fileName.toLowerCase().endsWith(validType);
            } else if (validType.endsWith('/*')) {
                return baseMimeType === validType.replace(/\/.*$/, '');
            }
            return mimeType === validType;
        });
    }
    return true;
}

export const getInvalidTypeRejectionErr = (accept?: string) => {
    accept = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept;
    const messageSuffix = Array.isArray(accept)
        ? `one of the following: ${accept.join(', ')}`
        : accept;
    return {
        code: FILE_INVALID_TYPE,
        message: `Invalid file type. Accepted formats: ${messageSuffix}`,
    };
};

export const getTooLargeRejectionErr = (maxSize: number) => {
    const formattedSize = formatFileSize(maxSize * 1000);
    return {
        code: FILE_TOO_LARGE,
        message: `File size exceeds the maximum allowed limit of ${formattedSize}. Please select a smaller file.`,
    };
};

export const getTooSmallRejectionErr = (minSize: number) => {
    const formattedSize = formatFileSize(minSize * 1000);
    return {
        code: FILE_TOO_SMALL,
        message: `File size is below the minimum required size of ${formattedSize}. Please select a larger file.`,
    };
};

export const TOO_MANY_FILES_REJECTION = {
    code: TOO_MANY_FILES,
    message: 'Too many files selected. Please reduce the number of files and try again.',
};

function isDefined(value: any) {
    return value !== undefined && value !== null;
}

export function fileAccepted(file: File, accept?: string) {
    const isAcceptable = accepts(file, accept);
    return [isAcceptable, isAcceptable ? null : getInvalidTypeRejectionErr(accept)];
}

export function fileMatchSize(file: File, minSize?: number, maxSize?: number) {
    if (isDefined(file.size)) {
        if (isDefined(minSize) && isDefined(maxSize)) {
            if (file.size > maxSize! * 1000) {
                return [false, getTooLargeRejectionErr(maxSize!)];
            }
            if (file.size < minSize! * 1000) {
                return [false, getTooSmallRejectionErr(minSize!)];
            }
        } else if (isDefined(minSize) && file.size < minSize! * 1000) {
            return [false, getTooSmallRejectionErr(minSize!)];
        } else if (isDefined(maxSize) && file.size > maxSize! * 1000) {
            return [false, getTooLargeRejectionErr(maxSize!)];
        }
    }
    return [true, null];
}
