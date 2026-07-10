import { isObject, isArray } from './utils';

type Nullish = undefined | null;

interface CSObject {
    [key: string]: boolean | Nullish;
}

export type CSClass = string | CSObject | [string, boolean] | Nullish | boolean;

const cs = (...classes: CSClass[]) => {
    return classes.filter(
        c => !!c
    ).map(c => {
        if (isArray(c) && c.length === 2) {
            return c[1] ? c[0] : false;
        }
        if (isObject(c)) {
            return Object.keys(c).filter(k => c[k]).join(' ');
        }
        return c;
    }).filter(k => k).join(' ');
};

export default cs;
