import {useState, useEffect} from 'react';

import fetcher from './fetcher';

const useRequest = (url, options) => {
  const [state, setState] = useState({
    loading: false,
    error: false,
    data: null,
    request: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState({...state, loading: true});
        const {error, data, response} = await fetcher(url, options);
        setState({...state, loading: false, error, data, response});
      } catch (error) {
        setState({...state, loading: false, error});
      }
    };
    fetchData();
  }, []);
  return state;
};

export default useRequest;
