import React from 'react';

export const isObject = (obj) => {
    if(obj === null) {
        return false;
    }

    return  typeof obj === 'object' &&
        ['Array', 'Object'].includes(obj.constructor.name);
};

export const isArray = Array.isArray;

export const isEqual = (obj1, obj2, depth=1) => {
    if (obj1 === obj2) {
        return true;
    }

    if(!isObject(obj1) || depth===0) {
        return obj1 === obj2;
    }

    // compare type
    if (
        Object.prototype.toString.call(obj1) !==
        Object.prototype.toString.call(obj2)
    ) {
        return false;
    }

    // for array compare length first
    if(isArray(obj1)) {
        if(obj1.length !== obj2.length) {
            return false;
        }
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if(keys1.length !== keys2.length) {
        return false;
    }
    //for i loop is faster than array loops
    for(let i=0; i < keys1.length; i++) {
        const k = keys1[i];

        if(isObject(obj1[k])) {
            const equal = isEqual(obj1[k], obj2[k], depth-1);
            if(!equal) {
                return false;
            }
        } else {
            if(!(obj1[k] === obj2[k])) {
                return false;
            }
        }
    }

    return true;
};

export const isShallowEqual = (obj1, obj2) => {
    return isEqual(obj1, obj2, 1);
};

export const isDeepEqual = (obj1, obj2) => {
    return isEqual(obj1, obj2, 32);
};

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

export const debounce = (fn, wait) => {
    let timer = null;
    return function (...args) {
        const context = this;
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args);
        }, wait);
    };
};

export const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const isIntersectionObserverAvailable = () => (
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    'isIntersecting' in window.IntersectionObserverEntry.prototype
);

export const scrollToElement = (element) => {
    if(!element) {
        return;
    }
    const headerOffset = getComputedStyle(element).scrollMarginTop.replace('px', '');
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollBy({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

export const transformToElement = (Element) => {
    return React.isValidElement(Element)? (
        Element
    ): (
        <Element />
    );
};

export const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> c / 4))).toString(16)
    );
};

export const getNestedKey = (obj, ...args) => {
    return args.reduce((obj, level) => obj && obj[level], obj);
};

export const associateObjectPath = (path, val, obj) => {
    if(path.length === 0) {
        return val;
    }
    let idx = path[0];
    if (path.length > 1) {
        let nextObj = !!obj?.[idx] ? obj[idx] : {};
        val = associateObjectPath(Array.prototype.slice.call(path, 1), val, nextObj);
    }
    return associateObjectPath(idx, val, obj);
};

export const camelize = (...args) => {
    return args.join('-').replace(/-(,)/g, (_, char) => char.toUpperCase());
};

function setLevelsRecursively(node, currentLevel, {levelKey}) {
    node[levelKey] = currentLevel;
    node.children.forEach((child) => {
        setLevelsRecursively(child, currentLevel + 1, {levelKey});
    });
}

export function buildHierarchy(items, {
    levelKey = 'level', 
    childrenKey = 'children',
    keyExtractor = item => item.id,
    parentKeyExtractor = item => item.parent,
}) {
    const hierarchicalItemMap = new Map();
    items.forEach((item) => {
        const hierarchicalItem = {
            ...item,
            [levelKey]: -1,
            [childrenKey]: [],
        };
        const itemKey = keyExtractor(item);
        if (itemKey) {
            hierarchicalItemMap.set(itemKey, hierarchicalItem);
        }
    });

    const potentialRoots = [];
    hierarchicalItemMap.forEach((hierarchicalItem) => {
        const parentId = parentKeyExtractor(hierarchicalItem);
        let isRoot = true;

        if (parentId) {
            const parentItem = hierarchicalItemMap.get(parentId);
            if (parentItem) {
                parentItem[childrenKey].push(hierarchicalItem);
                isRoot = false;
            }
        }
        if (isRoot) {
            potentialRoots.push(hierarchicalItem);
        }
    });

    potentialRoots.forEach((root) => {
        if (root[levelKey] === -1) {
            setLevelsRecursively(root, 0, {levelKey});
        }
    });

    const finalRootNodes = potentialRoots.filter((node) => node[levelKey] === 0);

    return finalRootNodes;
}
