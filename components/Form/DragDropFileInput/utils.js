export const eventHasFiles = (event) => {
    return event.dataTransfer?.types?.some(type => type === 'Files');
};

export const FILE_INVALID_TYPE = 'file-invalid-type'
export const FILE_TOO_LARGE = 'file-too-large'
export const FILE_TOO_SMALL = 'file-too-small'
export const TOO_MANY_FILES = 'too-many-files'

export function accepts(file, acceptedFiles) {
    if (file && acceptedFiles) {
        const acceptedFilesArray = Array.isArray(acceptedFiles)
            ? acceptedFiles
            : acceptedFiles.split(',');
        const fileName = file.name || '';
        const mimeType = (file.type || '').toLowerCase();
        const baseMimeType = mimeType.replace(/\/.*$/, '');

        return acceptedFilesArray.some(type => {
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
};

export const getInvalidTypeRejectionErr = accept => {
    accept = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept
    const messageSuffix = Array.isArray(accept) ? `one of ${accept.join(', ')}` : accept
    return {
        code: FILE_INVALID_TYPE,
        message: `File type must be ${messageSuffix}`,
    }
}

export const getTooLargeRejectionErr = maxSize => {
    return {
        code: FILE_TOO_LARGE,
        message: `File is larger than ${maxSize} kilobytes`,
    }
}

export const getTooSmallRejectionErr = minSize => {
    return {
        code: FILE_TOO_SMALL,
        message: `File is smaller than ${minSize} kilobytes`,
    }
}

export const TOO_MANY_FILES_REJECTION = {
    code: TOO_MANY_FILES,
    message: 'Too many files',
}

function isDefined(value) {
    return value !== undefined && value !== null;
}

export function fileAccepted(file, accept) {
  const isAcceptable = accepts(file, accept);
  return [isAcceptable, isAcceptable ? null : getInvalidTypeRejectionErr(accept)];
}

export function fileMatchSize(file, minSize, maxSize) {
    if (isDefined(file.size)) {
        if (isDefined(minSize) && isDefined(maxSize)) {
            if (file.size > maxSize * 1024) {
                return [false, getTooLargeRejectionErr(maxSize)];
            }
            if (file.size < minSize * 1024) {
                return [false, getTooSmallRejectionErr(minSize)];
            }
        } else if (isDefined(minSize) && file.size < minSize * 1024) {
            return [false, getTooSmallRejectionErr(minSize)];
        }
        else if (isDefined(maxSize) && file.size > maxSize * 1024) {
            return [false, getTooLargeRejectionErr(maxSize)];
        }
    }
    return [true, null];
}
