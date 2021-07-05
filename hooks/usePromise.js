import {useReducer, useCallback} from 'react';

const initialState = {
    loading: false,
    error: false,
    result: null,
};

const usePromise = (fn, {isLazy=True}, initialParams) => {

    const [state, dispatch] = useReducer((state, action) => {
        switch(action.type) {
        case 'PENDING':
            return {...initialState, loading: true};
        case 'RESOLVED':
            return {...initialState, result: action.result};
        case 'REJECTED':
            return {...initialState, error: action.error};
        default:
            return state;
        }
    }, initialState);

    const trigger = useCallback(async (...args) => {
        dispatch({type: 'PENDING'});
        try {
            const result = await fn(...args);
            dispatch({type: 'RESOLVED', result});
            return result;
        } catch (err) {
            dispatch({type: 'REJECTED', err});
            throw err;
        }
    }, [fn, options]);

    if(!isLazy) {
        trigger(...initialParams);
    }

    return [state, trigger];
};

export default usePromise;
