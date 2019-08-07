export const isObject = (obj) => {
    return obj === Object(obj);
};

export const isArray = Array.isArray;

export const throttle = (fn, wait, options = {}) => {
    let context;
    let args;
    let result;
    let timeout = null;
    let previous = 0;
    const later = () => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = fn.apply(context, args);
        if (!timeout) {
            context = null;
            args = null;
        }
    };
    return (...args) => {
        const now = Date.now();
        if (!previous && options.leading === false) previous = now;
        const remaining = wait - (now - previous);
        context = this;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = fn.apply(context, args);
            if (!timeout) {
                context = null;
                args = null;
            }
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
