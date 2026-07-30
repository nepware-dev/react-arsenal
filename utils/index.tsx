import React from "react";

import type { ValueExtractor } from "../components/Form/MultiSelectInput/types";
import type { Hierarchical, KeyExtractor } from "../components/Table/Hierarchical";

export const isObject = (obj: unknown): obj is object => {
  if (obj === null) {
    return false;
  }

  return (
    typeof obj === "object" &&
    ["Array", "Object"].includes(obj.constructor.name)
  );
};

export const isArray = Array.isArray;

export const isEqual = (obj1: any, obj2: any, depth = 1): boolean => {
  if (obj1 === obj2) {
    return true;
  }

  if (!isObject(obj1) || depth === 0) {
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
  if (isArray(obj1)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }
  //for i loop is faster than array loops
  for (let i = 0; i < keys1.length; i++) {
    const k = keys1[i];

    const currentValue = obj1[k as keyof typeof obj1];

    if (isObject(currentValue)) {
      const equal = isEqual(currentValue, obj2[k], depth - 1);
      if (!equal) {
        return false;
      }
    } else {
      if (!(currentValue === obj2[k])) {
        return false;
      }
    }
  }

  return true;
};

export const isShallowEqual = (obj1: any, obj2: any): boolean => {
  return isEqual(obj1, obj2, 1);
};

export const isDeepEqual = (obj1: any, obj2: any): boolean => {
  return isEqual(obj1, obj2, 32);
};

export const throttle = (
  fn: (...args: any[]) => any,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {},
) => {
  let context: any;
  let args: any;
  let result: ReturnType<typeof fn>;
  let timeout: ReturnType<typeof setTimeout> | null = null;
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
  const throttled = function (this: any, ...newArgs: any[]) {
    const now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    context = this;
    args = newArgs;
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

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    previous = 0;
    context = null;
    args = null;
  };
  return throttled;
};

export const debounce = (fn: (...args: any[]) => any, wait: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: any[]) {
    const context = this;
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
};

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const isIntersectionObserverAvailable = () =>
  typeof window !== "undefined" &&
  "IntersectionObserver" in window &&
  "isIntersecting" in window.IntersectionObserverEntry.prototype;

export const isResizeObserverAvailable = () =>
  typeof ResizeObserver !== "undefined";

export const scrollToElement = (element: Element) => {
  if (!element) {
    return;
  }
  const headerOffset = +getComputedStyle(element).scrollMarginTop.replace(
    "px",
    "",
  );
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition - headerOffset;

  window.scrollBy({
    top: offsetPosition,
    behavior: "smooth",
  });
};

export const transformToElement = (
  Element: React.ComponentType | React.ReactElement,
): React.ReactElement => {
  if (React.isValidElement(Element)) {
    return Element;
  }

  return <Element />;
};

export const uuidv4 = () => {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16),
  );
};

export const getNestedKey = (obj: Record<string, any>, ...args: string[]) => {
  return args.reduce((obj, level) => obj && obj[level], obj);
};

export const associateObjectPath = (
  path: (string | number)[] | (string | number),
  val: any,
  obj: Record<string, any>,
): any => {
  if (!isArray(path) || path.length === 0) {
    return val;
  }
  let idx = path[0];
  if (path.length > 1) {
    let nextObj = obj?.[idx] ? obj[idx] : {};
    val = associateObjectPath(
      Array.prototype.slice.call(path, 1),
      val,
      nextObj,
    );
  }

  return associateObjectPath(idx, val, obj);
};

export const camelize = (...args: string[]) => {
  return args
    .join("-")
    .toLowerCase()
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
};

function setLevelsRecursively<
  T,
  C extends string = "children",
  L extends string = "level",
>(
  node: Hierarchical<T, C, L>,
  currentLevel: number,
  { levelKey, childrenKey }: { levelKey: L; childrenKey: C },
) {
  node[levelKey] = currentLevel as Hierarchical<T, C, L>[L];
  node[childrenKey].forEach((child) => {
    setLevelsRecursively(child, currentLevel + 1, { levelKey, childrenKey });
  });
}

export function buildHierarchy<
  T,
  C extends string = "children",
  L extends string = "level",
>(
  items: T[],
  {
    levelKey = "level" as L,
    childrenKey = "children" as C,
    keyExtractor = (item: T) =>
      (item as Record<string, unknown>).id as string | number,
    parentKeyExtractor = (item: Hierarchical<T, C, L>) =>
      (item as Record<string, unknown>).parent as string | number | null,
  }: {
    levelKey?: L;
    childrenKey?: C;
    keyExtractor?: KeyExtractor<T>;
    parentKeyExtractor?: ValueExtractor<
      Hierarchical<T, C, L>,
      string | number | null
    >;
  } = {},
): Hierarchical<T, C, L>[] {
  const hierarchicalItemMap = new Map<string | number, Hierarchical<T, C, L>>();
  items.forEach((item, idx) => {
    const hierarchicalItem = {
      ...item,
      [levelKey]: -1,
      [childrenKey]: [],
    } as Hierarchical<T, C, L>;
    const itemKey = keyExtractor(item, idx);
    if (itemKey) {
      hierarchicalItemMap.set(itemKey, hierarchicalItem);
    }
  });

  const potentialRoots: Hierarchical<T, C, L>[] = [];
  hierarchicalItemMap.forEach((hierarchicalItem) => {
    const parentId = parentKeyExtractor(hierarchicalItem);
    let isRoot = true;

    if (parentId) {
      const parentItem = hierarchicalItemMap.get(parentId);
      if (parentItem) {
        (parentItem[childrenKey] as Hierarchical<T, C, L>[]).push(
          hierarchicalItem,
        );
        isRoot = false;
      }
    }
    if (isRoot) {
      potentialRoots.push(hierarchicalItem);
    }
  });

  potentialRoots.forEach((root) => {
    if (root[levelKey] === -1) {
      setLevelsRecursively(root, 0, { levelKey, childrenKey });
    }
  });

  const finalRootNodes = potentialRoots.filter((node) => node[levelKey] === 0);

  return finalRootNodes;
}

export const formatFileSize = (
  bytes?: number | null,
  options: { base1000?: boolean; numFixed?: number } = {},
) => {
  const { base1000 = true, numFixed = 2 } = options;
  if (!bytes) {
    return "0.00 B";
  }
  const base = base1000 ? 1000 : 1024;
  const e = Math.floor(Math.log(bytes) / Math.log(base));
  const siPrefixes = ["", "K", "M", "G", "T", "P", "E"];
  const iecPrefixes = ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei"];
  const prefixes = base1000 ? siPrefixes : iecPrefixes;
  const prefix = prefixes[e] ?? "";
  const size = (bytes / Math.pow(base, e)).toFixed(numFixed);
  return `${size} ${prefix}B`.replace("  ", " ");
};

export const isNullOrUndefined = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};
