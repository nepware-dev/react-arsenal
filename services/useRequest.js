import {useReducer, useCallback} from 'react';

const initialState = {
  loading: false,
  error: false,
  data: null, //TODO: add request too
};

const useRequest = (fn, options) => {

  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case 'FETCHING':
        return {...initialState, loading: true};
      case 'FETCHED':
        return {...initialState, data: action.data};
      case 'FETCH_ERROR':
        return {...initialState, error: action.error};
      default:
        return state;
    }
  }, initialState);

  const callApi = useCallback(async (...args) => {

    const context = this;

    dispatch({type: 'FETCHING'});
    try {
      const data = await fn(...args);
      dispatch({type: 'FETCHED', data});
      return data;
    } catch (err) {
      dispatch({type: 'FETCH_ERROR', err});
      throw err;
    }
  }, [fn, options]);

  return [state, callApi];
};

export default useRequest;
