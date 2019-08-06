import { isObject } from './utils';
export default (...classes) => {
    return classes.filter(
        c => !!c
    ).map(c => {
        if(isObject(c)) 
            return Object.keys(c).filter(k => c[k]).join(' ');
        return c;
    }).join(' ');
};
